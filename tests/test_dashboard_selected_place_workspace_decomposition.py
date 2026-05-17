from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_selected_place_workspace_uses_extracted_component_types() -> None:
    component = (ROOT / "frontend" / "app" / "components" / "DashboardSelectedPlaceWorkspace.tsx").read_text(
        encoding="utf-8"
    )
    types_file = (
        ROOT / "frontend" / "app" / "lib" / "dashboard-selected-place-workspace-component-types.ts"
    ).read_text(encoding="utf-8")

    assert 'from "../lib/dashboard-selected-place-workspace-component-types"' in component
    assert "DashboardSelectedPlaceWorkspaceComponentProps" in types_file


def test_selected_place_workspace_entrypoint_stays_smaller() -> None:
    lines = (
        ROOT / "frontend" / "app" / "components" / "DashboardSelectedPlaceWorkspace.tsx"
    ).read_text(encoding="utf-8").splitlines()
    assert len(lines) <= 25


def test_selected_place_workspace_type_module_exists() -> None:
    assert (ROOT / "frontend" / "app" / "lib" / "dashboard-selected-place-workspace-component-types.ts").is_file()
