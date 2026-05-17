from __future__ import annotations

import importlib.util
import sys
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "review_analytics_kv.py"


def load_module():
    spec = importlib.util.spec_from_file_location("review_analytics_kv", SCRIPT_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_load_namespace_id_from_wrangler_config() -> None:
    module = load_module()
    namespace_id = module.load_namespace_id(ROOT / "analytics-worker" / "wrangler.toml", preview=False)
    preview_id = module.load_namespace_id(ROOT / "analytics-worker" / "wrangler.toml", preview=True)

    assert namespace_id == "b956856d9ca045e1a2cc58fb51598165"
    assert preview_id == "2929154b206b4da89bf2809c1045608a"


def test_summarize_derives_expected_rates() -> None:
    module = load_module()
    series = [
        module.DailyAnalytics(
            day="2026-05-10",
            counts={
                "total": 10,
                "dashboard_open": 4,
                "place_selected": 2,
                "watchlist_toggled": 0,
                "filters_changed": 0,
                "history_toggled": 1,
                "measurements_toggled": 1,
                "info_opened": 0,
                "share_click": 1,
                "verify_page_open": 2,
                "verify_attempt": 1,
                "verify_result": 1,
                "data_gap_notice_impression": 1,
                "data_gap_notice_dismissed": 1,
                "signed_badge_click": 1,
                "web_vital": 0,
            },
        ),
        module.DailyAnalytics(
            day="2026-05-11",
            counts={
                "total": 8,
                "dashboard_open": 6,
                "place_selected": 3,
                "watchlist_toggled": 0,
                "filters_changed": 0,
                "history_toggled": 1,
                "measurements_toggled": 2,
                "info_opened": 0,
                "share_click": 0,
                "verify_page_open": 2,
                "verify_attempt": 1,
                "verify_result": 1,
                "data_gap_notice_impression": 1,
                "data_gap_notice_dismissed": 0,
                "signed_badge_click": 0,
                "web_vital": 0,
            },
        ),
    ]

    summary = module.summarize(series)

    assert summary["totals"]["dashboard_open"] == 10
    assert summary["totals"]["place_selected"] == 5
    assert summary["derived"]["place_select_rate_pct"] == 50.0
    assert summary["derived"]["verify_attempt_rate_pct"] == 50.0
    assert summary["derived"]["share_rate_pct"] == 20.0
    assert summary["derived"]["history_open_rate_pct"] == 40.0
    assert summary["derived"]["measurements_open_rate_pct"] == 60.0
    assert summary["derived"]["signed_badge_click_rate_pct"] == 20.0
    assert summary["derived"]["data_gap_dismiss_rate_pct"] == 50.0
    assert summary["findings"]
    assert summary["recommendations"]


def test_build_daily_analytics_uses_trailing_window(monkeypatch) -> None:
    module = load_module()

    values = {
        ("2026-05-10", "total"): 9,
        ("2026-05-10", "dashboard_open"): 4,
        ("2026-05-11", "total"): 11,
        ("2026-05-11", "dashboard_open"): 5,
    }

    def fake_fetch_count(day: str, metric: str, namespace_id: str, account_id: str) -> int:
        return values.get((day, metric), 0)

    monkeypatch.setattr(module, "fetch_count", fake_fetch_count)
    series = module.build_daily_analytics(2, "ns", "acct", today=date(2026, 5, 11))

    assert [entry.day for entry in series] == ["2026-05-10", "2026-05-11"]
    assert series[0].counts["total"] == 9
    assert series[1].counts["dashboard_open"] == 5


def test_format_markdown_includes_findings_and_actions() -> None:
    module = load_module()
    summary = {
        "window_days": 2,
        "start_day": "2026-05-10",
        "end_day": "2026-05-11",
        "totals": {
            "total": 16,
            "dashboard_open": 16,
            "place_selected": 0,
            "verify_page_open": 4,
            "verify_attempt": 0,
            "verify_result": 0,
            "signed_badge_click": 0,
            "history_toggled": 0,
            "measurements_toggled": 0,
            "share_click": 0,
        },
        "derived": {
            "place_select_rate_pct": 0.0,
            "verify_attempt_rate_pct": 0.0,
            "share_rate_pct": None,
            "history_open_rate_pct": None,
            "measurements_open_rate_pct": None,
            "signed_badge_click_rate_pct": None,
            "data_gap_dismiss_rate_pct": 0.0,
        },
        "findings": [{"severity": "warning", "message": "Example finding."}],
        "recommendations": ["Example action."],
        "daily": [
            {
                "day": "2026-05-11",
                "counts": {
                    "total": 16,
                    "dashboard_open": 16,
                    "place_selected": 0,
                    "verify_page_open": 4,
                    "verify_attempt": 0,
                    "share_click": 0,
                },
            }
        ],
    }

    rendered = module.format_markdown(summary)
    assert "# Weekly Analytics Review: 2026-05-10 -> 2026-05-11" in rendered
    assert "## Findings" in rendered
    assert "Example finding." in rendered
    assert "## Recommended Actions" in rendered
    assert "Example action." in rendered
