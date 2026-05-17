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


def test_build_snapshot_place_rows_accumulates_visible_hidden_and_overridden(monkeypatch):
    module = load_module()
    latest = pd.DataFrame(
        [
            {"domain": "veevark", "location": "Visible", "_loc_key": "veevark|visible", "sample_date": pd.Timestamp("2026-05-01"), "compliant": 1},
            {"domain": "veevark", "location": "Hidden", "_loc_key": "veevark|hidden", "sample_date": pd.Timestamp("2026-05-02"), "compliant": 1},
            {"domain": "veevark", "location": "Manual", "_loc_key": "veevark|manual", "sample_date": pd.Timestamp("2026-05-03"), "compliant": 1},
        ]
    )

    responses = [
        {"loc_name": "Visible", "domain": "veevark", "county": None, "lat": 59.1, "lon": 24.7, "coord_source": "google", "geocode_matched": None, "api_calls": 1, "hidden": False, "overridden": False},
        {"loc_name": "Hidden", "domain": "veevark", "county": None, "lat": 59.2, "lon": 24.8, "coord_source": "google", "geocode_matched": None, "api_calls": 1, "hidden": True, "overridden": False},
        {"loc_name": "Manual", "domain": "veevark", "county": "Harju maakond", "lat": 59.3, "lon": 24.9, "coord_source": "manual_override", "geocode_matched": None, "api_calls": 2, "hidden": False, "overridden": True},
    ]

    def fake_resolve_place_coordinates(*args, **kwargs):
        return responses.pop(0)

    monkeypatch.setattr(module, "resolve_place_coordinates", fake_resolve_place_coordinates)
    monkeypatch.setattr(module, "resolve_place_county", lambda **kwargs: kwargs["county"] or "Harju maakond")
    monkeypatch.setattr(
        module,
        "build_place_row",
        lambda row, **kwargs: {"location": kwargs["loc_name"], "coord_source": kwargs["coord_source"]},
    )

    out = module.build_snapshot_place_rows(
        latest,
        resolve_coordinates=False,
        geocode_limit=0,
        cache={},
        resolve_cache={},
        session=object(),
        google_key=None,
        paged_addr_index={},
        coord_overrides={},
        budget_remain=[0],
        progress_every=10,
        history_index={},
        model_version="citizen-2026.test",
        snapshot_generated_at="2026-05-11T10:00:00Z",
        log=module.LOG,
    )

    assert out["api_calls"] == 2
    assert out["hidden_rows"] == 1
    assert out["overridden_rows"] == 1
    assert out["n_map"] == 3
    assert [row["location"] for row in out["rows_out"]] == ["Visible", "Manual"]


def test_persist_coordinate_caches_uses_expected_save_paths(monkeypatch):
    module = load_module()
    calls = []

    monkeypatch.setattr(module._geocode_resolve, "save_resolve_cache", lambda path, cache: calls.append(("resolve", path, cache)))
    monkeypatch.setattr(module, "save_geocode_cache", lambda cache: calls.append(("geocode", cache)))

    module.persist_coordinate_caches(
        resolve_coordinates=True,
        geocode_limit=10,
        api_calls=3,
        budget_remain=[7],
        cache={"a": 1},
        resolve_cache={"b": 2},
    )

    assert calls[0][0] == "resolve"
    assert calls[1] == ("geocode", {"a": 1})
