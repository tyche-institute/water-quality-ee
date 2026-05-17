"use client";

import type { DashboardLang, DashboardTheme } from "./dashboard-types";
import type { FrontendPlace } from "./types";
import { useDashboardInfoPageActions } from "./use-dashboard-info-page-actions";
import { useDashboardViewFilterActions } from "./use-dashboard-view-filter-actions";
import { useDashboardViewPreferenceActions } from "./use-dashboard-view-preference-actions";

export function useDashboardViewActions({
  setInfoPageOpen,
  setInfoPageTab,
  setLang,
  pushHeaderLang,
  setLangMenuOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  setUserCoords,
  setNearbyOnly,
  setGeoError,
  setSampleDateFrom,
  setSampleDateTo,
  setTheme,
  explainViolationFromMeasurements,
  historyMeasurements,
}: {
  setInfoPageOpen: (value: boolean) => void;
  setInfoPageTab: (value: "analytics" | "aboutModel" | "aboutService") => void;
  setLang: (value: DashboardLang) => void;
  pushHeaderLang: (value: DashboardLang) => void;
  setLangMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  setUserCoords: (value: { lat: number; lon: number } | null) => void;
  setNearbyOnly: (value: boolean) => void;
  setGeoError: (value: string | null) => void;
  setSampleDateFrom: (value: string) => void;
  setSampleDateTo: (value: string) => void;
  setTheme: (value: DashboardTheme) => void;
  explainViolationFromMeasurements: (domain: string, measurements: Record<string, number>) => string;
  historyMeasurements: (place: FrontendPlace, idx: number) => Record<string, number>;
}) {
  const infoPageActions = useDashboardInfoPageActions({
    setInfoPageOpen,
    setInfoPageTab,
  });
  const preferenceActions = useDashboardViewPreferenceActions({
    setLang,
    pushHeaderLang,
    setLangMenuOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
  });
  const filterActions = useDashboardViewFilterActions({
    setUserCoords,
    setNearbyOnly,
    setGeoError,
    setSampleDateFrom,
    setSampleDateTo,
    setTheme,
    explainViolationFromMeasurements,
    historyMeasurements,
  });

  return {
    ...infoPageActions,
    ...preferenceActions,
    ...filterActions,
  };
}
