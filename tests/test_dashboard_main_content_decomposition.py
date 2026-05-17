from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_dashboard_main_content_uses_extracted_component_types() -> None:
    component = (ROOT / "frontend" / "app" / "components" / "DashboardMainContent.tsx").read_text(encoding="utf-8")
    types_file = (ROOT / "frontend" / "app" / "lib" / "dashboard-main-content-component-types.ts").read_text(encoding="utf-8")

    assert 'from "../lib/dashboard-main-content-component-types"' in component
    assert "DashboardMainContentComponentProps" in types_file


def test_dashboard_main_content_entrypoint_stays_smaller() -> None:
    lines = (ROOT / "frontend" / "app" / "components" / "DashboardMainContent.tsx").read_text(encoding="utf-8").splitlines()
    assert len(lines) <= 190


def test_dashboard_main_content_type_module_exists() -> None:
    assert (ROOT / "frontend" / "app" / "lib" / "dashboard-main-content-component-types.ts").is_file()
