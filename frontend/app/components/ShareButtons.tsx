"use client";

import { useState, useSyncExternalStore } from "react";
import { track } from "../lib/analytics";
import type { DashboardLang } from "../lib/dashboard-types";
import { buildPlaceUrl } from "../lib/url-state";

// `navigator.share` availability is a stable browser capability that
// doesn't change at runtime, but we still need useSyncExternalStore
// (rather than a plain `useEffect` + `setState`) to avoid the
// "synchronous setState in effect" lint rule and to render correctly
// across SSR / hydration.
const subscribeNoop = () => () => {};
const getNativeShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const getNativeShareServer = () => false;

type Props = {
  placeId: string;
  placeName: string;
  county: string | null;
  lang: DashboardLang;
};

const t = {
  share: { ru: "Поделиться", et: "Jaga", en: "Share" },
  copy: { ru: "Скопировать ссылку", et: "Kopeeri link", en: "Copy link" },
  copied: { ru: "Скопировано", et: "Kopeeritud", en: "Copied" },
};

function pickShareText(placeName: string, county: string | null, lang: DashboardLang): string {
  const where = county ? `${placeName} (${county})` : placeName;
  if (lang === "et") return `${where} — H2O Atlas, Eesti veekvaliteedi kaart`;
  if (lang === "en") return `${where} — H2O Atlas, Estonian water-quality map`;
  return `${where} — H2O Atlas, карта качества воды Эстонии`;
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export default function ShareButtons({ placeId, placeName, county, lang }: Props) {
  const [copied, setCopied] = useState(false);
  const [shareFallbackOk, setShareFallbackOk] = useState(false);
  const canNativeShare = useSyncExternalStore(subscribeNoop, getNativeShare, getNativeShareServer);

  const url = buildPlaceUrl(placeId);
  const text = pickShareText(placeName, county, lang);

  const onShare = async () => {
    if (canNativeShare) {
      track("share_click", { network: "native", place_id: placeId });
      try {
        await navigator.share({ title: placeName, text, url });
      } catch {
        /* user cancelled — no-op */
      }
      return;
    }
    // Browsers without navigator.share (mostly Firefox desktop) — fall back
    // to copying the URL and showing a transient checkmark on the share
    // button. Effectively merges Share + Copy on those browsers, which is
    // better than dead-end silence.
    track("share_click", { network: "share-fallback-copy", place_id: placeId });
    const ok = await copyToClipboard(url);
    if (ok) {
      setShareFallbackOk(true);
      setTimeout(() => setShareFallbackOk(false), 1800);
    }
  };

  const onCopy = async () => {
    track("share_click", { network: "copy", place_id: placeId });
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const shareLabel = shareFallbackOk ? t.copied[lang] : t.share[lang];
  const copyLabel = copied ? t.copied[lang] : t.copy[lang];

  return (
    <div className="shareDock" role="group" aria-label={t.share[lang]}>
      <button
        type="button"
        className="shareIconBtn"
        onClick={onShare}
        aria-label={shareLabel}
        title={shareLabel}
      >
        {shareFallbackOk ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          /* iOS-style "share" glyph — universal pictogram, reads as "share"
             on every platform without needing the word. */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
      </button>
      <button
        type="button"
        className="shareIconBtn"
        onClick={onCopy}
        aria-label={copyLabel}
        title={copyLabel}
      >
        {copied ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}
