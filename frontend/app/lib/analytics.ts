"use client";

export type AnalyticsEvent =
  | "dashboard_open"
  | "filters_changed"
  | "place_selected"
  | "watchlist_toggled"
  | "history_toggled"
  | "measurements_toggled"
  | "info_opened"
  | "share_click"
  | "verify_page_open"
  | "verify_attempt"
  | "verify_result"
  | "data_gap_notice_impression"
  | "data_gap_notice_dismissed"
  | "signed_badge_click"
  | "web_vital";

type AnalyticsPayload = {
  event: AnalyticsEvent;
  ts: string;
  meta?: Record<string, string | number | boolean | null>;
};

const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

export function track(event: AnalyticsEvent, meta?: AnalyticsPayload["meta"]): void {
  if (!endpoint) return;
  const payload: AnalyticsPayload = {
    event,
    ts: new Date().toISOString(),
    meta
  };
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(endpoint, JSON.stringify(payload));
    return;
  }
  void fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}
