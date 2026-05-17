#!/usr/bin/env python3
"""
Собрать snapshot для гражданского приложения: последняя проба по (domain, location),
официальный compliant, вероятности нарушения по 4 моделям (LR, RF, GradBoost, LightGBM), координаты.

Координаты в файлах *_veeproovid_YYYY.xml нет; при load_all/load_domain подтягиваются
официальные L-EST97→WGS84 из справочников opendata (supluskohad.xml и др.) → official_lat/lon.
Если их нет — простой режим или --resolve-coordinates: Google Geocoding;
кэш coordinate_resolve_cache.json. In-ADS и Nominatim не используются.
--geocode-limit — лимит HTTP-запросов на всю сборку.

Запуск из корня репозитория:
  python citizen-service/scripts/build_citizen_snapshot.py
  python citizen-service/scripts/build_citizen_snapshot.py --resolve-coordinates --geocode-limit 8000 --infer-county
  python citizen-service/scripts/build_citizen_snapshot.py --geocode-limit 300   # простой режим: Google
  python citizen-service/scripts/build_citizen_snapshot.py --map-only
  python citizen-service/scripts/build_citizen_snapshot.py --infer-county
  python citizen-service/scripts/build_citizen_snapshot.py --log-level DEBUG  # подробный лог геокода/кэша

Требует: скачанные XML (python src/data_loader.py) и зависимости из requirements.txt.
Для полного снимка также нужен joblib (модели пишутся в artifacts/citizen_model.joblib).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import re
import sys
import time
from pathlib import Path

import requests

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import RobustScaler

# корень репозитория: .../water-quality-ee
ROOT = Path(__file__).resolve().parents[2]

# src/ — модули доступны после `pip install -e .` (см. CLAUDE.md).
# Fallback для запуска без editable install.
_SRC = ROOT / "src"
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from data_loader import load_all  # noqa: E402
from audit.publication_uncertainty import (  # noqa: E402
    build_place_uncertainty_metadata,
    summarize_place_uncertainty,
)
from features import (  # noqa: E402
    META_EXTRA_NUMERIC,
    build_citizen_meta_frame,
    build_dataset_with_meta,
)

# citizen-service/ содержит вспомогательные модули (не часть пакета src/).
_CS_DIR = ROOT / "citizen-service"
if str(_CS_DIR) not in sys.path:
    sys.path.insert(0, str(_CS_DIR))

from county_centroids import COUNTY_CENTROIDS, county_to_latlon  # noqa: E402
import geocode_resolve as _geocode_resolve  # noqa: E402
from snapshot_address_index import (  # noqa: E402
    build_paged_address_index as _build_paged_address_index,
    fetch_tab_rows as _fetch_tab_rows_impl,
    last_page_from_html as _last_page_from_html_impl,
    load_coordinate_overrides as _load_coordinate_overrides,
    load_geocode_cache as _load_geocode_cache,
    save_geocode_cache as _save_geocode_cache,
    text_norm as _text_norm_impl,
)
from snapshot_publish import (  # noqa: E402
    build_latest_places_and_history as _build_latest_places_and_history,
    build_place_row as _build_place_row,
    build_snapshot_document as _build_snapshot_document,
    git_sha as _git_sha,
    model_version as _model_version,
)
from snapshot_coordinates import (  # noqa: E402
    geocode_address_simple as _geocode_address_simple,
    persist_coordinate_caches as _persist_coordinate_caches,
    resolve_place_coordinates as _resolve_place_coordinates,
    resolve_place_county as _resolve_place_county,
)

ARTIFACTS = ROOT / "citizen-service" / "artifacts"
GEOCODE_PATH = ROOT / "citizen-service" / "data" / "geocode_cache.json"
COORD_RESOLVE_PATH = ROOT / "citizen-service" / "data" / "coordinate_resolve_cache.json"
COORD_OVERRIDES_PATH = ROOT / "citizen-service" / "data" / "coordinate_overrides.json"
PAGED_ADDR_CACHE_PATH = ROOT / "citizen-service" / "data" / "paged_address_cache.json"

LOG = logging.getLogger("citizen.snapshot")


def _load_repo_dotenv() -> None:
    """Подхватить корневой .env (не в git). Явные переменные окружения не перезаписываем."""
    path = ROOT / ".env"
    if not path.is_file():
        return
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv(path, override=False)


def _prefer_certifi_ca_bundle() -> None:
    """На части WSL/корпоративных Linux системный CA-пакет пустой — requests/geopy падают по SSL."""
    if os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE"):
        return
    try:
        import certifi

        bundle = certifi.where()
    except ImportError:
        return
    os.environ.setdefault("SSL_CERT_FILE", bundle)
    os.environ.setdefault("REQUESTS_CA_BUNDLE", bundle)
# Точки на карте по умолчанию: купание, бассейны/СПА, водопровод, источники питьевой воды.
# Mineraalvesi можно включить флагом --include-mineraalvesi без изменения дефолта.
BASE_MAP_DOMAINS = {"supluskoha", "basseinid", "veevark", "joogivesi"}
OPENDATA_CATALOG_URL = "https://vtiav.sm.ee/index.php/opendata/"

PLACE_KIND = {
    "supluskoha": "swimming",
    "basseinid": "pool_spa",
    "veevark": "drinking_water",
    "joogivesi": "drinking_source",
    "mineraalvesi": "drinking_water",
}

# Для этих доменов не шлём name-only геокодинг:
# только адрес из paged-таблиц vtiav (U/JV), иначе без HTTP-запроса.
STRICT_PAGED_ADDRESS_ONLY_DOMAINS = {"veevark", "basseinid"}
_COUNTY_ADDR_RE = re.compile(r"\b([A-ZÕÄÖÜa-zõäöü\-]+(?:\s+[A-ZÕÄÖÜa-zõäöü\-]+)*)\s+maakond\b", re.IGNORECASE)


def _normalize_location_key(name: str, domain: str) -> str:
    """
    Нормализованный ключ названия места для дедупликации.

    Terviseamet переименовывал объекты между годами в opendata XML, например:
      'Harku järve supluskoht' → 'Harku järve rand'
      'Abja-Paluoja  veevärk'  → 'Abja-Paluoja veevärk'  (лишний пробел)
      'Haaslava küla veevärk'  → 'Haaslava küla ühisveevärk'
      'Tootsi Ujumisbassein'   → 'Tootsi ujumisbassein'   (регистр)

    Алгоритм: нижний регистр → убрать суффиксы домена → нормализовать пунктуацию/пробелы.
    Два названия с одинаковым ключом в одном домене считаются одним местом;
    берётся запись с более свежей датой пробы.
    """
    import re as _re
    n = name.lower().strip()
    # Суффиксы купальных мест (менялись между годами)
    n = _re.sub(r"\bsupluskoht\b", "", n)
    n = _re.sub(r"\bsupluskoha\b", "", n)
    n = _re.sub(r"\brand\b", "", n)
    n = _re.sub(r"\bsuplusala\b", "", n)
    # Суффиксы водопровода
    n = _re.sub(r"\bühistveevärk\b", "", n)
    n = _re.sub(r"\bühisveevärk\b", "", n)
    n = _re.sub(r"\bveevärk\b", "", n)
    n = _re.sub(r"\bveevõrk\b", "", n)
    n = _re.sub(r"\bveevork\b", "", n)
    # Нормализация пунктуации и пробелов
    n = _re.sub(r"[-–—]+", " ", n)
    n = _re.sub(r"[,;]+", " ", n)
    n = _re.sub(r"\s+", " ", n).strip()
    return f"{domain}|{n}"


def _extract_county_from_address(addr: str | None) -> str | None:
    if not addr:
        return None
    m = _COUNTY_ADDR_RE.search(str(addr))
    if not m:
        return None
    base = " ".join((m.group(1) or "").split()).strip()
    if not base:
        return None
    return f"{base} maakond"


def _nearest_county_from_coords(lat: float | None, lon: float | None) -> str | None:
    if lat is None or lon is None:
        return None
    try:
        lt = float(lat)
        ln = float(lon)
    except (TypeError, ValueError):
        return None
    if not np.isfinite(lt) or not np.isfinite(ln):
        return None
    best_name: str | None = None
    best_d2: float | None = None
    for nm, (clat, clon) in COUNTY_CENTROIDS.items():
        d2 = (lt - float(clat)) ** 2 + (ln - float(clon)) ** 2
        if best_d2 is None or d2 < best_d2:
            best_d2 = d2
            best_name = nm
    if not best_name:
        return None
    return " ".join(str(best_name).split()).strip().title()


def _d2_to_county_centroid(lat: float, lon: float, county_name: str) -> float | None:
    """Squared Euclidean distance from (lat, lon) to the centroid of *county_name*."""
    key = " ".join(county_name.strip().lower().split())
    if key not in COUNTY_CENTROIDS:
        if "maakond" not in key:
            key = f"{key} maakond"
    centroid = COUNTY_CENTROIDS.get(key)
    if centroid is None:
        return None
    clat, clon = centroid
    return (lat - float(clat)) ** 2 + (lon - float(clon)) ** 2


def _validate_county_against_coords(
    county: str,
    lat: float,
    lon: float,
) -> str | None:
    """Return a corrected county if *county* is clearly wrong for (lat, lon).

    Uses a conservative heuristic: the claimed county's centroid must be
    at least 4× farther than the nearest county's centroid.  This catches
    obvious XML data-entry errors (e.g. Valga for a Tallinn location) while
    avoiding false corrections near county borders.

    Returns the corrected county name or None if the original looks fine.
    """
    nearest = _nearest_county_from_coords(lat, lon)
    if not nearest:
        return None
    if nearest.strip().lower() == county.strip().lower():
        return None
    d2_claimed = _d2_to_county_centroid(lat, lon, county)
    d2_nearest = _d2_to_county_centroid(lat, lon, nearest)
    if d2_claimed is None or d2_nearest is None or d2_nearest == 0:
        return None
    if d2_claimed > 4 * d2_nearest:
        return nearest
    return None

# Kui pole Nominatimi ega maakonda: stabiilne punkt EE bbox-is (pole GPS, ainult ülevaade).
EE_BBOX_LAT = (57.48, 59.68)
EE_BBOX_LON = (21.65, 28.22)


def approximate_point_estonia(domain: str, location: str) -> tuple[float, float]:
    """
    Deterministic pseudo-coordinates inside Estonia bounding box.
    Avoids a single mega-cluster at one centroid; still NOT real object coordinates.
    """
    payload = f"{domain}\n{location}".encode("utf-8")
    digest = hashlib.sha256(payload).digest()
    u = int.from_bytes(digest[0:8], "big") / (2**64)
    v = int.from_bytes(digest[8:16], "big") / (2**64)
    lat0 = EE_BBOX_LAT[0] + u * (EE_BBOX_LAT[1] - EE_BBOX_LAT[0])
    lon0 = EE_BBOX_LON[0] + v * (EE_BBOX_LON[1] - EE_BBOX_LON[0])
    du = (digest[16] / 255.0 - 0.5) * 0.08
    dv = (digest[17] / 255.0 - 0.5) * 0.12
    return lat0 + du, lon0 + dv


def load_geocode_cache() -> dict:
    return _load_geocode_cache(GEOCODE_PATH)


def save_geocode_cache(cache: dict) -> None:
    _save_geocode_cache(GEOCODE_PATH, cache)


def _text_norm(s: str) -> str:
    return _text_norm_impl(s)


def _last_page_from_html(page_html: str, tab_id: str) -> int:
    return _last_page_from_html_impl(page_html, tab_id)


def _fetch_tab_rows(session: requests.Session, tab_id: str) -> list[dict]:
    return _fetch_tab_rows_impl(session, tab_id)


def build_paged_address_index(session: requests.Session, use_cache: bool = True) -> dict[str, str]:
    """
    Собрать индекс адресов из публичных paged-страниц:
    - U: bassein (название бассейна) -> Asukoht
    - JV: veevark (название сети) -> Tegutsemise piirkond
    """
    return _build_paged_address_index(
        session,
        use_cache=use_cache,
        paged_addr_cache_path=PAGED_ADDR_CACHE_PATH,
        normalize_location_key=_normalize_location_key,
        log=LOG,
    )


def load_coordinate_overrides() -> dict[str, dict]:
    """
    Загрузить ручные оверрайды координат.

    Формат файла citizen-service/data/coordinate_overrides.json:
    {
      "version": 1,
      "items": [
        {"domain": "veevark", "location": "X", "action": "set_manual", "lat": 58.1, "lon": 25.2},
        {"domain": "veevark", "location": "Y", "action": "hide", "note": "..."}
      ]
    }
    """
    return _load_coordinate_overrides(
        COORD_OVERRIDES_PATH,
        normalize_location_key=_normalize_location_key,
        log=LOG,
    )


def _serialize_measurement_value(val) -> float | int | str | None:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    try:
        f = float(val)
    except (TypeError, ValueError):
        return str(val)
    if abs(f) < 1e12 and f == int(f):
        return int(f)
    return round(f, 5)


def row_measurements(row: pd.Series) -> dict[str, float | int | str]:
    """Ненулевые измерения из последней пробы для всплывающей карточки."""
    out: dict[str, float | int | str] = {}
    for k in META_EXTRA_NUMERIC:
        if k not in row.index:
            continue
        v = _serialize_measurement_value(row[k])
        if v is not None:
            out[k] = v
    return out


def build_latest_places_and_history(
    full: pd.DataFrame,
    map_domains: set[str],
) -> tuple[pd.DataFrame, dict[str, list[dict]], int]:
    return _build_latest_places_and_history(
        full,
        map_domains,
        normalize_location_key=_normalize_location_key,
        row_measurements=row_measurements,
    )


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
    model_version: str,
    snapshot_generated_at: str,
) -> dict:
    return _build_place_row(
        row,
        loc_name=loc_name,
        county_out=county_out,
        lat=lat,
        lon=lon,
        coord_source=coord_source,
        geocode_matched=geocode_matched,
        sample_history=sample_history,
        model_version_value=model_version,
        snapshot_generated_at=snapshot_generated_at,
        place_kind_map=PLACE_KIND,
        row_measurements=row_measurements,
        uncertainty_metadata=build_place_uncertainty_metadata(row),
    )


def build_snapshot_document(
    *,
    snapshot_generated_at: str,
    data_fetched_at: str,
    model_trained_at: str | None,
    model_version: str,
    git_sha: str | None,
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
) -> dict:
    return _build_snapshot_document(
        snapshot_generated_at=snapshot_generated_at,
        data_fetched_at=data_fetched_at,
        model_trained_at=model_trained_at,
        model_version_value=model_version,
        git_sha_value=git_sha,
        map_domains=map_domains,
        domain_source_status=domain_source_status,
        loaded_domains=loaded_domains,
        include_mineraalvesi=include_mineraalvesi,
        coord_overrides=coord_overrides,
        overridden_rows=overridden_rows,
        hidden_rows=hidden_rows,
        rows_out=rows_out,
        has_model_predictions=has_model_predictions,
        lgbm_available=lgbm_available,
        opendata_catalog_url=OPENDATA_CATALOG_URL,
        uncertainty_summary=summarize_place_uncertainty(rows_out),
    )


def _clean_optional_text(value) -> str:
    if isinstance(value, float) and pd.isna(value):
        return ""
    return str(value or "").strip()


def resolve_place_coordinates(
    row: pd.Series,
    *,
    resolve_coordinates: bool,
    geocode_limit: int,
    cache: dict,
    resolve_cache: dict,
    session: requests.Session,
    google_key: str | None,
    paged_addr_index: dict[str, str],
    coord_overrides: dict[str, dict],
    budget_remain: list[int],
    api_calls: int,
    log: logging.Logger,
    place_index: int,
    total_places: int,
) -> dict:
    return _resolve_place_coordinates(
        row,
        resolve_coordinates=resolve_coordinates,
        geocode_limit=geocode_limit,
        cache=cache,
        resolve_cache=resolve_cache,
        session=session,
        google_key=google_key,
        paged_addr_index=paged_addr_index,
        coord_overrides=coord_overrides,
        budget_remain=budget_remain,
        api_calls=api_calls,
        log=log,
        place_index=place_index,
        total_places=total_places,
        normalize_location_key=_normalize_location_key,
        clean_optional_text=_clean_optional_text,
        strict_paged_address_only_domains=STRICT_PAGED_ADDRESS_ONLY_DOMAINS,
        geocode_resolve_module=_geocode_resolve,
        geocode_address_simple_fn=geocode_address_simple,
        county_to_latlon=county_to_latlon,
        approximate_point_estonia=approximate_point_estonia,
    )


def resolve_place_county(
    *,
    county: str | None,
    lat: float,
    lon: float,
    coord_source: str,
    geocode_matched: str | None,
) -> str | None:
    return _resolve_place_county(
        county=county,
        lat=lat,
        lon=lon,
        coord_source=coord_source,
        geocode_matched=geocode_matched,
        extract_county_from_address=_extract_county_from_address,
        nearest_county_from_coords=_nearest_county_from_coords,
        validate_county_against_coords=_validate_county_against_coords,
    )


def train_models_and_attach_probabilities(
    df: pd.DataFrame,
    *,
    timer_start: float,
    timer_last: list[float],
) -> tuple[pd.DataFrame, pd.DataFrame, dict]:
    """Train the citizen snapshot model bundle and attach probabilities to meta rows."""
    X, y, meta = build_dataset_with_meta(df)
    _timer_print(
        "2) build_dataset_with_meta — инженерия признаков + X, y, meta (~все строки)",
        timer_start,
        timer_last,
    )
    meta = meta.reset_index(drop=True)
    X = X.reset_index(drop=True)
    y = y.reset_index(drop=True)
    full = meta.copy()

    imputer = SimpleImputer(strategy="median")
    X_imp = imputer.fit_transform(X)
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X_imp)
    _timer_print("3) SimpleImputer(median) + RobustScaler fit_transform", timer_start, timer_last)

    lr = LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
        random_state=42,
    )
    lr.fit(X_scaled, y)
    full["lr_violation_prob"] = lr.predict_proba(X_scaled)[:, 0]
    _timer_print("4a) LogisticRegression.fit", timer_start, timer_last)

    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=14,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_imp, y)
    full["rf_violation_prob"] = clf.predict_proba(X_imp)[:, 0]
    full["model_violation_prob"] = full["rf_violation_prob"]
    _timer_print("4b) RandomForestClassifier.fit (120 деревьев)", timer_start, timer_last)

    w_map = {0: len(y) / (2 * (y == 0).sum()), 1: len(y) / (2 * (y == 1).sum())}
    sw = np.array([w_map[c] for c in y])
    gb = GradientBoostingClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        random_state=42,
    )
    gb.fit(X_scaled, y, sample_weight=sw)
    full["gb_violation_prob"] = gb.predict_proba(X_scaled)[:, 0]
    _timer_print("4c) GradientBoostingClassifier.fit (200 деревьев)", timer_start, timer_last)

    lgbm_clf = None
    try:
        import lightgbm as lgb  # noqa: PLC0415

        lgbm_clf = lgb.LGBMClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            num_leaves=63,
            min_child_samples=20,
            subsample=0.8,
            colsample_bytree=0.8,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
            verbose=-1,
        )
        lgbm_clf.fit(X_imp, y)
        full["lgbm_violation_prob"] = lgbm_clf.predict_proba(X_imp)[:, 0]
        full["model_violation_prob"] = full["lgbm_violation_prob"]
        _timer_print("4d) LGBMClassifier.fit (300 деревьев)", timer_start, timer_last)
    except (ImportError, OSError) as exc:
        print(
            "[citizen] lightgbm недоступен — lgbm_violation_prob не будет в снимке; "
            f"model_violation_prob остаётся RF ({exc})"
        )

    _timer_print("5) predict_proba всех моделей → violation_prob в full DataFrame", timer_start, timer_last)

    bundle = {
        "imputer": imputer,
        "scaler": scaler,
        "clf_lr": lr,
        "clf_rf": clf,
        "clf_gb": gb,
        "clf_lgbm": lgbm_clf,
        "clf": clf,
        "feature_columns": list(X.columns),
        "models": ["lr", "rf", "gb"] + (["lgbm"] if lgbm_clf is not None else []),
    }
    return full, X, bundle


def save_model_bundle(bundle: dict, *, timer_start: float, timer_last: list[float]) -> None:
    """Persist the trained citizen model bundle."""
    joblib.dump(bundle, ARTIFACTS / "citizen_model.joblib")
    LOG.info("Модели записаны: %s (%s)", ARTIFACTS / "citizen_model.joblib", bundle["models"])
    _timer_print("8) joblib.dump(imputer + scaler + 4 clf) → citizen_model.joblib", timer_start, timer_last)


def build_snapshot_place_rows(
    latest: pd.DataFrame,
    *,
    resolve_coordinates: bool,
    geocode_limit: int,
    cache: dict,
    resolve_cache: dict,
    session: requests.Session,
    google_key: str | None,
    paged_addr_index: dict[str, str],
    coord_overrides: dict[str, dict],
    budget_remain: list[int],
    progress_every: int,
    history_index: dict[str, list[dict]],
    model_version: str,
    snapshot_generated_at: str,
    log: logging.Logger,
) -> dict:
    """Build published per-place rows from latest samples."""
    api_calls = 0
    rows_out: list[dict] = []
    hidden_rows = 0
    overridden_rows = 0
    n_map = len(latest)

    for idx, (_, row) in enumerate(latest.iterrows(), start=1):
        resolved = resolve_place_coordinates(
            row,
            resolve_coordinates=resolve_coordinates,
            geocode_limit=geocode_limit,
            cache=cache,
            resolve_cache=resolve_cache,
            session=session,
            google_key=google_key,
            paged_addr_index=paged_addr_index,
            coord_overrides=coord_overrides,
            budget_remain=budget_remain,
            api_calls=api_calls,
            log=log,
            place_index=idx,
            total_places=n_map,
        )
        api_calls = int(resolved["api_calls"])
        if resolved["hidden"]:
            hidden_rows += 1
            continue
        if resolved["overridden"]:
            overridden_rows += 1

        loc_name = str(resolved["loc_name"])
        domain = str(resolved["domain"])
        lat = float(resolved["lat"])
        lon = float(resolved["lon"])
        coord_source = str(resolved["coord_source"])
        geocode_matched = resolved["geocode_matched"]
        county_out = resolve_place_county(
            county=resolved["county"],
            lat=lat,
            lon=lon,
            coord_source=coord_source,
            geocode_matched=geocode_matched,
        )
        if county_out and resolved["county"] and county_out != resolved["county"] and coord_source not in ("county_centroid", "approximate_ee", "none"):
            log.warning(
                "County mismatch: %s/%s had '%s' but coords (%.4f, %.4f) → '%s'; correcting",
                domain,
                loc_name,
                resolved["county"],
                lat,
                lon,
                county_out,
            )

        loc_key_val = row.get("_loc_key", "")
        sample_history = history_index.get(str(loc_key_val), [])
        row_out = build_place_row(
            row,
            loc_name=loc_name,
            county_out=county_out,
            lat=lat,
            lon=lon,
            coord_source=coord_source,
            geocode_matched=geocode_matched,
            sample_history=sample_history,
            model_version=model_version,
            snapshot_generated_at=snapshot_generated_at,
        )
        rows_out.append(row_out)
        if idx == 1 or idx % progress_every == 0 or idx == n_map:
            log.info(
                "Прогресс карты: место %s/%s; HTTP-бюджет осталось=%s; последний coord_source=%s domain=%s",
                idx,
                n_map,
                budget_remain[0] if resolve_coordinates else "—",
                coord_source,
                domain,
            )

    return {
        "rows_out": rows_out,
        "api_calls": api_calls,
        "hidden_rows": hidden_rows,
        "overridden_rows": overridden_rows,
        "n_map": n_map,
    }


def persist_coordinate_caches(
    *,
    resolve_coordinates: bool,
    geocode_limit: int,
    api_calls: int,
    budget_remain: list[int],
    cache: dict,
    resolve_cache: dict,
) -> None:
    _persist_coordinate_caches(
        resolve_coordinates=resolve_coordinates,
        geocode_limit=geocode_limit,
        api_calls=api_calls,
        budget_remain=budget_remain,
        cache=cache,
        resolve_cache=resolve_cache,
        geocode_path=GEOCODE_PATH,
        coord_resolve_path=COORD_RESOLVE_PATH,
        save_geocode_cache_fn=save_geocode_cache,
        geocode_resolve_module=_geocode_resolve,
        log=LOG,
    )


def geocode_address_simple(
    query: str,
    cache: dict,
    session: requests.Session,
    *,
    google_key: str | None,
    http_budget: int,
) -> tuple[float | None, float | None, str | None, int]:
    return _geocode_address_simple(
        query,
        cache,
        session,
        google_key=google_key,
        http_budget=http_budget,
        geocode_resolve_module=_geocode_resolve,
        log=LOG,
    )


def _timer_print(label: str, t_run_start: float, last: list[float]) -> None:
    now = time.perf_counter()
    step = now - last[0]
    total = now - t_run_start
    msg = f"[citizen/timer] {label}: {step:.2f}s (шаг), {total:.2f}s (с начала)"
    print(msg, flush=True)
    LOG.info("%s", msg)
    last[0] = now


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--geocode-limit",
        type=int,
        default=0,
        help="лимит новых HTTP к внешним геокодерам на сборку (простой режим и --resolve-coordinates)",
    )
    ap.add_argument("--no-cache-xml", action="store_true", help="перекачать XML (load_all use_cache=False)")
    ap.add_argument(
        "--map-only",
        action="store_true",
        help="только официальные данные и карта: без Random Forest и без citizen_model.joblib",
    )
    ap.add_argument(
        "--infer-county",
        action="store_true",
        help="дозаполнить county через county_infer (кэш + Google Geocoding; медленнее, точнее карта)",
    )
    ap.add_argument(
        "--resolve-coordinates",
        action="store_true",
        help="Google Geocoding по вариантам адреса; --geocode-limit = лимит HTTP",
    )
    ap.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="уровень логирования (DEBUG — кэш координат в citizen/geocode_resolve; URL с ключами в лог не выводятся)",
    )
    ap.add_argument(
        "--progress-every",
        type=int,
        default=50,
        metavar="N",
        help="каждые N мест на карте писать строку прогресса в лог (и 1-е и последнее всегда)",
    )
    ap.add_argument(
        "--include-mineraalvesi",
        action="store_true",
        help="добавить в сборку домен mineraalvesi (если доступен у источника данных)",
    )
    args = ap.parse_args()
    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        force=True,
    )
    # DEBUG включает urllib3 — в лог попадают полные URL с ?key=… (утечка ключа).
    for _lg_name in ("urllib3", "urllib3.connectionpool", "urllib3.util.retry", "charset_normalizer"):
        logging.getLogger(_lg_name).setLevel(logging.WARNING)
    if args.log_level.upper() == "DEBUG":
        LOG.warning(
            "Уровень DEBUG: логи urllib3 отключены (WARNING), чтобы ключи API не попадали в вывод. "
            "См. geocode_resolve / county_infer для своих DEBUG-сообщений."
        )
    _load_repo_dotenv()
    _prefer_certifi_ca_bundle()

    t_run = time.perf_counter()
    last = [t_run]

    ARTIFACTS.mkdir(parents=True, exist_ok=True)

    map_domains = set(BASE_MAP_DOMAINS)
    if args.include_mineraalvesi:
        map_domains.add("mineraalvesi")
    selected_domains = sorted(map_domains)

    LOG.info(
        "Старт: map_only=%s resolve_coordinates=%s infer_county=%s include_mineraalvesi=%s geocode_limit=%s log_level=%s",
        args.map_only,
        args.resolve_coordinates,
        args.infer_county,
        args.include_mineraalvesi,
        args.geocode_limit,
        args.log_level,
    )

    df = load_all(
        domains=selected_domains,
        use_cache=not args.no_cache_xml,
        geocode_county=args.infer_county,
    )
    loaded_domains = set()
    if "domain" in df.columns:
        loaded_domains = set(str(x) for x in df["domain"].dropna().astype(str).unique().tolist())
    domain_source_status = {
        d: {
            "requested": True,
            "loaded": d in loaded_domains,
            "reason": "ok" if d in loaded_domains else "no_rows_or_source_unavailable",
        }
        for d in selected_domains
    }
    if args.include_mineraalvesi and "mineraalvesi" not in loaded_domains:
        LOG.warning(
            "mineraalvesi был запрошен (--include-mineraalvesi), но не загружен: источник не отдаёт данные или вернул 0 строк"
        )
    if args.infer_county:
        LOG.info("load_all: --infer-county — Google Geocoding для локаций без county в кэше (лимит HTTP снят)")
    _timer_print("1) load_all — загрузка и парсинг XML → DataFrame", t_run, last)
    data_fetched_at = pd.Timestamp.now("UTC").isoformat()

    if args.map_only:
        LOG.info("Режим --map-only: без матрицы X и без обучения моделей (только meta для карты)")
        full = build_citizen_meta_frame(df).reset_index(drop=True)
        model_bundle = None
        _timer_print("2) build_citizen_meta_frame — признаки только для meta (без X)", t_run, last)
    else:
        full, _, model_bundle = train_models_and_attach_probabilities(
            df,
            timer_start=t_run,
            timer_last=last,
        )
    model_trained_at = pd.Timestamp.now("UTC").isoformat() if not args.map_only else None
    latest, _history_index, n_dedup = build_latest_places_and_history(full, map_domains)
    if n_dedup > 0:
        LOG.info("Дедупликация по нормализованному имени: объединено %s дублей (переименования в XML)", n_dedup)
    _n_hist = sum(len(v) for v in _history_index.values())
    LOG.info("История проб: %s записей для %s мест", _n_hist, len(_history_index))

    _timer_print(
        "6) dedupe: последняя проба на (domain, norm_location_key) + фильтр map_domains + history index",
        t_run,
        last,
    )

    # AI Act Art 12: зафиксировать версии до записи строк, чтобы каждая
    # запись несла стабильные prediction_id / model_version / feature_hash.
    snapshot_generated_at = pd.Timestamp.now("UTC").isoformat()
    git_sha = _git_sha(ROOT)
    model_version = _model_version(args.map_only, git_sha)

    cache = load_geocode_cache()
    coord_overrides = load_coordinate_overrides()
    resolve_cache = (
        _geocode_resolve.load_resolve_cache(COORD_RESOLVE_PATH) if args.resolve_coordinates else {}
    )
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "water-quality-ee-citizen-snapshot/1.0 (TalTech water-quality course)",
            "Accept": "application/json",
        }
    )
    paged_addr_index = build_paged_address_index(session, use_cache=not args.no_cache_xml)
    LOG.info("Индекс адресов paged U/JV: %s записей", len(paged_addr_index))
    google_key = ((os.environ.get("GOOGLE_MAPS_GEOCODING_API_KEY") or "").strip() or None)
    budget_remain = [max(0, int(args.geocode_limit))]
    n_map = len(latest)
    LOG.info(
        "Координаты: мест на карте после дедупа=%s; resolve=%s; HTTP-бюджет=%s; Google=%s",
        n_map,
        args.resolve_coordinates,
        args.geocode_limit,
        "да" if google_key else "нет",
    )
    progress_every = max(1, int(args.progress_every))

    place_rows = build_snapshot_place_rows(
        latest,
        resolve_coordinates=args.resolve_coordinates,
        geocode_limit=args.geocode_limit,
        cache=cache,
        resolve_cache=resolve_cache,
        session=session,
        google_key=google_key,
        paged_addr_index=paged_addr_index,
        coord_overrides=coord_overrides,
        budget_remain=budget_remain,
        progress_every=progress_every,
        history_index=_history_index,
        model_version=model_version,
        snapshot_generated_at=snapshot_generated_at,
        log=LOG,
    )
    rows_out = place_rows["rows_out"]
    api_calls = int(place_rows["api_calls"])
    hidden_rows = int(place_rows["hidden_rows"])
    overridden_rows = int(place_rows["overridden_rows"])

    _timer_print(
        f"7) цикл координат по {len(latest)} точкам "
        f"({'resolve: Google' if args.resolve_coordinates else 'Google (simple)'}; "
        f"HTTP остаток лимита: {budget_remain[0] if args.resolve_coordinates else '—'})",
        t_run,
        last,
    )

    persist_coordinate_caches(
        resolve_coordinates=args.resolve_coordinates,
        geocode_limit=args.geocode_limit,
        api_calls=api_calls,
        budget_remain=budget_remain,
        cache=cache,
        resolve_cache=resolve_cache,
    )

    if not args.map_only and model_bundle is not None:
        save_model_bundle(model_bundle, timer_start=t_run, timer_last=last)
    else:
        LOG.info(
            "Режим --map-only: citizen_model.joblib не перезаписан (при необходимости полной модели запустите без --map-only)"
        )

    snapshot = build_snapshot_document(
        snapshot_generated_at=snapshot_generated_at,
        data_fetched_at=data_fetched_at,
        model_trained_at=model_trained_at,
        model_version=model_version,
        git_sha=git_sha,
        map_domains=selected_domains,
        domain_source_status=domain_source_status,
        loaded_domains=loaded_domains,
        include_mineraalvesi=args.include_mineraalvesi,
        coord_overrides=coord_overrides,
        overridden_rows=overridden_rows,
        hidden_rows=hidden_rows,
        rows_out=rows_out,
        has_model_predictions=not args.map_only,
        lgbm_available=bool(model_bundle and model_bundle.get("clf_lgbm") is not None),
    )
    with open(ARTIFACTS / "snapshot.json", "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2)

    _timer_print("9) запись snapshot.json", t_run, last)

    n_pts = len(rows_out)
    by_src: dict[str, int] = {}
    for r in rows_out:
        s = str(r.get("coord_source") or "none")
        by_src[s] = by_src.get(s, 0) + 1
    LOG.info("Итог snapshot: мест=%s; coord_source=%s", n_pts, by_src)
    print(f"[citizen] snapshot: {len(rows_out)} мест, с координатами: {n_pts}")
    print(f"[citizen] записано: {ARTIFACTS / 'snapshot.json'}")
    total_wall = time.perf_counter() - t_run
    print(f"[citizen/timer] ИТОГО wall time: {total_wall:.2f}s", flush=True)
    LOG.info("ИТОГО wall time: %.2fs", total_wall)


if __name__ == "__main__":
    main()
