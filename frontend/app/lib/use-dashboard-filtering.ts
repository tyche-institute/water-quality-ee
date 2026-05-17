"use client";

import { useMemo } from "react";
import type { FrontendPlace } from "./types";

type SortState = { key: "date" | "prob" | "location" | "county"; dir: "asc" | "desc" };

type Params = {
  places: FrontendPlace[];
  query: string;
  segment: string;
  risk: string;
  county: string;
  official: "all" | "compliant" | "violation" | "unknown";
  alertsOnly: boolean;
  nearbyOnly: boolean;
  userCoords: { lat: number; lon: number } | null;
  nearbyRadiusKm: number;
  minProb: number;
  sampleDateFrom: string;
  sampleDateTo: string;
  placeCountyGeo: Map<string, string> | null;
  isMobile: boolean;
  placesTableSort: SortState;
  countyKey: (value: string | null | undefined) => string;
  countyPretty: (value: string | null | undefined) => string;
  fmtDate: (value: string | null) => string;
  distanceKm: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  comparePlacesTableBase: (
    a: FrontendPlace,
    b: FrontendPlace,
    key: SortState["key"],
    countyLabel: (c: string | null | undefined) => string,
  ) => number;
};

export function useDashboardFiltering({
  places,
  query,
  segment,
  risk,
  county,
  official,
  alertsOnly,
  nearbyOnly,
  userCoords,
  nearbyRadiusKm,
  minProb,
  sampleDateFrom,
  sampleDateTo,
  placeCountyGeo,
  isMobile,
  placesTableSort,
  countyKey,
  countyPretty,
  fmtDate,
  distanceKm,
  comparePlacesTableBase,
}: Params) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      if (segment !== "all" && p.place_kind !== segment) return false;
      if (risk !== "all" && p.risk_level !== risk) return false;
      if (county !== "all") {
        if (placeCountyGeo) {
          if (placeCountyGeo.get(p.id) !== county) return false;
        } else if (countyKey(p.county || "Unknown") !== county) {
          return false;
        }
      }
      if (official === "compliant" && p.official_compliant !== 1) return false;
      if (official === "violation" && p.official_compliant !== 0) return false;
      if (official === "unknown" && p.official_compliant !== null) return false;
      if (p.model_violation_prob !== null) {
        // Keep filter semantics aligned with the two-decimal probability
        // shown in the UI, otherwise 0.995 appears as 1.00 but disappears
        // when the slider is moved to 1.00.
        const visibleProb = Number(p.model_violation_prob.toFixed(2));
        if (visibleProb < minProb) return false;
      }
      if (alertsOnly && !(p.risk_level === "high" || p.official_compliant === 0)) return false;
      if (nearbyOnly && userCoords) {
        if (distanceKm(userCoords.lat, userCoords.lon, p.lat, p.lon) > nearbyRadiusKm) return false;
      }
      if (sampleDateFrom || sampleDateTo) {
        const pointDate = fmtDate(p.sample_date);
        if (pointDate === "n/a") return false;
        if (sampleDateFrom && pointDate < sampleDateFrom) return false;
        if (sampleDateTo && pointDate > sampleDateTo) return false;
      }
      if (q && !p.search_text.includes(q)) return false;
      return true;
    });
  }, [
    places,
    query,
    segment,
    risk,
    county,
    placeCountyGeo,
    official,
    alertsOnly,
    nearbyOnly,
    userCoords,
    nearbyRadiusKm,
    minProb,
    sampleDateFrom,
    sampleDateTo,
    countyKey,
    fmtDate,
    distanceKm,
  ]);

  const placesTableRows = useMemo(() => {
    const rows = [...filtered];
    const mult = placesTableSort.dir === "asc" ? 1 : -1;
    rows.sort((a, b) => comparePlacesTableBase(a, b, placesTableSort.key, countyPretty) * mult);
    return rows;
  }, [filtered, placesTableSort, comparePlacesTableBase, countyPretty]);

  const mapPlaces = useMemo(() => filtered.slice(0, isMobile ? 1200 : 3000), [filtered, isMobile]);

  const mapAlertsCount = useMemo(
    () => filtered.filter((p) => p.risk_level === "high" || p.official_compliant === 0).length,
    [filtered],
  );

  const mapNearMeCount = useMemo(() => {
    if (!userCoords) return null;
    return filtered.filter((p) => distanceKm(userCoords.lat, userCoords.lon, p.lat, p.lon) <= nearbyRadiusKm).length;
  }, [filtered, userCoords, nearbyRadiusKm, distanceKm]);

  const fitBoundsKey = useMemo(() => {
    if (filtered.length === 0 || filtered.length === places.length) return "";
    const firstId = filtered[0]?.id ?? "";
    const lastId = filtered[filtered.length - 1]?.id ?? "";
    return `${filtered.length}:${firstId}:${lastId}:${query.trim().toLowerCase()}`;
  }, [filtered, places.length, query]);

  const fitBoundsPlaces = useMemo<[number, number][]>(() => {
    if (query.trim().length > 0 && filtered.length > 0) {
      return [[filtered[0].lat, filtered[0].lon]];
    }
    return filtered.map((p) => [p.lat, p.lon]);
  }, [filtered, query]);

  return {
    filtered,
    placesTableRows,
    mapPlaces,
    mapAlertsCount,
    mapNearMeCount,
    fitBoundsKey,
    fitBoundsPlaces,
  };
}
