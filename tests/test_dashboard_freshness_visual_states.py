from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_freshness_policy_exposes_ui_severity_helpers() -> None:
    source = read("frontend/app/lib/freshness-policy.ts")

    assert "export function freshnessBadgeTone" in source
    assert 'level === "aging" || level === "unknown"' in source
    assert "export function worstFreshnessLevel" in source
    assert "FRESHNESS_SEVERITY" in source


def test_map_overlay_renders_signed_badge_only() -> None:
    source = read("frontend/app/components/DashboardMapFreshnessOverlay.tsx")

    # Data/model freshness card was removed from the map; only the
    # SIGNED badge remains in the bottom-left overlay.
    assert "SignedBadge" in source
    assert "mapFreshnessCard" not in source
    assert "mapFreshnessRow" not in source


def test_selected_place_freshness_blocks_have_visual_state() -> None:
    desktop = read("frontend/app/components/DashboardSelectedPlaceSummary.tsx")
    mobile = read("frontend/app/components/DashboardMobilePlaceSheet.tsx")
    analytics = read("frontend/app/components/DashboardInfoAnalyticsTab.tsx")

    # Desktop summary intentionally drops the freshness block — the data is
    # available on the global info pane / SIGNED badge instead.
    assert "pointFreshnessBlock" not in desktop
    assert "freshnessBadgeTone" not in desktop

    # Mobile per-point card intentionally drops the freshness block — the
    # info lives on the global analytics tab below to avoid repeating it
    # on every place sheet on small screens.
    assert "gmTrustSummary" not in mobile
    assert "freshnessBadgeTone" not in mobile

    assert "freshnessDiag\" data-freshness-state={freshnessState}" in analytics
    assert "freshnessBadgeTone(dataFreshnessLevel)" in analytics
    assert "freshnessBadgeTone(modelFreshnessLevel)" in analytics


def test_css_has_degraded_freshness_state_selectors() -> None:
    css = read("frontend/app/globals.css")

    # Only the surfaces that still render freshness — mobile trust summary
    # and the analytics freshness diagram — need degraded-state styling.
    for selector in (
        '.gmTrustSummary[data-freshness-state="aging"]',
        '.gmTrustSummary[data-freshness-state="stale"]',
        '.freshnessDiag[data-freshness-state="aging"]',
        '.freshnessDiag[data-freshness-state="stale"]',
    ):
        assert selector in css
