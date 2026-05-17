from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_sign_snapshot_prefers_official_backend_evidence_download() -> None:
    source = (ROOT / "scripts" / "sign_snapshot.py").read_text(encoding="utf-8")
    assert "/api/ai/evidence/" in source
    assert "official backend evidence" in source
    assert "legacy self-bundled backend format" in source


def test_frontend_verifier_supports_official_evidence_package() -> None:
    source = (ROOT / "frontend" / "app" / "verify" / "aep.ts").read_text(encoding="utf-8")
    assert "public_key.pem" in source
    assert "canonical.bin" in source
    assert "hash.sha256" in source
    assert "signature.sig" in source
    assert "recoverRsaDigest" in source
    assert "verifyOfficialEvidence" in source


def test_frontend_verifier_keeps_legacy_integrity_path_during_transition() -> None:
    source = (ROOT / "frontend" / "app" / "verify" / "aep.ts").read_text(encoding="utf-8")
    assert 'verificationLevel: "integrity"' in source
    assert "legacy bundle: integrity chain verified" in source
