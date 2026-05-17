"use client";

import { useEffect, useMemo, useState } from "react";
import type { FrontendPlace } from "../lib/types";
import { countyNameNorm as geoCountyNameNorm } from "../lib/geo";

const countyNameNorm = geoCountyNameNorm;

const countyDisplay = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

type Props = {
  places: FrontendPlace[];
  selectedCounty?: string;
  showCountyOverlay: boolean;
  countyGeoJsonProp?: GeoJSON.GeoJsonObject | null;
};

export function useMapCountyData({
  places,
  selectedCounty,
  showCountyOverlay,
  countyGeoJsonProp,
}: Props) {
  const selectedCountyNorm = selectedCounty ? countyNameNorm(selectedCounty) : null;
  const countyRisk = useMemo(() => {
    const acc = new Map<string, { sum: number; n: number }>();
    for (const place of places) {
      const county = countyDisplay((place.county || "").trim());
      if (!county || place.model_violation_prob === null) continue;
      const prev = acc.get(county) || { sum: 0, n: 0 };
      prev.sum += place.model_violation_prob;
      prev.n += 1;
      acc.set(county, prev);
    }
    const out = new Map<string, number>();
    for (const [key, value] of acc.entries()) out.set(key, value.sum / Math.max(1, value.n));
    return out;
  }, [places]);
  const countySampleCount = useMemo(() => {
    const acc = new Map<string, number>();
    for (const place of places) {
      const county = countyDisplay((place.county || "").trim());
      if (!county || place.model_violation_prob === null) continue;
      acc.set(county, (acc.get(county) || 0) + 1);
    }
    return acc;
  }, [places]);
  const [countyGeoJsonLocal, setCountyGeoJsonLocal] = useState<GeoJSON.GeoJsonObject | null>(null);
  const countyGeoJson = countyGeoJsonProp ?? countyGeoJsonLocal;

  useEffect(() => {
    if (!showCountyOverlay) return;
    if (countyGeoJson) return;
    if (countyGeoJsonProp !== undefined) return;
    let alive = true;
    const idle = (cb: () => void) => {
      const ric = (window as unknown as { requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
      if (typeof ric === "function") return ric(cb, { timeout: 2000 });
      return window.setTimeout(cb, 300);
    };
    const cancelIdle = (id: number) => {
      const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (typeof cic === "function") cic(id);
      else window.clearTimeout(id);
    };
    const handle = idle(() => {
      if (!alive) return;
      fetch("/data/estonia_counties_simplified.geojson", { cache: "force-cache" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!alive) return;
          setCountyGeoJsonLocal(data);
        })
        .catch(() => {
          if (!alive) return;
          setCountyGeoJsonLocal(null);
        });
    });
    return () => {
      alive = false;
      cancelIdle(handle);
    };
  }, [showCountyOverlay, countyGeoJson, countyGeoJsonProp]);

  return {
    selectedCountyNorm,
    countyRisk,
    countySampleCount,
    countyGeoJson,
  };
}
