from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_readme_indexes_operational_status_and_ownership_docs() -> None:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    assert "docs/PROGRAM_STATUS.md" in readme
    assert "docs/EXECUTION_PLAN.md" in readme
    assert "docs/OWNERSHIP_AND_ACCESS.md" in readme
    assert "docs/PRODUCT_AUDIT_MASTER_PLAN.md" in readme
    assert "docs/RELEASE_DECISION_CHECKLIST.md" in readme
    assert "docs/ROLLBACK_DRILL.md" in readme
    assert "docs/LOCALE_ROUTING_STRATEGY.md" in readme


def test_operations_doc_points_to_status_and_ownership_baselines() -> None:
    operations = (ROOT / "docs" / "OPERATIONS.md").read_text(encoding="utf-8")
    assert "docs/PROGRAM_STATUS.md" in operations
    assert "docs/OWNERSHIP_AND_ACCESS.md" in operations
    assert "docs/RELEASE_DECISION_CHECKLIST.md" in operations
    assert "docs/ROLLBACK_DRILL.md" in operations
    assert ".github/PULL_REQUEST_TEMPLATE.md" in operations


def test_pull_request_template_requires_release_decision_artifact() -> None:
    template = (ROOT / ".github" / "PULL_REQUEST_TEMPLATE.md").read_text(encoding="utf-8")

    assert "docs/RELEASE_DECISION_CHECKLIST.md" in template
    assert "Release Decision Artifact" in template
    assert "Release candidate commit or branch" in template
    assert "Snapshot `generated_at`" in template
    assert "Expected verification mode" in template
    assert "Live smoke result for `https://h2oatlas.ee`" in template
    assert "Build integrity" in template
    assert "Data freshness" in template
    assert "Verification truthfulness" in template
    assert "UX ordering" in template
    assert "Do not publish while any hard blocker" in template


def test_ownership_doc_links_to_key_operating_sources() -> None:
    ownership = (ROOT / "docs" / "OWNERSHIP_AND_ACCESS.md").read_text(encoding="utf-8")
    assert "docs/PROGRAM_STATUS.md" in ownership
    assert "docs/OPERATIONS.md" in ownership
    assert "docs/ROLLBACK_DRILL.md" in ownership
    assert "docs/key_management.md" in ownership
    assert "docs/ANALYTICS_ACTIVATION.md" in ownership
    assert "two-person resilience target" in ownership


def test_rollback_drill_covers_dry_run_real_incident_and_evidence() -> None:
    drill = (ROOT / "docs" / "ROLLBACK_DRILL.md").read_text(encoding="utf-8")

    assert "Do not push during the dry run." in drill
    assert "git status -sb" in drill
    assert "git revert --no-edit <bad_commit_sha>" in drill
    assert "git push origin main" in drill
    assert "gh run list --commit <rollback_commit_sha> --limit 10" in drill
    assert "scripts/smoke_live_site.py --base-url https://h2oatlas.ee" in drill
    assert "npm run ux:smoke:live" in drill
    assert "Snapshot `generated_at`" in drill
    assert "Browser smoke result" in drill
    assert "If the issue is isolated to snapshot data" in drill


def test_locale_strategy_doc_and_layout_metadata_stay_aligned() -> None:
    strategy = (ROOT / "docs" / "LOCALE_ROUTING_STRATEGY.md").read_text(encoding="utf-8")
    layout = (ROOT / "frontend" / "app" / "layout.tsx").read_text(encoding="utf-8")

    assert "do not publish per-language alternates for the same URL" in strategy
    assert "alternates:" not in layout
