from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_citizen_snapshot_weekly_cron_starts_earlier() -> None:
    workflow = (ROOT / ".github" / "workflows" / "citizen-snapshot.yml").read_text(encoding="utf-8")
    assert '- cron: "0 4 * * 1"' in workflow
    assert '- cron: "0 4 1 * *"' in workflow


def test_site_smoke_enforces_monday_snapshot_deadline() -> None:
    workflow = (ROOT / ".github" / "workflows" / "site-smoke.yml").read_text(encoding="utf-8")
    assert '- cron: "45 5 * * 1"' in workflow
    assert '- cron: "15 6 * * *"' in workflow
    assert '--require-generated-after "${SNAPSHOT_FLOOR}"' in workflow
    assert '--max-generated-age-hours 2.0' in workflow


def test_aletheia_healthcheck_stays_ahead_of_weekly_snapshot() -> None:
    workflow = (ROOT / ".github" / "workflows" / "aletheia-healthcheck.yml").read_text(encoding="utf-8")
    assert '- cron: "30 3 * * *"' in workflow
    assert "30 min before the Monday" in workflow
    assert "04:00 UTC citizen-snapshot cron" in workflow
