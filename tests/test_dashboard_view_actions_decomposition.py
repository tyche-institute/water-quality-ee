from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_dashboard_view_actions_entrypoint_is_composition_oriented() -> None:
    content = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-view-actions.ts").read_text(encoding="utf-8")
    lines = content.splitlines()
    assert len(lines) <= 75
    assert 'from "./use-dashboard-info-page-actions"' in content
    assert 'from "./use-dashboard-view-preference-actions"' in content
    assert 'from "./use-dashboard-view-filter-actions"' in content
    assert "const infoPageActions = useDashboardInfoPageActions({" in content
    assert "const preferenceActions = useDashboardViewPreferenceActions({" in content
    assert "const filterActions = useDashboardViewFilterActions({" in content
    assert "...infoPageActions" in content
    assert "...preferenceActions" in content
    assert "...filterActions" in content


def test_dashboard_view_action_split_modules_exist() -> None:
    expected = [
        "use-dashboard-info-page-actions.ts",
        "use-dashboard-view-preference-actions.ts",
        "use-dashboard-view-filter-actions.ts",
    ]
    for file_name in expected:
        assert (ROOT / "frontend" / "app" / "lib" / file_name).is_file(), file_name
