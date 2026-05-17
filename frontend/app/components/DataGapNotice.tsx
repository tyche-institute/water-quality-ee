"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { track } from "../lib/analytics";
import { TRUST_COPY } from "../lib/trust-copy";
import { useUiLang } from "../lib/ui-lang-store";

const STORAGE_KEY = "water.ui.dataGapNoticeDismissed";
const DATA_GAP_DISMISSED_EVENT = "water-ui-data-gap-dismissed";

function readDataGapVisible(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

function subscribeDataGapVisible(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };

  window.addEventListener(DATA_GAP_DISMISSED_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DATA_GAP_DISMISSED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export default function DataGapNotice() {
  const lang = useUiLang();
  const storedVisible = useSyncExternalStore(subscribeDataGapVisible, readDataGapVisible, () => true);
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const visible = storedVisible && !dismissedForSession;

  useEffect(() => {
    if (!visible) return;
    track("data_gap_notice_impression", { lang });
  }, [lang, visible]);

  if (!visible) return null;

  const copy = TRUST_COPY[lang];

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
      window.dispatchEvent(new Event(DATA_GAP_DISMISSED_EVENT));
    } catch {
      // localStorage unavailable (private mode, etc.) — dismiss only for the session.
    }
    track("data_gap_notice_dismissed", { lang });
    setDismissedForSession(true);
  };

  return (
    <aside
      role="note"
      aria-label={copy.dataGapTitle}
      className="trustNotice"
    >
      <div className="trustNoticeInner">
        <div className="trustNoticeCopy">
          <strong className="trustNoticeTitle">{copy.dataGapTitle}</strong>
          <span>{copy.dataGapBody}</span>{" "}
          <a
            href="https://github.com/tyche-institute/water-quality-ee/blob/main/docs/phase_10_findings.md"
            target="_blank"
            rel="noreferrer"
          >
            {copy.dataGapMore}
          </a>
          .
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="trustNoticeDismiss"
        >
          {copy.dataGapDismiss}
        </button>
      </div>
    </aside>
  );
}
