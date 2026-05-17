from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_data_ml_contract_assets_exist() -> None:
    assert (ROOT / "docs" / "data_ml_contract.json").is_file()
    assert (ROOT / "docs" / "data_ml_contract.md").is_file()
    assert (ROOT / "scripts" / "check_data_ml_contracts.py").is_file()


def test_release_verification_runs_data_ml_contract_check() -> None:
    verify_release = (ROOT / "scripts" / "verify_release.sh").read_text(encoding="utf-8")
    assert 'python3 "$ROOT_DIR/scripts/check_data_ml_contracts.py"' in verify_release


def test_release_verification_has_frontend_binary_fallback() -> None:
    verify_release = (ROOT / "scripts" / "verify_release.sh").read_text(encoding="utf-8")
    assert 'run_frontend_bin "eslint/bin/eslint.js" . --max-warnings=0' in verify_release
    assert 'run_frontend_bin "typescript/bin/tsc" --noEmit' in verify_release
    assert 'run_frontend_bin "next/dist/bin/next" build' in verify_release


def test_frontend_contract_doc_points_to_machine_readable_contract() -> None:
    contract_doc = (ROOT / "docs" / "frontend_data_contract.md").read_text(encoding="utf-8")
    assert "docs/data_ml_contract.json" in contract_doc
    assert "scripts/check_data_ml_contracts.py" in contract_doc


def test_layout_does_not_depend_on_remote_google_fonts() -> None:
    layout = (ROOT / "frontend" / "app" / "layout.tsx").read_text(encoding="utf-8")
    assert 'from "next/font/google"' not in layout
