#!/usr/bin/env python3
"""Fail loudly when frontend trust rules drift away from backend source-of-truth norms."""

from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from features import NORMS, NORMS_POOL  # noqa: E402


def main() -> int:
    norms_path = ROOT / "frontend" / "app" / "lib" / "water-rules.json"
    payload = json.loads(norms_path.read_text(encoding="utf-8"))
    rules = payload["rules"]

    expected = {
        ("e_coli", "supluskoha", "max"): NORMS["e_coli"],
        ("e_coli", "basseinid", "exact"): NORMS_POOL["e_coli"],
        ("enterococci", "supluskoha", "max"): NORMS["enterococci"],
        ("coliforms", "basseinid", "exact"): NORMS_POOL["coliforms"],
        ("pseudomonas", "basseinid", "exact"): NORMS_POOL["pseudomonas"],
        ("staphylococci", "basseinid", "max"): NORMS_POOL["staphylococci"],
        ("ph", "basseinid", "min"): NORMS_POOL["ph_min"],
        ("ph", "basseinid", "max"): NORMS_POOL["ph_max"],
        ("ph", "veevark", "min"): 6.5,
        ("ph", "veevark", "max"): 9.5,
        ("ph", "joogivesi", "min"): 6.5,
        ("ph", "joogivesi", "max"): 9.5,
        ("ph", "default", "min"): NORMS["ph_min"],
        ("ph", "default", "max"): NORMS["ph_max"],
        ("nitrates", "default", "max"): NORMS["nitrates"],
        ("nitrites", "default", "max"): NORMS["nitrites"],
        ("ammonium", "default", "max"): NORMS["ammonium"],
        ("fluoride", "default", "max"): NORMS["fluoride"],
        ("manganese", "default", "max"): NORMS["manganese"],
        ("iron", "default", "max"): NORMS["iron"],
        ("turbidity", "basseinid", "max"): NORMS_POOL["turbidity"],
        ("turbidity", "default", "max"): NORMS["turbidity"],
        ("color", "default", "max"): NORMS["color"],
        ("chlorides", "default", "max"): NORMS["chlorides"],
        ("sulfates", "default", "max"): NORMS["sulfates"],
        ("free_chlorine", "basseinid", "min"): NORMS_POOL["free_chlorine_min"],
        ("free_chlorine", "basseinid", "max"): NORMS_POOL["free_chlorine_max"],
        ("combined_chlorine", "basseinid", "max"): NORMS_POOL["combined_chlorine"],
    }

    mismatches: list[str] = []
    for (param, domain, field), expected_value in expected.items():
        actual_value = rules.get(param, {}).get(domain, {}).get(field)
        if actual_value != expected_value:
            mismatches.append(
                f"{param}.{domain}.{field}: frontend/reference={actual_value!r}, backend={expected_value!r}"
            )

    if mismatches:
        print("Water norm drift detected between backend and frontend reference:")
        for mismatch in mismatches:
            print(f" - {mismatch}")
        return 1

    print(f"Water norms are in sync: {norms_path.relative_to(ROOT)} (version={payload.get('version')})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
