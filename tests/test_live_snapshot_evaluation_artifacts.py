from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_live_snapshot_evaluation_assets_exist() -> None:
    assert (ROOT / "scripts" / "evaluate_live_snapshot.py").is_file()
    assert (ROOT / "docs" / "live_snapshot_evaluation.md").is_file()
    assert (ROOT / "docs" / "ABSTENTION_POLICY.md").is_file()
    assert (ROOT / "data" / "processed" / "live_snapshot_evaluation.json").is_file()


def test_live_snapshot_evaluation_json_has_core_sections() -> None:
    payload = json.loads((ROOT / "data" / "processed" / "live_snapshot_evaluation.json").read_text(encoding="utf-8"))
    assert "slices" in payload
    assert "calibration_by_domain" in payload
    assert "abstention" in payload
    assert "all" in payload["slices"]
    assert "recent_90d" in payload["slices"]
    assert "abstain_excluded" in payload["slices"]
