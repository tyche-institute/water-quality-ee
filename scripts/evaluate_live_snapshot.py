#!/usr/bin/env python3
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import numpy as np
from sklearn.metrics import brier_score_loss, precision_score, recall_score, roc_auc_score


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = ROOT / "frontend" / "public" / "data" / "snapshot.frontend.json"
OUT_JSON = ROOT / "data" / "processed" / "live_snapshot_evaluation.json"
OUT_MD = ROOT / "docs" / "live_snapshot_evaluation.md"

MODEL_FIELDS = {
    "canonical": "model_violation_prob",
    "lr": "lr_violation_prob",
    "rf": "rf_violation_prob",
    "gb": "gb_violation_prob",
    "lgbm": "lgbm_violation_prob",
}


@dataclass(frozen=True)
class SliceSpec:
    key: str
    title: str
    description: str


SLICE_SPECS = (
    SliceSpec("all", "Latest-per-location live slice", "All places in the published latest-per-location snapshot."),
    SliceSpec("recent_90d", "Recent 90-day slice", "Only places whose latest sample date is within the last 90 days."),
    SliceSpec("low_uncertainty", "Low-uncertainty slice", "Places with `uncertainty_level = low`."),
    SliceSpec("high_uncertainty", "High-uncertainty slice", "Places with `uncertainty_level = high` (publication-gap cases)."),
    SliceSpec("hidden_violation", "Hidden-violation slice", "Official violation, but published parameters do not reproduce it."),
    SliceSpec("hidden_pass", "Hidden-pass slice", "Published exceedance, but official label remains compliant."),
    SliceSpec("sparse_coverage", "Sparse published coverage", "Places flagged with sparse published parameter coverage."),
    SliceSpec("abstain_excluded", "Operational slice after abstention", "Places retained if we abstain on `high` uncertainty or missing model probability."),
)


def load_places() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    snapshot = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
    places = snapshot.get("places") or []
    return snapshot, [p for p in places if isinstance(p, dict)]


def parse_sample_date(raw: str | None) -> datetime | None:
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        return None


def latest_sample_floor(places: list[dict[str, Any]], days: int) -> datetime | None:
    dates = [parse_sample_date(p.get("sample_date")) for p in places]
    dates = [dt for dt in dates if dt is not None]
    if not dates:
        return None
    return max(dates) - timedelta(days=days)


def select_slice(places: list[dict[str, Any]], key: str, *, recent_floor: datetime | None) -> list[dict[str, Any]]:
    if key == "all":
        return places
    if key == "recent_90d":
        if recent_floor is None:
            return []
        return [p for p in places if (dt := parse_sample_date(p.get("sample_date"))) is not None and dt >= recent_floor]
    if key == "low_uncertainty":
        return [p for p in places if p.get("uncertainty_level") == "low"]
    if key == "high_uncertainty":
        return [p for p in places if p.get("uncertainty_level") == "high"]
    if key == "hidden_violation":
        return [p for p in places if p.get("audit_bucket") == "hidden_violation"]
    if key == "hidden_pass":
        return [p for p in places if p.get("audit_bucket") == "hidden_pass"]
    if key == "sparse_coverage":
        return [p for p in places if "sparse_published_parameter_coverage" in (p.get("data_quality_flags") or [])]
    if key == "abstain_excluded":
        return [
            p
            for p in places
            if p.get("has_model_prob")
            and p.get("uncertainty_level") != "high"
        ]
    raise ValueError(f"unknown slice: {key}")


def metric_row(places: list[dict[str, Any]], prob_field: str) -> dict[str, Any]:
    scored = [
        p for p in places
        if isinstance(p.get("official_compliant"), int)
        and isinstance(p.get(prob_field), (int, float))
    ]
    n = len(scored)
    labels = [int(p["official_compliant"]) for p in scored]
    probs_violation = [float(p[prob_field]) for p in scored]
    y_violation = [1 if y == 0 else 0 for y in labels]
    out: dict[str, Any] = {
        "n": n,
        "violation_rate": (sum(1 for y in labels if y == 0) / n) if n else None,
        "roc_auc": None,
        "recall_violation": None,
        "precision_violation": None,
        "brier_violation": None,
    }
    if n == 0:
        return out

    preds_violation = [1 if p >= 0.5 else 0 for p in probs_violation]
    if len(set(y_violation)) > 1:
        out["roc_auc"] = float(roc_auc_score(y_violation, probs_violation))
        out["brier_violation"] = float(brier_score_loss(y_violation, probs_violation))
    out["recall_violation"] = float(recall_score(y_violation, preds_violation, pos_label=1, zero_division=0))
    out["precision_violation"] = float(precision_score(y_violation, preds_violation, pos_label=1, zero_division=0))
    return out


