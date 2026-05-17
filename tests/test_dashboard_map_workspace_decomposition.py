from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_dashboard_map_workspace_uses_extracted_component_types() -> None:
    component = (ROOT / "frontend" / "app" / "components" / "DashboardMapWorkspace.tsx").read_text(encoding="utf-8")
    types_file = (ROOT / "frontend" / "app" / "lib" / "dashboard-map-workspace-component-types.ts").read_text(encoding="utf-8")

    assert 'from "../lib/dashboard-map-workspace-component-types"' in component
    assert "DashboardMapWorkspaceComponentProps" in types_file


def test_dashboard_map_workspace_entrypoint_stays_smaller() -> None:
    lines = (ROOT / "frontend" / "app" / "components" / "DashboardMapWorkspace.tsx").read_text(encoding="utf-8").splitlines()
    assert len(lines) <= 220


def test_dashboard_map_workspace_type_module_exists() -> None:
    assert (ROOT / "frontend" / "app" / "lib" / "dashboard-map-workspace-component-types.ts").is_file()
