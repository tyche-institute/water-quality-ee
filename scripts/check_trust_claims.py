#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "docs" / "trust_claims_contract.json"


def load_contract() -> dict:
    return json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))


def validate_rule(rule: dict) -> list[str]:
    errors: list[str] = []
    files = [ROOT / path for path in rule.get("files", [])]

    for file_path in files:
        if not file_path.is_file():
            errors.append(f"[{rule['id']}] missing file: {file_path.relative_to(ROOT)}")
            continue

        content = file_path.read_text(encoding="utf-8")

        for needle in rule.get("must_contain", []):
            if needle not in content:
                errors.append(
                    f"[{rule['id']}] missing required text in {file_path.relative_to(ROOT)}: {needle!r}"
                )

        for needle in rule.get("must_not_contain", []):
            if needle in content:
                errors.append(
                    f"[{rule['id']}] forbidden text present in {file_path.relative_to(ROOT)}: {needle!r}"
                )

    return errors


def main() -> int:
    contract = load_contract()
    errors: list[str] = []

    for rule in contract.get("rules", []):
        errors.extend(validate_rule(rule))

    if errors:
        print("trust claims check failed", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("trust claims check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