def calibration_bins(places: list[dict[str, Any]], prob_field: str, *, bins: int = 10) -> list[dict[str, Any]]:
    scored = [
        p for p in places
        if isinstance(p.get("official_compliant"), int)
        and isinstance(p.get(prob_field), (int, float))
    ]
    if len(scored) < bins:
        return []

    probs = np.array([float(p[prob_field]) for p in scored], dtype=float)
    labels = np.array([1 if int(p["official_compliant"]) == 0 else 0 for p in scored], dtype=int)
    quantiles = np.linspace(0, 1, bins + 1)
    edges = np.quantile(probs, quantiles)
    edges[0] = 0.0
    edges[-1] = 1.0

    rows: list[dict[str, Any]] = []
    for idx in range(bins):
        lo = float(edges[idx])
        hi = float(edges[idx + 1])
        if idx == bins - 1:
            mask = (probs >= lo) & (probs <= hi)
        else:
            mask = (probs >= lo) & (probs < hi)
        if not np.any(mask):
            continue
        bucket_probs = probs[mask]
        bucket_labels = labels[mask]
        rows.append(
            {
                "bin": idx + 1,
                "prob_min": lo,
                "prob_max": hi,
                "mean_predicted_violation": float(bucket_probs.mean()),
                "observed_violation_rate": float(bucket_labels.mean()),
                "count": int(mask.sum()),
            }
        )
    return rows


def per_domain_metrics(places: list[dict[str, Any]], prob_field: str) -> dict[str, Any]:
    out: dict[str, Any] = {}
    domains = sorted({str(p.get("domain") or "") for p in places if p.get("domain")})
    for domain in domains:
        out[domain] = metric_row([p for p in places if p.get("domain") == domain], prob_field)
    return out


