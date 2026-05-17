from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_dashboard_trust_entrypoint_is_composition_oriented() -> None:
    trust = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-trust.ts").read_text(encoding="utf-8")
    lines = trust.splitlines()
    assert len(lines) <= 60
    assert 'from "./use-dashboard-trust-copy"' in trust
    assert 'from "./use-dashboard-trust-explainers"' in trust
    assert 'from "./use-dashboard-trust-freshness"' in trust
    assert "const copy = useDashboardTrustCopy(lang)" in trust
    assert "const explainers = useDashboardTrustExplainers({" in trust
    assert "const freshness = useDashboardTrustFreshness(lang, snapshot)" in trust
    assert "...copy" in trust
    assert "...explainers" in trust
    assert "...freshness" in trust


def test_dashboard_trust_split_modules_exist() -> None:
    expected = [
        "use-dashboard-trust-copy.ts",
        "use-dashboard-trust-explainers.ts",
        "use-dashboard-trust-freshness.ts",
        "freshness-policy.ts",
        "freshness-policy.json",
    ]
    for file_name in expected:
        assert (ROOT / "frontend" / "app" / "lib" / file_name).is_file(), file_name


def test_selected_place_surfaces_keep_verify_and_freshness_visible() -> None:
    """Freshness + verify link must stay visible somewhere the user can reach them.

    On the desktop place panel we keep them inline (there is room). On mobile
    they were removed from every per-point card and consolidated onto the
    global info pane (the analytics tab opened via the (i) icon) — see
    test_selected_place_freshness_blocks_have_visual_state for the mobile
    contract details.
    """
    summary = (ROOT / "frontend" / "app" / "components" / "DashboardSelectedPlaceSummary.tsx").read_text(encoding="utf-8")
    mobile = (ROOT / "frontend" / "app" / "components" / "DashboardMobilePlaceSheet.tsx").read_text(encoding="utf-8")
    analytics = (ROOT / "frontend" / "app" / "components" / "DashboardInfoAnalyticsTab.tsx").read_text(encoding="utf-8")
    freshness = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-trust-freshness.ts").read_text(encoding="utf-8")

    # Desktop summary now shows only the compliant + risk badges plus the
    # model chips, so its trust/verify chrome is intentionally absent.
    assert 'data-trust-order="sample-date"' in summary
    assert 'data-trust-order="official-status"' in summary
    assert "pointRiskBadge" in summary

    # Mobile place card intentionally omits freshness rows + verify link to
    # save vertical space — those surfaces now live on the global info pane.
    assert "gmTrustSummary" not in mobile
    assert "VERIFY_PATH" not in mobile
    assert "Verify the snapshot and signature on /verify" not in mobile
    assert "measurementsOpen" in mobile
    assert "historyOpen" in mobile
    assert "gmSectionToggle" in mobile

    # Global info pane (analytics tab) carries the verify entrypoint that
    # used to be on every mobile place card.
    assert "VERIFY_PATH" in analytics
    assert '"Open /verify"' in analytics

    assert 'from "./freshness-policy"' in freshness
    assert "DASHBOARD_FRESHNESS_POLICY" in freshness


def test_selected_place_surfaces_keep_official_and_provenance_before_model() -> None:
    mobile = (ROOT / "frontend" / "app" / "components" / "DashboardMobilePlaceSheet.tsx").read_text(encoding="utf-8")
    review = (ROOT / "frontend" / "scripts" / "ui-review.mjs").read_text(encoding="utf-8")

    # Desktop summary was intentionally collapsed to a compact compliant +
    # risk badge — it no longer participates in the trust-order chain.
    # Mobile keeps the chain but drops provenance / verification-source rows;
    # only the trust steps that remain on the card must keep their order.
    mobile_order = [
        'data-trust-order="sample-date"',
        'data-trust-order="official-status"',
        'data-trust-order="model-context"',
    ]
    mobile_positions = [mobile.index(marker) for marker in mobile_order]
    assert mobile_positions == sorted(mobile_positions)
    assert 'data-trust-order="provenance"' not in mobile
    assert 'data-trust-order="verification-source"' not in mobile

    assert "officialBeforeProvenance" in review
    assert "verifyBeforeModel" in review
