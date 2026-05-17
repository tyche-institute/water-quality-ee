from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POLICY_PATH = ROOT / "frontend" / "app" / "lib" / "freshness-policy.json"


def load_policy() -> dict:
    return json.loads(POLICY_PATH.read_text(encoding="utf-8"))


def test_dashboard_freshness_thresholds_are_ordered() -> None:
    policy = load_policy()
    dashboard = policy["dashboard"]

    assert dashboard["freshUntilDays"] == dashboard["agingFromDays"]
    assert dashboard["freshUntilDays"] == 8
    assert dashboard["staleFromDays"] == 14
    assert dashboard["agingFromDays"] < dashboard["staleFromDays"]


def test_frontend_freshness_policy_imports_json_contract() -> None:
    source = (ROOT / "frontend" / "app" / "lib" / "freshness-policy.ts").read_text(encoding="utf-8")

    assert 'import freshnessPolicy from "./freshness-policy.json";' in source
    assert "agingDays: freshnessPolicy.dashboard.agingFromDays" in source
    assert "staleDays: freshnessPolicy.dashboard.staleFromDays" in source
    assert "export const RELEASE_FRESHNESS_POLICY = freshnessPolicy" in source


def test_weekly_site_smoke_deadline_matches_policy() -> None:
    policy = load_policy()
    workflow = (ROOT / ".github" / "workflows" / "site-smoke.yml").read_text(encoding="utf-8")
    max_age = float(policy["scheduledPublish"]["maxGeneratedAgeHours"])

    assert policy["scheduledPublish"]["weeklySnapshotFloorUtc"] == "Monday 04:00"
    assert policy["scheduledPublish"]["weeklyDeadlineSmokeUtc"] == "Monday 05:45"
    assert f"--max-generated-age-hours {max_age:.1f}" in workflow
    assert 'cron: "45 5 * * 1"' in workflow


def test_release_docs_name_policy_thresholds() -> None:
    operations = (ROOT / "docs" / "OPERATIONS.md").read_text(encoding="utf-8")
    checklist = (ROOT / "docs" / "RELEASE_DECISION_CHECKLIST.md").read_text(encoding="utf-8")

    for doc in (operations, checklist):
        normalized = doc.replace("`", "")
        assert "frontend/app/lib/freshness-policy.json" in normalized
        assert "fresh < 8" in normalized
        assert "aging 8-13" in normalized
        assert "stale >= 14" in normalized