def build_report(snapshot: dict[str, Any], places: list[dict[str, Any]]) -> dict[str, Any]:
    recent_floor = latest_sample_floor(places, 90)
    slices: dict[str, Any] = {}
    calibration_by_domain: dict[str, Any] = {}

    for spec in SLICE_SPECS:
        selected = select_slice(places, spec.key, recent_floor=recent_floor)
        slice_result: dict[str, Any] = {
            "title": spec.title,
            "description": spec.description,
            "n_places": len(selected),
            "metrics": {},
        }
        for model_key, field in MODEL_FIELDS.items():
            slice_result["metrics"][model_key] = metric_row(selected, field)
        if spec.key == "all":
            slice_result["per_domain"] = per_domain_metrics(selected, MODEL_FIELDS["canonical"])
            for domain in sorted({p.get("domain") for p in selected if p.get("domain")}):
                calibration_by_domain[str(domain)] = calibration_bins(
                    [p for p in selected if p.get("domain") == domain],
                    MODEL_FIELDS["canonical"],
                )
        slices[spec.key] = slice_result

    abstention = {
        "policy": {
            "abstain_if": [
                "model probability is missing",
                "uncertainty_level = high",
            ],
            "caution_if": [
                "uncertainty_level = medium",
                "sparse_published_parameter_coverage flag present",
            ],
        },
        "coverage": {
            "retained_places": slices["abstain_excluded"]["n_places"],
            "retained_share": slices["abstain_excluded"]["n_places"] / len(places) if places else 0.0,
            "abstained_places": len(places) - slices["abstain_excluded"]["n_places"],
        },
    }

    return {
        "generated_at": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "snapshot_generated_at": snapshot.get("generated_at"),
        "snapshot_model_version": snapshot.get("model_version"),
        "canonical_model": snapshot.get("canonical_model"),
        "n_places": len(places),
        "uncertainty_summary": snapshot.get("diagnostics", {}).get("uncertainty_summary") or {},
        "slices": slices,
        "calibration_by_domain": calibration_by_domain,
        "abstention": abstention,
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("# Live Snapshot Evaluation")
    lines.append("")
    lines.append(f"- Generated: `{report['generated_at']}`")
    lines.append(f"- Snapshot generated_at: `{report['snapshot_generated_at']}`")
    lines.append(f"- Canonical model: `{report.get('canonical_model')}`")
    lines.append(f"- Places: **{report['n_places']}**")
    lines.append("")
    lines.append("## Main takeaways")
    lines.append("")

    all_metrics = report["slices"]["all"]["metrics"]["canonical"]
    recent_metrics = report["slices"]["recent_90d"]["metrics"]["canonical"]
    abstain_metrics = report["slices"]["abstain_excluded"]["metrics"]["canonical"]
    lines.append(
        f"- Canonical live-slice metrics at threshold 0.5: "
        f"AUC `{_fmt(all_metrics['roc_auc'])}`, "
        f"Recall₀ `{_fmt(all_metrics['recall_violation'])}`, "
        f"Precision₀ `{_fmt(all_metrics['precision_violation'])}`."
    )
    lines.append(
        f"- Recent-90d slice: "
        f"AUC `{_fmt(recent_metrics['roc_auc'])}`, "
        f"Recall₀ `{_fmt(recent_metrics['recall_violation'])}`, "
        f"Precision₀ `{_fmt(recent_metrics['precision_violation'])}`."
    )
    lines.append(
        f"- If we abstain on `high` uncertainty or missing model probability, "
        f"coverage remains `{report['abstention']['coverage']['retained_share']:.1%}` "
        f"with retained-slice AUC `{_fmt(abstain_metrics['roc_auc'])}`."
    )
    lines.append("")
    lines.append("## Per-domain metrics")
    lines.append("")
    lines.append("| Domain | n | violation rate | AUC | Recall₀ | Precision₀ | Brier |")
    lines.append("|---|---:|---:|---:|---:|---:|---:|")
    for domain, metrics in report["slices"]["all"]["per_domain"].items():
        lines.append(
            f"| `{domain}` | {metrics['n']} | {_pct(metrics['violation_rate'])} | {_fmt(metrics['roc_auc'])} | "
            f"{_fmt(metrics['recall_violation'])} | {_fmt(metrics['precision_violation'])} | {_fmt(metrics['brier_violation'])} |"
        )
    lines.append("")
    lines.append("## Hard-case slices")
    lines.append("")
    lines.append("| Slice | n | AUC | Recall₀ | Precision₀ |")
    lines.append("|---|---:|---:|---:|---:|")
    for key in ("high_uncertainty", "hidden_violation", "hidden_pass", "sparse_coverage", "low_uncertainty"):
        metrics = report["slices"][key]["metrics"]["canonical"]
        lines.append(
            f"| {report['slices'][key]['title']} | {report['slices'][key]['n_places']} | "
            f"{_fmt(metrics['roc_auc'])} | {_fmt(metrics['recall_violation'])} | {_fmt(metrics['precision_violation'])} |"
        )
    lines.append("")
    lines.append("## Abstention proposal")
    lines.append("")
    lines.append("- `abstain`: no model probability, or `uncertainty_level = high`")
    lines.append("- `caution`: `uncertainty_level = medium` or sparse published coverage")
    lines.append("- `normal`: `uncertainty_level = low`")
    lines.append("")
    lines.append("This policy does not suppress the official status. It limits how strongly the ML score should be interpreted when the published basis is weak.")
    lines.append("")
    lines.append("## Calibration by domain")
    lines.append("")
    lines.append("Quantile-bin calibration tables are stored in `data/processed/live_snapshot_evaluation.json` under `calibration_by_domain`.")
    lines.append("")
    return "\n".join(lines)


def _fmt(value: Any) -> str:
    if value is None:
        return "n/a"
    try:
        return f"{float(value):.3f}"
    except (TypeError, ValueError):
        return "n/a"


def _pct(value: Any) -> str:
    if value is None:
        return "n/a"
    try:
        return f"{float(value) * 100:.1f}%"
    except (TypeError, ValueError):
        return "n/a"


def main() -> None:
    snapshot, places = load_places()
    report = build_report(snapshot, places)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(f"wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"wrote {OUT_MD.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
