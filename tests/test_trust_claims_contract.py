from pathlib import Path
import json
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def test_trust_claims_contract_files_exist() -> None:
    contract = json.loads((ROOT / "docs" / "trust_claims_contract.json").read_text(encoding="utf-8"))
    for rule in contract["rules"]:
        for rel_path in rule["files"]:
            assert (ROOT / rel_path).is_file(), rel_path


def test_trust_claims_check_script_passes() -> None:
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "check_trust_claims.py")],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr or result.stdout
