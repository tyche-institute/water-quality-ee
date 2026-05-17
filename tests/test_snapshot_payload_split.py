from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_place_details_hook_replaces_history_only_hook() -> None:
    details_hook = ROOT / "frontend" / "app" / "lib" / "use-place-details.ts"
    history_hook = ROOT / "frontend" / "app" / "lib" / "use-place-history.ts"
    collections = (ROOT / "frontend" / "app" / "lib" / "use-place-collections.ts").read_text(encoding="utf-8")

    assert details_hook.is_file()
    assert not history_hook.exists()
    assert 'from "./use-place-details"' in collections
    assert "usePlaceWithDetails(selectedPlaceBase)" in collections


def test_exporter_writes_details_asset_and_splits_payload() -> None:
    exporter = (ROOT / "citizen-service" / "scripts" / "export_frontend_snapshot.py").read_text(encoding="utf-8")
    assert "DST_DETAILS" in exporter
    assert '"measurements_count": len(measurements)' in exporter
    assert '"measurements": measurements' not in exporter.split("place_out = {", 1)[1].split("}", 1)[0]
    assert '"sample_history": sample_history[:12]' not in exporter.split("place_out = {", 1)[1].split("}", 1)[0]
    assert "DST_DETAILS.write_text" in exporter
