from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_package_exposes_full_ui_review_script() -> None:
    package = json.loads((ROOT / "frontend" / "package.json").read_text(encoding="utf-8"))

    assert package["scripts"]["ui:review"] == "node scripts/ui-review.mjs"


def test_ui_review_covers_primary_dashboard_surfaces() -> None:
    source = (ROOT / "frontend" / "scripts" / "ui-review.mjs").read_text(encoding="utf-8")

    assert "H2O_UI_REVIEW_BASE_URL" in source
    assert "ui-review-report.json" in source
    assert "desktop selected place dark" in source
    assert "mobile filters and theme" in source
    assert "verify mobile" in source
    assert ".infoPageTab" in source
    assert ".gmSheetFilterContent" in source
    assert "assertNoHorizontalOverflow" in source
    assert "assertTrustOrdering" in source
    # Mobile place sheet no longer renders the trust summary or verify link —
    # both moved to the global info pane. ui-review.mjs must opt mobile
    # scenarios out of the provenance order check.
    assert "requireProvenance: false" in source


def test_mobile_filter_sheet_opens_full_height_for_deep_controls() -> None:
    source = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-map-filter-actions.ts").read_text(encoding="utf-8")

    assert 'setSheetMode("filter")' in source
    assert 'setMobilePanelState("full")' in source


def test_mobile_sheet_handle_does_not_double_cycle_pointer_taps() -> None:
    source = (ROOT / "frontend" / "app" / "lib" / "use-dashboard-mobile-sheet.ts").read_text(encoding="utf-8")

    assert "suppressNextHandleClick" in source
    assert "cycleMobilePanelState: onSheetHandleClick" in source


def test_ui_review_docs_explain_local_and_live_targets() -> None:
    operations = (ROOT / "docs" / "OPERATIONS.md").read_text(encoding="utf-8")
    frontend_readme = (ROOT / "frontend" / "README.md").read_text(encoding="utf-8")

    assert "npm run ui:review" in operations
    assert "H2O_UI_REVIEW_BASE_URL=https://h2oatlas.ee" in operations
    assert "npm run ui:review" in frontend_readme
    assert "/tmp/h2oatlas-ui-review" in frontend_readme
