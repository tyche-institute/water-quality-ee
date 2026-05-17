"use client";

import { useCallback } from "react";
import type { DashboardTheme } from "./dashboard-types";
import type { FrontendPlace } from "./types";

export function useDashboardViewFilterActions({
  setUserCoords,
  setNearbyOnly,
  setGeoError,
  setSampleDateFrom,
  setSampleDateTo,
  setTheme,
  explainViolationFromMeasurements,
  historyMeasurements,
}: {
  setUserCoords: (value: { lat: number; lon: number } | null) => void;
  setNearbyOnly: (value: boolean) => void;
  setGeoError: (value: string | null) => void;
  setSampleDateFrom: (value: string) => void;
  setSampleDateTo: (value: string) => void;
  setTheme: (value: DashboardTheme) => void;
  explainViolationFromMeasurements: (domain: string, measurements: Record<string, number>) => string;
  historyMeasurements: (place: FrontendPlace, idx: number) => Record<string, number>;
}) {
  const clearNearMe = useCallback(() => {
    setUserCoords(null);
    setNearbyOnly(false);
    setGeoError(null);
  }, [setGeoError, setNearbyOnly, setUserCoords]);

  const clearGeoError = useCallback(() => {
    setGeoError(null);
  }, [setGeoError]);

  const clearSampleDates = useCallback(() => {
    setSampleDateFrom("");
    setSampleDateTo("");
  }, [setSampleDateFrom, setSampleDateTo]);

  const explainViolationFromHistory = useCallback((place: FrontendPlace, idx: number) => {
    return explainViolationFromMeasurements(place.domain, historyMeasurements(place, idx));
  }, [explainViolationFromMeasurements, historyMeasurements]);

  const setMobileSheetTheme = useCallback((nextTheme: DashboardTheme) => {
    setTheme(nextTheme);
  }, [setTheme]);

  return {
    clearNearMe,
    clearGeoError,
    clearSampleDates,
    explainViolationFromHistory,
    setMobileSheetTheme,
  };
}
