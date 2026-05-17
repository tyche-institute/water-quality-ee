from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_frontend_snapshot_payload_is_split() -> None:
    snapshot = json.loads((ROOT / "frontend" / "public" / "data" / "snapshot.frontend.json").read_text(encoding="utf-8"))
    places = snapshot["places"]
    assert places
    sample = places[0]
    assert "measurements_count" in sample
    assert "measurements" not in sample
    assert "sample_history" not in sample


def test_frontend_details_and_history_assets_exist() -> None:
    details = json.loads((ROOT / "frontend" / "public" / "data" / "snapshot.details.json").read_text(encoding="utf-8"))
    history = json.loads((ROOT / "frontend" / "public" / "data" / "snapshot.history.json").read_text(encoding="utf-8"))
    assert isinstance(details, dict) and details
    assert isinstance(history, dict) and history


def test_details_asset_matches_place_ids() -> None:
    snapshot = json.loads((ROOT / "frontend" / "public" / "data" / "snapshot.frontend.json").read_text(encoding="utf-8"))
    details = json.loads((ROOT / "frontend" / "public" / "data" / "snapshot.details.json").read_text(encoding="utf-8"))
    place_ids = {place["id"] for place in snapshot["places"]}
    assert place_ids
    assert set(details).issubset(place_ids)


def test_frontend_snapshot_carries_uncertainty_layer() -> None:
    snapshot = json.loads((ROOT / "frontend" / "public" / "data" / "snapshot.frontend.json").read_text(encoding="utf-8"))
    diagnostics = snapshot["diagnostics"]
    assert "uncertainty_summary" in diagnostics
    assert isinstance(snapshot.get("refresh_history"), list)
    assert snapshot["refresh_history"]

    sample = snapshot["places"][0]
    for key in (
        "audit_bucket",
        "deterministic_norms_violation",
        "n_measured_norm_params",
        "n_total_norm_params",
        "norm_coverage_ratio",
        "data_quality_flags",
        "uncertainty_level",
    ):
        assert key in sample


def test_frontend_snapshot_carries_refresh_history_deltas() -> None:
    snapshot = json.loads((ROOT / "frontend" / "public" / "data" / "snapshot.frontend.json").read_text(encoding="utf-8"))
    entry = snapshot["refresh_history"][0]
    for key in (
        "generated_at",
        "places_count",
        "official_violation_share",
        "model_coverage_share",
        "publication_gap_count",
    ):
        assert key in entry
