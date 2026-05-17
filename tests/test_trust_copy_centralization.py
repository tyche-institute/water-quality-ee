from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_shared_trust_copy_module_exists() -> None:
    trust_copy = ROOT / "frontend" / "app" / "lib" / "trust-copy.ts"
    assert trust_copy.is_file()
    content = trust_copy.read_text(encoding="utf-8")
    assert "verifyIntro" in content
    assert "footerDisclaimer" in content
    assert "dataGapBody" in content


def test_high_risk_surfaces_use_shared_trust_copy() -> None:
    verify_copy = (ROOT / "frontend" / "app" / "verify" / "verify-copy.ts").read_text(encoding="utf-8")
    data_gap_notice = (ROOT / "frontend" / "app" / "components" / "DataGapNotice.tsx").read_text(encoding="utf-8")
    footer_note = (ROOT / "frontend" / "app" / "components" / "FooterNote.tsx").read_text(encoding="utf-8")
    home_page = (ROOT / "frontend" / "app" / "page.tsx").read_text(encoding="utf-8")

    assert 'from "../lib/trust-copy"' in verify_copy
    assert "TRUST_COPY.ru.verifyIntro" in verify_copy
    assert 'from "../lib/trust-copy"' in data_gap_notice
    assert "const copy = TRUST_COPY[lang]" in data_gap_notice
    assert 'from "../lib/trust-copy"' in footer_note
    assert "copy.footerDisclaimer" in footer_note
    assert 'import FooterNote from "./components/FooterNote"' in home_page


def test_site_shell_uses_lang_bootstrap_and_shared_metadata() -> None:
    layout = (ROOT / "frontend" / "app" / "layout.tsx").read_text(encoding="utf-8")
    site_metadata = (ROOT / "frontend" / "app" / "lib" / "site-metadata.ts").read_text(encoding="utf-8")

    assert 'document.documentElement.lang' in layout
    assert 'from "./lib/site-metadata"' in layout
    assert "export const SITE_ORIGIN" in site_metadata
    assert "export const ROOT_TITLE" in site_metadata
    assert "export const VERIFY_TITLE" in site_metadata
