"use client";

import { useEffect, useState } from "react";
import { track } from "../lib/analytics";
import { useUiLang } from "../lib/ui-lang-store";
import { verifyAep, type VerifyResult } from "./aep";
import type { UiLang } from "./verify-copy";

export function useVerifyWorkflow() {
  const lang = useUiLang() as UiLang;
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    track("verify_page_open", { lang });
  }, [lang]);

  async function verifyBuffer(buffer: ArrayBuffer, label: string) {
    setBusy(true);
    setFileName(label);
    setResult(null);
    track("verify_attempt", { lang, source: label === "/data/snapshot.aep" ? "live" : "file" });
    try {
      const nextResult = await verifyAep(buffer);
      setResult(nextResult);
      track("verify_result", {
        lang,
        ok: nextResult.ok,
        verification_level: nextResult.verificationLevel ?? null,
        mode: String(nextResult.manifest?.mode ?? ""),
      });
    } catch (error) {
      setResult({ ok: false, reason: (error as Error).message });
      track("verify_result", {
        lang,
        ok: false,
        verification_level: null,
        mode: null,
      });
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File) {
    const buffer = await file.arrayBuffer();
    void verifyBuffer(buffer, file.name);
  }

  async function onVerifyLive() {
    const response = await fetch("/data/snapshot.aep", { cache: "no-store" });
    if (!response.ok) {
      setResult({ ok: false, reason: `live snapshot fetch failed: HTTP ${response.status}` });
      setFileName("/data/snapshot.aep");
      track("verify_result", {
        lang,
        ok: false,
        verification_level: null,
        mode: null,
      });
      return;
    }
    const buffer = await response.arrayBuffer();
    void verifyBuffer(buffer, "/data/snapshot.aep");
  }

  return {
    lang,
    busy,
    result,
    fileName,
    onFile,
    onVerifyLive,
  };
}
