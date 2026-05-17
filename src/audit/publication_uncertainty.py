from __future__ import annotations

from typing import Any

import pandas as pd

from audit.label_vs_norms import BUCKETS, bucket_name, check_probe


UNCERTAINTY_LEVELS = ("low", "medium", "high")
SPARSE_COVERAGE_THRESHOLD = 0.35
KNOWN_DATA_QUALITY_FLAGS = (
    "official_violation_without_published_exceedance",
    "published_exceedance_without_official_violation",
    "missing_official_label",
    "sparse_published_parameter_coverage",
)


def build_place_uncertainty_metadata(row: pd.Series) -> dict[str, Any]:
    verdict = check_probe(row)
    compliant = row.get("compliant")
    bucket = bucket_name(compliant, bool(verdict["any_violation"]))

    n_measured = int(verdict["n_measured"])
    n_total = int(verdict["n_params_with_norm"])
    coverage_ratio = (n_measured / n_total) if n_total else None
    domain = row.get("domain")

    flags: list[str] = []
    if bucket == "hidden_violation":
        flags.append("official_violation_without_published_exceedance")
    elif bucket == "hidden_pass":
        flags.append("published_exceedance_without_official_violation")
    elif bucket == "unknown":
        flags.append("missing_official_label")

    if (
        coverage_ratio is not None
        and domain != "supluskoha"
        and coverage_ratio < SPARSE_COVERAGE_THRESHOLD
    ):
        flags.append("sparse_published_parameter_coverage")

    if bucket == "hidden_violation":
        uncertainty_level = "high"
    elif bucket in {"hidden_pass", "unknown"} or "sparse_published_parameter_coverage" in flags:
        uncertainty_level = "medium"
    else:
        uncertainty_level = "low"

    return {
        "audit_bucket": bucket,
        "deterministic_norms_violation": bool(verdict["any_violation"]),
        "n_measured_norm_params": n_measured,
        "n_total_norm_params": n_total,
        "norm_coverage_ratio": coverage_ratio,
        "data_quality_flags": flags,
        "uncertainty_level": uncertainty_level,
    }


def empty_uncertainty_summary() -> dict[str, Any]:
    return {
        "method": "latest_per_location_deterministic_norm_audit",
        "audit_bucket_counts": {bucket: 0 for bucket in BUCKETS},
        "uncertainty_level_counts": {level: 0 for level in UNCERTAINTY_LEVELS},
        "places_with_publication_gap": 0,
        "flag_counts": {flag: 0 for flag in KNOWN_DATA_QUALITY_FLAGS},
    }


def summarize_place_uncertainty(places: list[dict[str, Any]]) -> dict[str, Any]:
    summary = empty_uncertainty_summary()

    for place in places:
        bucket = place.get("audit_bucket")
        if bucket in summary["audit_bucket_counts"]:
            summary["audit_bucket_counts"][bucket] += 1
            if bucket == "hidden_violation":
                summary["places_with_publication_gap"] += 1

        level = place.get("uncertainty_level")
        if level in summary["uncertainty_level_counts"]:
            summary["uncertainty_level_counts"][level] += 1

        for flag in place.get("data_quality_flags") or []:
            if flag in summary["flag_counts"]:
                summary["flag_counts"][flag] += 1

    return summary
