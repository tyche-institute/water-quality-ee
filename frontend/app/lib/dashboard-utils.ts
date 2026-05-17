"use client";

import type { FrontendPlace } from "./types";
import type { DashboardLang } from "./dashboard-types";
import type { PlacesTableSortKey } from "./use-dashboard-watchlist";

export function lruet<T>(lang: DashboardLang, ru: T, et: T, en: T): T {
  if (lang === "ru") return ru;
  if (lang === "et") return et;
  return en;
}

export function formatLocalizedCount(
  lang: DashboardLang,
  count: number,
  forms: { ru: [string, string, string]; et: [string, string]; en: [string, string] },
): string {
  const absCount = Math.abs(count);

  if (lang === "ru") {
    const mod10 = absCount % 10;
    const mod100 = absCount % 100;
    const noun =
      mod10 === 1 && mod100 !== 11
        ? forms.ru[0]
        : mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)
          ? forms.ru[1]
          : forms.ru[2];
    return `${count} ${noun}`;
  }

  if (lang === "et") {
    return `${count} ${count === 1 ? forms.et[0] : forms.et[1]}`;
  }

  return `${count} ${count === 1 ? forms.en[0] : forms.en[1]}`;
}

export function fmtDate(value: string | null): string {
  if (!value) return "n/a";
  const raw = String(value).trim();
  const isoPrefix = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoPrefix) return isoPrefix[1];
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function sampleTimestampMs(place: FrontendPlace): number | null {
  const raw = place.sample_date;
  if (!raw) return null;
  const source = String(raw).trim();
  const iso = source.match(/^(\d{4}-\d{2}-\d{2})/);
  const timestamp = iso ? Date.parse(`${iso[1]}T12:00:00Z`) : Date.parse(source);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function comparePlacesTableBase(
  a: FrontendPlace,
  b: FrontendPlace,
  key: PlacesTableSortKey,
  countyLabel: (county: string | null | undefined) => string,
): number {
  switch (key) {
    case "date": {
      const ta = sampleTimestampMs(a);
      const tb = sampleTimestampMs(b);
      if (ta === null && tb === null) return a.location.localeCompare(b.location, undefined, { sensitivity: "base" });
      if (ta === null) return 1;
      if (tb === null) return -1;
      if (ta !== tb) return ta - tb;
      return a.location.localeCompare(b.location, undefined, { sensitivity: "base" });
    }
    case "prob": {
      const pa = a.model_violation_prob;
      const pb = b.model_violation_prob;
      if (pa === null && pb === null) return a.location.localeCompare(b.location, undefined, { sensitivity: "base" });
      if (pa === null) return 1;
      if (pb === null) return -1;
      if (pa !== pb) return pa - pb;
      return a.location.localeCompare(b.location, undefined, { sensitivity: "base" });
    }
    case "location":
      return a.location.localeCompare(b.location, undefined, { sensitivity: "base" });
    case "county":
      return countyLabel(a.county).localeCompare(countyLabel(b.county), undefined, { sensitivity: "base" });
    default:
      return 0;
  }
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}
