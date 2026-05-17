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


def test_resolve_place_coordinates_applies_manual_override_after_fallbacks():
    module = load_module()
    row = pd.Series(
        {
            "domain": "veevark",
            "location": "Example veevark",
            "county": "Harju maakond",
        }
    )
    result = module.resolve_place_coordinates(
        row,
        resolve_coordinates=False,
        geocode_limit=0,
        cache={},
        resolve_cache={},
        session=object(),
        google_key=None,
        paged_addr_index={},
        coord_overrides={
            module._normalize_location_key("Example veevark", "veevark"): {
                "action": "set_manual",
                "lat": 59.44,
                "lon": 24.75,
            }
        },
        budget_remain=[0],
        api_calls=0,
        log=module.LOG,
        place_index=1,
        total_places=1,
    )
    assert result["coord_source"] == "manual_override"
    assert result["overridden"] is True
    assert result["lat"] == 59.44
    assert result["lon"] == 24.75


def test_resolve_place_coordinates_hides_row_when_override_requests_hide():
    module = load_module()
    row = pd.Series({"domain": "basseinid", "location": "Hidden pool"})
    result = module.resolve_place_coordinates(
        row,
        resolve_coordinates=False,
        geocode_limit=0,
        cache={},
        resolve_cache={},
        session=object(),
        google_key=None,
        paged_addr_index={},
        coord_overrides={
            module._normalize_location_key("Hidden pool", "basseinid"): {
                "action": "hide",
            }
        },
        budget_remain=[0],
        api_calls=0,
        log=module.LOG,
        place_index=1,
        total_places=1,
    )
    assert result["hidden"] is True


def test_resolve_place_county_prefers_address_then_coord_inference():
    module = load_module()
    county = module.resolve_place_county(
        county=None,
        lat=59.437,
        lon=24.7536,
        coord_source="google",
        geocode_matched="Tallinn, Harju maakond, Eesti",
    )
    assert county == "Harju maakond"
