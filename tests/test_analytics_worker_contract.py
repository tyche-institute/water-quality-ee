from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_analytics_worker_package_exists() -> None:
    worker_root = ROOT / "analytics-worker"
    assert (worker_root / "package.json").is_file()
    assert (worker_root / "wrangler.toml").is_file()
    assert (worker_root / "src" / "index.ts").is_file()


def test_analytics_worker_knows_frontend_event_names() -> None:
    frontend = (ROOT / "frontend" / "app" / "lib" / "analytics.ts").read_text(encoding="utf-8")
    worker = (ROOT / "analytics-worker" / "src" / "index.ts").read_text(encoding="utf-8")

    expected = [
        "dashboard_open",
        "filters_changed",
        "place_selected",
        "watchlist_toggled",
        "history_toggled",
        "measurements_toggled",
        "info_opened",
        "share_click",
        "verify_page_open",
        "verify_attempt",
        "verify_result",
        "data_gap_notice_impression",
        "data_gap_notice_dismissed",
        "signed_badge_click",
        "web_vital",
    ]

    for event_name in expected:
        assert event_name in frontend, event_name
        assert event_name in worker, event_name
