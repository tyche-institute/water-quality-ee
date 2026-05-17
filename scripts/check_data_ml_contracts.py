#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "docs" / "data_ml_contract.json"


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _source_place_id(place: dict[str, Any], index: int) -> str:
    return str(place.get("sample_id") or f"place-{index}")


def _check_required_fields(entity: dict[str, Any], fields: list[str], label: str, errors: list[str]) -> None:
    for field in fields:
        if field not in entity:
            errors.append(f"{label} missing required field: {field}")


def _check_frontend_places(
    contract: dict[str, Any],
    frontend_snapshot: dict[str, Any],
    details_snapshot: dict[str, Any],
    history_snapshot: dict[str, Any],
    source_by_id: dict[str, dict[str, Any]],
    errors: list[str],
) -> None:
    places = frontend_snapshot.get("places")
    if not isinstance(places, list) or not places:
        errors.append("frontend snapshot places must be a non-empty list")
        return

    place_ids = set()
    required_fields = contract["frontend_place_required"]
    forbidden_fields = set(contract["frontend_place_forbidden"])
    allowed_risk_levels = set(contract["allowed_risk_levels"])
    allowed_audit_buckets = set(contract["allowed_audit_buckets"])
    allowed_uncertainty_levels = set(contract["allowed_uncertainty_levels"])
    allowed_data_quality_flags = set(contract["allowed_data_quality_flags"])
    provenance_fields = contract["per_place_provenance_fields"]
    max_history_entries = int(contract["max_history_entries_per_place"])
    root_has_model_version = frontend_snapshot.get("model_version") is not None

    for place in places:
        if not isinstance(place, dict):
            errors.append("frontend snapshot place entry must be an object")
            continue
        _check_required_fields(place, required_fields, f"frontend place {place.get('id')!r}", errors)

        place_id = place.get("id")
        if not isinstance(place_id, str) or not place_id:
            errors.append("frontend place has invalid id")
            continue
        if place_id in place_ids:
            errors.append(f"duplicate frontend place id: {place_id}")
        place_ids.add(place_id)

        forbidden_present = sorted(forbidden_fields.intersection(place))
        if forbidden_present:
            errors.append(f"frontend place {place_id} still carries split payload fields: {forbidden_present}")

        if place.get("risk_level") not in allowed_risk_levels:
            errors.append(f"frontend place {place_id} has invalid risk_level: {place.get('risk_level')!r}")
        if place.get("audit_bucket") not in allowed_audit_buckets:
            errors.append(f"frontend place {place_id} has invalid audit_bucket: {place.get('audit_bucket')!r}")
        if place.get("uncertainty_level") not in allowed_uncertainty_levels:
            errors.append(f"frontend place {place_id} has invalid uncertainty_level: {place.get('uncertainty_level')!r}")
        if not isinstance(place.get("data_quality_flags"), list):
            errors.append(f"frontend place {place_id} data_quality_flags must be a list")
        elif not set(place.get("data_quality_flags") or []).issubset(allowed_data_quality_flags):
            errors.append(f"frontend place {place_id} has unexpected data_quality_flags")

        source_place = source_by_id.get(place_id)
        if source_place is None:
            errors.append(f"frontend place {place_id} missing in source snapshot")
            continue

        if root_has_model_version:
            for field in provenance_fields:
                if source_place.get(field) and not place.get(field):
                    errors.append(f"frontend place {place_id} lost provenance field: {field}")

        detail = details_snapshot.get(place_id)
        if detail is not None and not isinstance(detail, dict):
            errors.append(f"details asset entry for {place_id} must be an object")

        history = history_snapshot.get(place_id)
        if history is not None:
            if not isinstance(history, list):
                errors.append(f"history asset entry for {place_id} must be a list")
            elif len(history) > max_history_entries:
                errors.append(f"history asset entry for {place_id} exceeds {max_history_entries} entries")

    detail_ids = set(details_snapshot)
    history_ids = set(history_snapshot)
    if not detail_ids.issubset(place_ids):
        errors.append("details asset contains ids absent from frontend snapshot")
    if not history_ids.issubset(place_ids):
        errors.append("history asset contains ids absent from frontend snapshot")


