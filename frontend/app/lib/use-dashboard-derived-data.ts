"use client";

import { useCallback, useMemo } from "react";
import { PARAMETER_CARDS } from "./dashboard-content";
import type { FrontendPlace } from "./types";

export function useDashboardDerivedData({
  places,
  setCounty,
  countyKey,
  countyPretty,
}: {
  places: FrontendPlace[];
  setCounty: (value: string | ((prev: string) => string)) => void;
  countyKey: (value: string | null | undefined) => string;
  countyPretty: (value: string | null | undefined) => string;
}) {
  const counties = useMemo(() => {
    const map = new Map<string, string>();
    places.forEach((place) => {
      const raw = place.county || "Unknown";
      const key = countyKey(raw) || "unknown";
      if (!map.has(key)) map.set(key, countyPretty(raw) || "Unknown");
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [countyKey, countyPretty, places]);

  const placeKinds = useMemo(() => {
    const values = new Set<string>();
    places.forEach((place) => values.add(place.place_kind || "other"));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [places]);

  const domainCounts = useMemo(() => ({
    swimming: places.filter((place) => place.place_kind === "swimming").length,
    pool_spa: places.filter((place) => place.place_kind === "pool_spa").length,
    drinking_water: places.filter((place) => place.place_kind === "drinking_water").length,
    drinking_source: places.filter((place) => place.place_kind === "drinking_source").length,
  }), [places]);

  const parameterCards = useMemo(() => PARAMETER_CARDS, []);

  const handleCountySelect = useCallback((county: string) => {
    setCounty((prev) => (countyKey(prev) === countyKey(county) ? "all" : countyKey(county)));
  }, [countyKey, setCounty]);

  return {
    counties,
    placeKinds,
    domainCounts,
    parameterCards,
    handleCountySelect,
  };
}
