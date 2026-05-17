from __future__ import annotations

import hashlib
import json
import os
import subprocess
from pathlib import Path

import numpy as np
import pandas as pd


FEATURE_HASH_COLS: tuple[str, ...] = (
    "domain",
    "sample_date",
    "county",
    "e_coli",
    "intestinal_enterococci",
    "coliforms",
    "ph",
    "turbidity",
    "color",
    "iron",
    "manganese",
    "ammonium",
    "chloride",
    "conductivity",
    "nitrate",
    "nitrite",
    "oxidisability",
    "hardness",
    "sulphate",
    "odor",
    "taste",
    "temperature",
    "pseudomonas",
    "clostridium_perfringens",
    "free_chlorine",
    "combined_chlorine",
)


def git_sha(root: Path) -> str | None:
    """Короткий SHA HEAD-коммита репозитория (для привязки snapshot к коду)."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short=12", "HEAD"],
            cwd=root,
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (FileNotFoundError, OSError):
        pass
    return os.environ.get("GITHUB_SHA", "")[:12] or None


def model_version(map_only: bool, git_sha_value: str | None) -> str:
    """Версия, идентифицирующая набор обученных моделей в этом снимке."""
    if map_only:
        return "map-only"
    return f"citizen-2026.{git_sha_value}" if git_sha_value else "citizen-2026.unknown"


def feature_hash_for_row(row: pd.Series) -> str:
    """Детерминированный sha256 по канонизированному feature-вектору строки."""
    items: list[tuple[str, object]] = []
    for col in FEATURE_HASH_COLS:
        if col not in row.index:
            items.append((col, None))
            continue
        value = row[col]
        if value is None or (isinstance(value, float) and np.isnan(value)) or pd.isna(value):
            items.append((col, None))
        elif isinstance(value, pd.Timestamp):
            items.append((col, value.isoformat()))
        elif isinstance(value, (int, bool, str)):
            items.append((col, value if not isinstance(value, bool) else int(value)))
        elif isinstance(value, (float, np.floating)):
            items.append((col, repr(float(value))))
        else:
            items.append((col, str(value)))
    payload = json.dumps(items, ensure_ascii=False, sort_keys=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def prediction_id_for_snapshot(snapshot_generated_at: str, loc_key: str, feature_hash: str) -> str:
    """Стабильный ID: один и тот же ввод в один и тот же снимок → один и тот же ID."""
    key = f"{snapshot_generated_at}|{loc_key}|{feature_hash}".encode("utf-8")
    return hashlib.sha256(key).hexdigest()[:32]


def build_latest_places_and_history(
    full: pd.DataFrame,
    map_domains: set[str],
    *,
    normalize_location_key,
    row_measurements,
) -> tuple[pd.DataFrame, dict[str, list[dict]], int]:
    """Return latest-per-place rows, capped history index, and dedupe count."""
    working = full.copy()
    working["sample_date"] = pd.to_datetime(working["sample_date"], errors="coerce")
    working = working.sort_values("sample_date")
    working["_loc_key"] = working.apply(
        lambda row: normalize_location_key(str(row.get("location", "") or ""), str(row.get("domain", "") or "")),
        axis=1,
    )

    latest_idx = working.groupby(["domain", "_loc_key"], sort=False).tail(1).index
    latest = working.loc[latest_idx].copy()
    latest = latest[latest["domain"].isin(map_domains)]

    n_dedup = len(working[working["domain"].isin(map_domains)].groupby(["domain", "location"])) - len(latest)

    history_index: dict[str, list[dict]] = {}
    latest_idx_set = set(latest_idx)
    full_in_domains = working[working["domain"].isin(map_domains)]
    for row_idx, row in full_in_domains.iterrows():
        if row_idx in latest_idx_set:
            continue
        loc_key = str(row.get("_loc_key", ""))
        if not loc_key:
            continue
        sample_date = row.get("sample_date")
        compliant_raw = row.get("compliant")
        compliant_val: int | None = None
        if pd.notna(compliant_raw):
            try:
                compliant_val = int(compliant_raw)
            except (TypeError, ValueError):
                pass
        entry: dict = {
            "sample_date": sample_date.isoformat() if pd.notna(sample_date) else None,
            "official_compliant": compliant_val,
            "measurements": row_measurements(row),
        }
        history_index.setdefault(loc_key, []).append(entry)
    for key in history_index:
        history_index[key].sort(key=lambda item: str(item.get("sample_date") or ""), reverse=True)
        history_index[key] = history_index[key][:30]
    return latest, history_index, n_dedup


def build_place_row(
    row: pd.Series,
    *,
    loc_name: str,
    county_out: str | None,
    lat: float,
    lon: float,
    coord_source: str,
    geocode_matched: str | None,
    sample_history: list[dict],
    model_version_value: str,
    snapshot_generated_at: str,
    place_kind_map: dict[str, str],
    row_measurements,
    uncertainty_metadata: dict | None = None,
) -> dict:
    """Build one published snapshot place record from a fully-resolved row."""
    domain = str(row["domain"])
    loc_key_val = row.get("_loc_key", "")
    feat_hash = feature_hash_for_row(row)
    pred_id = prediction_id_for_snapshot(snapshot_generated_at, str(loc_key_val), feat_hash)
    sample_id = None
    if "sample_id" in row.index and pd.notna(row.get("sample_id")):
        sample_id = str(row["sample_id"]).strip() or None

    row_out = {
        "location": loc_name,
        "domain": domain,
        "place_kind": place_kind_map.get(domain, "other"),
        "county": county_out,
        "sample_date": row["sample_date"].isoformat() if pd.notna(row["sample_date"]) else None,
        "official_compliant": int(row["compliant"]),
        "measurements": row_measurements(row),
        "sample_history": sample_history,
        "lat": lat,
        "lon": lon,
        "coord_source": coord_source,
        "prediction_id": pred_id,
        "feature_hash": feat_hash,
        "model_version": model_version_value,
        "created_at": snapshot_generated_at,
    }
    if geocode_matched:
        row_out["geocode_matched_address"] = geocode_matched
    if "model_violation_prob" in row.index and pd.notna(row.get("model_violation_prob")):
        row_out["model_violation_prob"] = float(row["model_violation_prob"])
    for prob_col in ("lr_violation_prob", "rf_violation_prob", "gb_violation_prob", "lgbm_violation_prob"):
        if prob_col in row.index and pd.notna(row.get(prob_col)):
            row_out[prob_col] = float(row[prob_col])
    if sample_id:
        row_out["sample_id"] = sample_id
    if uncertainty_metadata:
        row_out.update(uncertainty_metadata)
    return row_out


def build_snapshot_document(
    *,
    snapshot_generated_at: str,
    data_fetched_at: str,
    model_trained_at: str | None,
    model_version_value: str,
    git_sha_value: str | None,
    map_domains: list[str],
    domain_source_status: dict,
    loaded_domains: set[str],
    include_mineraalvesi: bool,
    coord_overrides: dict[str, dict],
    overridden_rows: int,
    hidden_rows: int,
    rows_out: list[dict],
    has_model_predictions: bool,
    lgbm_available: bool,
    opendata_catalog_url: str,
    uncertainty_summary: dict | None = None,
) -> dict:
    """Build the snapshot envelope around already-prepared place rows."""
    available_models: list[str] = []
    if has_model_predictions:
        available_models = ["lr", "rf", "gb"]
        if lgbm_available:
            available_models.append("lgbm")

    base_disclaimer = (
        "Официальный статус — по полю vastavus в данных Terviseamet. "
        "Координаты: при наличии — из справочников opendata Terviseamet (EPSG:3301→WGS84), см. coord_source terviseamet_*; "
        "иначе при --resolve-coordinates или простом режиме с лимитом — Google Geocoding. "
        "coord_source=google|geocode_cache (в старых снимках возможны geoapify/opencage) — привязка к найденному адресу (см. geocode_matched_address в точке); "
        "county_centroid — центроид уезда; approximate_ee — только визуальный разброс по bbox Эстонии, не место объекта."
    )
    model_note = (
        " Прогнозы моделей (lr/rf/gb/lgbm_violation_prob) — оценки отдельных ML-моделей"
        " (Logistic Regression, Random Forest, Gradient Boosting, LightGBM),"
        " не замена официальной оценке Terviseamet."
        if has_model_predictions
        else " Прогноз моделей в этом снимке не включён; пересоберите без --map-only для слоя модели на карте."
    )

    return {
        "generated_at": snapshot_generated_at,
        "data_fetched_at": data_fetched_at,
        "model_trained_at": model_trained_at,
        "model_version": model_version_value,
        "git_sha": git_sha_value,
        "feature_hash_columns": list(FEATURE_HASH_COLS),
        "has_model_predictions": has_model_predictions,
        "available_models": available_models,
        "model_labels": {
            "lr": "Logistic Regression",
            "rf": "Random Forest",
            "gb": "Gradient Boosting",
            "lgbm": "LightGBM",
        },
        "data_catalog_url": opendata_catalog_url,
        "map_domains": map_domains,
        "source_domain_status": domain_source_status,
        "mineraalvesi_status": {
            "requested": bool(include_mineraalvesi),
            "loaded": "mineraalvesi" in loaded_domains,
            "reason": (
                "ok"
                if "mineraalvesi" in loaded_domains
                else ("not_requested" if not include_mineraalvesi else "no_rows_or_source_unavailable")
            ),
        },
        "place_kinds": {
            "swimming": "Открытая вода (купальные места)",
            "pool_spa": "Бассейн / СПА / ujula",
            "drinking_water": "Питьевая вода (водопровод, точка сети)",
            "drinking_source": "Питьевая вода (источник / родник, joogiveeallikas)",
            "other": "Прочее",
        },
        "disclaimer": base_disclaimer + model_note,
        "coordinate_override_stats": {
            "overrides_loaded": len(coord_overrides),
            "manual_applied": overridden_rows,
            "hidden_applied": hidden_rows,
        },
        "uncertainty_summary": uncertainty_summary or {},
        "places": rows_out,
    }