def _check_root_sync(
    contract: dict[str, Any],
    source_snapshot: dict[str, Any],
    frontend_snapshot: dict[str, Any],
    errors: list[str],
) -> None:
    required_root = contract["frontend_root_required"]
    _check_required_fields(frontend_snapshot, required_root, "frontend snapshot", errors)

    places = frontend_snapshot.get("places")
    places_count = frontend_snapshot.get("places_count")
    if isinstance(places, list) and places_count != len(places):
        errors.append(f"frontend places_count mismatch: {places_count} != {len(places)}")

    allowed_available_models = set(contract["allowed_available_models"])
    available_models = frontend_snapshot.get("available_models")
    if not isinstance(available_models, list) or not set(available_models).issubset(allowed_available_models):
        errors.append("frontend available_models contains unexpected values")

    canonical_model = frontend_snapshot.get("canonical_model")
    allowed_canonical = set(contract["allowed_canonical_models"])
    if canonical_model is not None and canonical_model not in allowed_canonical:
        errors.append(f"frontend canonical_model is invalid: {canonical_model!r}")

    diagnostics = frontend_snapshot.get("diagnostics")
    if not isinstance(diagnostics, dict):
        errors.append("frontend diagnostics must be an object")
    else:
        uncertainty_summary = diagnostics.get("uncertainty_summary")
        if not isinstance(uncertainty_summary, dict):
            errors.append("frontend diagnostics.uncertainty_summary must be an object")
        else:
            for key in ("method", "audit_bucket_counts", "uncertainty_level_counts", "places_with_publication_gap", "flag_counts"):
                if key not in uncertainty_summary:
                    errors.append(f"frontend diagnostics.uncertainty_summary missing field: {key}")

    refresh_history = frontend_snapshot.get("refresh_history")
    if not isinstance(refresh_history, list) or not refresh_history:
        errors.append("frontend refresh_history must be a non-empty list")
    else:
        for idx, entry in enumerate(refresh_history):
            if not isinstance(entry, dict):
                errors.append(f"frontend refresh_history[{idx}] must be an object")
                continue
            for field in (
                "generated_at",
                "places_count",
                "official_violation_share",
                "model_coverage_share",
                "publication_gap_count",
            ):
                if field not in entry:
                    errors.append(f"frontend refresh_history[{idx}] missing field: {field}")

    for field in contract["source_snapshot_root_sync"]:
        if source_snapshot.get(field) != frontend_snapshot.get(field):
            errors.append(f"source/frontend root field mismatch: {field}")


def main() -> int:
    contract = _load_json(CONTRACT_PATH)
    source_snapshot = _load_json(ROOT / contract["source_snapshot"])
    frontend_snapshot = _load_json(ROOT / contract["frontend_snapshot"])
    history_snapshot = _load_json(ROOT / contract["history_snapshot"])
    details_snapshot = _load_json(ROOT / contract["details_snapshot"])
    errors: list[str] = []

    if not isinstance(history_snapshot, dict) or not history_snapshot:
        errors.append("history snapshot must be a non-empty object")
    if not isinstance(details_snapshot, dict) or not details_snapshot:
        errors.append("details snapshot must be a non-empty object")
    if not isinstance(source_snapshot, dict):
        errors.append("source snapshot must be an object")
    if not isinstance(frontend_snapshot, dict):
        errors.append("frontend snapshot must be an object")

    if errors:
        print("data/ml contract check failed", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    source_places = source_snapshot.get("places")
    if not isinstance(source_places, list) or not source_places:
        print("data/ml contract check failed", file=sys.stderr)
        print("- source snapshot places must be a non-empty list", file=sys.stderr)
        return 1

    source_by_id = {
        _source_place_id(place, index): place
        for index, place in enumerate(source_places)
        if isinstance(place, dict)
    }

    _check_root_sync(contract, source_snapshot, frontend_snapshot, errors)
    _check_frontend_places(
        contract,
        frontend_snapshot,
        details_snapshot,
        history_snapshot,
        source_by_id,
        errors,
    )

    if errors:
        print("data/ml contract check failed", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("data/ml contract check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
