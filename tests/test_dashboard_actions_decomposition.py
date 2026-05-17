from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_dashboard_actions_entrypoint_is_composition_oriented() -> None:
    content = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-actions.ts").read_text(encoding="utf-8")
    lines = content.splitlines()
    assert len(lines) <= 110
    assert 'from "./use-dashboard-preference-actions"' in content
    assert 'from "./use-dashboard-map-filter-actions"' in content
    assert "const preferenceActions = useDashboardPreferenceActions({" in content
    assert "const mapFilterActions = useDashboardMapFilterActions({" in content
    assert "...preferenceActions" in content
    assert "...mapFilterActions" in content


def test_dashboard_actions_split_modules_exist() -> None:
    expected = [
        "use-dashboard-preference-actions.ts",
        "use-dashboard-map-filter-actions.ts",
    ]
    for file_name in expected:
        assert (ROOT / "frontend" / "app" / "lib" / file_name).is_file(), file_name
