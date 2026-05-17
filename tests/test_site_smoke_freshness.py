from __future__ import annotations

from datetime import datetime, timezone

import pytest

from scripts.smoke_live_site import parse_timestamp, validate_snapshot_freshness


def test_parse_timestamp_accepts_z_suffix() -> None:
    parsed = parse_timestamp("2026-05-11T08:22:41.165856Z", field_name="generated_at")
    assert parsed == datetime(2026, 5, 11, 8, 22, 41, 165856, tzinfo=timezone.utc)


def test_validate_snapshot_freshness_rejects_snapshot_older_than_floor() -> None:
    with pytest.raises(ValueError, match="older than required floor"):
        validate_snapshot_freshness(
            {"generated_at": "2026-05-05T08:22:41.165856Z"},
            require_generated_after=datetime(2026, 5, 11, 4, 0, tzinfo=timezone.utc),
            max_generated_age_hours=None,
            now=datetime(2026, 5, 11, 5, 45, tzinfo=timezone.utc),
        )


def test_validate_snapshot_freshness_rejects_snapshot_older_than_max_age() -> None:
    with pytest.raises(ValueError, match="allowed max is 2.00h"):
        validate_snapshot_freshness(
            {"generated_at": "2026-05-11T01:30:00Z"},
            require_generated_after=None,
            max_generated_age_hours=2.0,
            now=datetime(2026, 5, 11, 5, 45, tzinfo=timezone.utc),
        )


def test_validate_snapshot_freshness_accepts_recent_snapshot() -> None:
    validate_snapshot_freshness(
        {"generated_at": "2026-05-11T04:12:00Z"},
        require_generated_after=datetime(2026, 5, 11, 4, 0, tzinfo=timezone.utc),
        max_generated_age_hours=2.0,
        now=datetime(2026, 5, 11, 5, 45, tzinfo=timezone.utc),
    )
