from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "citizen-service" / "scripts" / "build_citizen_snapshot.py"


def load_module():
    spec = importlib.util.spec_from_file_location("build_citizen_snapshot", SCRIPT_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_snapshot_builder_entrypoint_keeps_shrinking() -> None:
    lines = SCRIPT_PATH.read_text(encoding="utf-8").splitlines()
    assert len(lines) <= 1120


def test_build_latest_places_and_history_deduplicates_and_caps_history() -> None:
    module = load_module()
    rows = [
        {
            "domain": "supluskoha",
            "location": "Harku jarve supluskoht",
            "sample_date": "2026-05-01",
            "compliant": 1,
            "e_coli": 1.0,
        },
        {
            "domain": "supluskoha",
            "location": "Harku jarve rand",
            "sample_date": "2026-05-03",
            "compliant": 0,
            "e_coli": 2.0,
        },
    ]
    for i in range(35):
        rows.append(
            {
                "domain": "veevark",
                "location": "Aegviidu veevark",
                "sample_date": f"2026-04-{i + 1:02d}",
                "compliant": i % 2,
                "e_coli": float(i),
            }
        )

    df = pd.DataFrame(rows)
    latest, history_index, n_dedup = module.build_latest_places_and_history(df, {"supluskoha", "veevark"})

    swimming_latest = latest[latest["domain"] == "supluskoha"]
    assert len(swimming_latest) == 1
    assert swimming_latest.iloc[0]["location"] == "Harku jarve rand"
    assert n_dedup >= 1

    water_key = module._normalize_location_key("Aegviidu veevark", "veevark")
    assert len(history_index[water_key]) == 30
    assert history_index[water_key][0]["sample_date"] > history_index[water_key][-1]["sample_date"]


def test_build_place_row_and_snapshot_document_preserve_provenance_contract() -> None:
    module = load_module()
    row = pd.Series(
        {
            "domain": "veevark",
            "location": "Example",
            "_loc_key": "veevark|example",
            "sample_date": pd.Timestamp("2026-05-11"),
            "compliant": 1,
            "sample_id": "sid-1",
            "model_violation_prob": 0.1,
            "rf_violation_prob": 0.1,
        }
    )

    place = module.build_place_row(
        row,
        loc_name="Example",
        county_out="Harju maakond",
        lat=59.1,
        lon=24.7,
        coord_source="manual_override",
        geocode_matched="Example, Estonia",
        sample_history=[],
        model_version="citizen-2026.test",
        snapshot_generated_at="2026-05-11T10:00:00Z",
    )
    assert place["prediction_id"]
    assert place["feature_hash"]
    assert place["model_version"] == "citizen-2026.test"
    assert place["sample_id"] == "sid-1"
    assert place["geocode_matched_address"] == "Example, Estonia"

    snapshot = module.build_snapshot_document(
        snapshot_generated_at="2026-05-11T10:00:00Z",
        data_fetched_at="2026-05-11T09:00:00Z",
        model_trained_at="2026-05-11T09:30:00Z",
        model_version="citizen-2026.test",
        git_sha="abc123def456",
        map_domains=["veevark"],
        domain_source_status={"veevark": {"requested": True, "loaded": True, "reason": "ok"}},
        loaded_domains={"veevark"},
        include_mineraalvesi=False,
        coord_overrides={"x": {"action": "set_manual"}},
        overridden_rows=1,
        hidden_rows=0,
        rows_out=[place],
        has_model_predictions=True,
        lgbm_available=False,
    )
    assert snapshot["available_models"] == ["lr", "rf", "gb"]
    assert snapshot["feature_hash_columns"]
    assert snapshot["coordinate_override_stats"]["manual_applied"] == 1
    assert snapshot["places"][0]["prediction_id"] == place["prediction_id"]


def test_snapshot_publish_helpers_live_in_dedicated_module() -> None:
    helper = (ROOT / "citizen-service" / "snapshot_publish.py").read_text(encoding="utf-8")
    script = SCRIPT_PATH.read_text(encoding="utf-8")

    assert "def build_latest_places_and_history(" in helper
    assert "def build_place_row(" in helper
    assert "def build_snapshot_document(" in helper
    assert 'from snapshot_publish import (' in script


def test_snapshot_coordinate_helpers_live_in_dedicated_module() -> None:
    helper = (ROOT / "citizen-service" / "snapshot_coordinates.py").read_text(encoding="utf-8")
    script = SCRIPT_PATH.read_text(encoding="utf-8")

    assert "def resolve_place_coordinates(" in helper
    assert "def resolve_place_county(" in helper
    assert "def persist_coordinate_caches(" in helper
    assert "def geocode_address_simple(" in helper
    assert 'from snapshot_coordinates import (' in script


def test_snapshot_address_helpers_live_in_dedicated_module() -> None:
    helper = (ROOT / "citizen-service" / "snapshot_address_index.py").read_text(encoding="utf-8")
    script = SCRIPT_PATH.read_text(encoding="utf-8")

    assert "def load_geocode_cache(" in helper
    assert "def build_paged_address_index(" in helper
    assert "def load_coordinate_overrides(" in helper
    assert 'from snapshot_address_index import (' in script
