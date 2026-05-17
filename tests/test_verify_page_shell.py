from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_verify_page_uses_server_wrapper_with_metadata() -> None:
    page = (ROOT / "frontend" / "app" / "verify" / "page.tsx").read_text(encoding="utf-8")
    assert '"use client"' not in page
    assert "export const metadata" in page
    assert 'import VerifyPageClient from "./VerifyPageClient"' in page


def test_verify_page_client_exists_and_owns_interaction_logic() -> None:
    client = (ROOT / "frontend" / "app" / "verify" / "VerifyPageClient.tsx").read_text(encoding="utf-8")
    assert '"use client"' in client
    assert "useVerifyWorkflow" in client
    assert 'className="page verifyPage"' in client
