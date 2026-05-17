"use client";

import type { DashboardLang } from "./dashboard-types";
import { formatLocalizedCount, lruet } from "./dashboard-utils";
import type { FrontendRefreshHistoryEntry } from "./types";

export function formatRefreshHistoryTimestamp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return raw;
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      " " + dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC", hour12: false }) + " UTC";
  } catch {
    return raw;
  }
}

function formatSignedDelta(value: number, suffix = ""): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${suffix}`;
}

export function describeRefreshDelta(lang: DashboardLang, entry: FrontendRefreshHistoryEntry | null | undefined): string | null {
  const delta = entry?.changes_from_previous;
  if (!delta) return null;

  const parts: string[] = [];
  if (delta.places_count_delta !== 0) {
    parts.push(
      lruet(
        lang,
        `${formatSignedDelta(delta.places_count_delta)} точек`,
        `${formatSignedDelta(delta.places_count_delta)} punkti`,
        `${formatSignedDelta(delta.places_count_delta)} places`,
      ),
    );
  }
  if (delta.official_violation_share_delta_pp !== null && delta.official_violation_share_delta_pp !== 0) {
    parts.push(
      lruet(
        lang,
        `${formatSignedDelta(delta.official_violation_share_delta_pp, " п.п.")} нарушений`,
        `${formatSignedDelta(delta.official_violation_share_delta_pp, " pp")} rikkumisi`,
        `${formatSignedDelta(delta.official_violation_share_delta_pp, " pp")} violations`,
      ),
    );
  }
  if (delta.publication_gap_count_delta !== 0) {
    const countText = formatLocalizedCount(lang, delta.publication_gap_count_delta, {
      ru: ["скрытое нарушение", "скрытых нарушения", "скрытых нарушений"],
      et: ["peidetud rikkumine", "peidetud rikkumist"],
      en: ["hidden violation", "hidden violations"],
    });
    parts.push(
      countText,
    );
  }
  if (delta.model_coverage_share_delta_pp !== null && delta.model_coverage_share_delta_pp !== 0) {
    parts.push(
      lruet(
        lang,
        `${formatSignedDelta(delta.model_coverage_share_delta_pp, " п.п.")} покрытия модели`,
        `${formatSignedDelta(delta.model_coverage_share_delta_pp, " pp")} mudeli katvust`,
        `${formatSignedDelta(delta.model_coverage_share_delta_pp, " pp")} model coverage`,
      ),
    );
  }

  if (!parts.length) {
    return lruet(lang, "Без заметных изменений", "Ilma märgatava muutuseta", "No material change");
  }

  return parts.join(" · ");
}
