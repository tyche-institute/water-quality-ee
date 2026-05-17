from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_package_exposes_live_ux_smoke_script() -> None:
    package = json.loads((ROOT / "frontend" / "package.json").read_text(encoding="utf-8"))

    assert package["scripts"]["ux:smoke"] == "node scripts/ux-smoke.mjs"
    assert package["scripts"]["ux:smoke:live"] == "node scripts/ux-smoke-live.mjs"


def test_live_ux_smoke_wrapper_retries_without_changing_strict_smoke() -> None:
    source = (ROOT / "frontend" / "scripts" / "ux-smoke-live.mjs").read_text(encoding="utf-8")

    assert '"https://h2oatlas.ee"' in source
    assert "H2O_UX_ATTEMPTS" in source
    assert "H2O_UX_RETRY_DELAY_MS" in source
    assert "spawn(process.execPath" in source
    assert 'join(SCRIPT_DIR, "ux-smoke.mjs")' in source
    assert "H2O_UX_BASE_URL: BASE_URL" in source
    assert "H2O_UX_OUT_DIR: outDir" in source


def test_live_ux_smoke_docs_explain_retry_scope() -> None:
    operations = (ROOT / "docs" / "OPERATIONS.md").read_text(encoding="utf-8")
    frontend_readme = (ROOT / "frontend" / "README.md").read_text(encoding="utf-8")

    assert "npm run ux:smoke:live" in operations
    assert "H2O_UX_ATTEMPTS=1" in operations
    assert "Pages can briefly serve HTML before all new Next.js chunks are available" in operations
    assert "npm run ux:smoke:live" in frontend_readme
    assert "3 попытки" in frontend_readme
