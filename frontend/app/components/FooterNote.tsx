"use client";

import { TRUST_COPY } from "../lib/trust-copy";
import { useUiLang } from "../lib/ui-lang-store";

export default function FooterNote() {
  const lang = useUiLang();
  const currentYear = new Date().getFullYear();
  const copy = TRUST_COPY[lang];

  return (
    <footer className="footerNote">
      <p>
        &copy; {currentYear} H2O Atlas &middot;{" "}
        <a href="https://github.com/tyche-institute/water-quality-ee" target="_blank" rel="noreferrer">GitHub</a>
        {" "}&middot; TalTech Masin&otilde;pe 2026
      </p>
      <p className="footerSub">
        Data: <a href="https://vtiav.sm.ee" target="_blank" rel="noreferrer">Terviseamet</a> open data &middot; {copy.footerDisclaimer}
      </p>
    </footer>
  );
}
