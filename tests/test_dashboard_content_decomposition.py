from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_dashboard_content_facade_stays_small_and_reexports_split_modules() -> None:
    content = (ROOT / "frontend" / "app" / "lib" / "dashboard-content.ts").read_text(encoding="utf-8")
    lines = content.splitlines()
    assert len(lines) <= 12
    assert './dashboard-expert-mode-content' in content
    assert './dashboard-parameter-content' in content
    assert './dashboard-content-types' in content


def test_dashboard_content_split_modules_exist() -> None:
    expected = [
        "dashboard-content-types.ts",
        "dashboard-expert-mode-content.ts",
        "dashboard-parameter-content.ts",
    ]
    for file_name in expected:
        assert (ROOT / "frontend" / "app" / "lib" / file_name).is_file(), file_name


def test_existing_consumers_keep_using_dashboard_content_facade() -> None:
    derived = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-derived-data.ts").read_text(encoding="utf-8")
    trust_copy = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-trust-copy.ts").read_text(encoding="utf-8")
    assert 'from "./dashboard-content"' in derived
    assert 'from "./dashboard-content"' in trust_copy
