from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_map_environment_entrypoint_is_composition_oriented() -> None:
    content = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-map-environment.ts").read_text(encoding="utf-8")
    lines = content.splitlines()
    assert len(lines) <= 45
    assert 'from "./use-dashboard-map-mobile-environment"' in content
    assert 'from "./use-dashboard-county-geo"' in content
    assert 'from "./use-dashboard-header-compact-effect"' in content
    assert "const { isMobile, mobileBottomOverlayPx } = useDashboardMapMobileEnvironment({" in content
    assert "const { countyGeoJson, placeCountyGeo } = useDashboardCountyGeo({" in content
    assert "useDashboardHeaderCompactEffect(setHeaderCompact)" in content


def test_map_environment_split_modules_exist() -> None:
    expected = [
        "use-dashboard-map-mobile-environment.ts",
        "use-dashboard-county-geo.ts",
        "use-dashboard-header-compact-effect.ts",
    ]
    for file_name in expected:
        assert (ROOT / "frontend" / "app" / "lib" / file_name).is_file(), file_name
