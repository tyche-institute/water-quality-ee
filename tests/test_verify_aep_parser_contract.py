from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_verify_aep_parser_supports_central_directory_and_local_header_fallback() -> None:
    source = (ROOT / "frontend" / "app" / "verify" / "aep.ts").read_text(encoding="utf-8")
    assert "function findLastSignature" in source
    assert "0x06054b50" in source
    assert "0x02014b50" in source
    assert "readAepFromCentralDirectory" in source
    assert "readAepFromLocalHeaders" in source
    assert "return await readAepFromCentralDirectory(bytes);" in source
