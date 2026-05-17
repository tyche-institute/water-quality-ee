"use client";

import type { DashboardLang, DashboardMobilePanelState, DashboardMobileSheetMode } from "./dashboard-types";
import type { FrontendPlace } from "./types";
import { useDashboardMapFilterActions } from "./use-dashboard-map-filter-actions";
import { useDashboardPreferenceActions } from "./use-dashboard-preference-actions";

export function useDashboardActions({
  isMobile,
  nearbyOnly,
  userCoords,
  watchlist,
  setLang,
  setShowLangDialog,
  setSheetMode,
  setMobilePanelState,
  setSelectedId,
  setClusterPlaceIds,
  setQuery,
  setSegment,
  setRisk,
  setCounty,
  setOfficial,
  setAlertsOnly,
  setSampleDateFrom,
  setSampleDateTo,
  setMinProb,
  setMinProbInput,
  setNearbyOnly,
  setNearbyRadiusKm,
  setGeoError,
  toggleWatchState,
}: {
  isMobile: boolean;
  nearbyOnly: boolean;
  userCoords: { lat: number; lon: number } | null;
  watchlist: string[];
  setLang: (value: DashboardLang) => void;
  setShowLangDialog: (value: boolean) => void;
  setSheetMode: (value: DashboardMobileSheetMode) => void;
  setMobilePanelState: (value: DashboardMobilePanelState | ((prev: DashboardMobilePanelState) => DashboardMobilePanelState)) => void;
  setSelectedId: (value: string | null) => void;
  setClusterPlaceIds: (value: string[] | null) => void;
  setQuery: (value: string) => void;
  setSegment: (value: FrontendPlace["place_kind"] | "all") => void;
  setRisk: (value: string) => void;
  setCounty: (value: string | ((prev: string) => string)) => void;
  setOfficial: (value: "all" | "compliant" | "violation" | "unknown") => void;
  setAlertsOnly: (value: boolean | ((prev: boolean) => boolean)) => void;
  setSampleDateFrom: (value: string) => void;
  setSampleDateTo: (value: string) => void;
  setMinProb: (value: number) => void;
  setMinProbInput: (value: number) => void;
  setNearbyOnly: (value: boolean) => void;
  setNearbyRadiusKm: (value: number) => void;
  setGeoError: (value: string | null) => void;
  toggleWatchState: (id: string) => void;
}) {
  const preferenceActions = useDashboardPreferenceActions({
    watchlist,
    setLang,
    setShowLangDialog,
    toggleWatchState,
  });
  const mapFilterActions = useDashboardMapFilterActions({
    isMobile,
    nearbyOnly,
    userCoords,
    setSheetMode,
    setMobilePanelState,
    setSelectedId,
    setClusterPlaceIds,
    setQuery,
    setSegment,
    setRisk,
    setCounty,
    setOfficial,
    setAlertsOnly,
    setSampleDateFrom,
    setSampleDateTo,
    setMinProb,
    setMinProbInput,
    setNearbyOnly,
    setNearbyRadiusKm,
    setGeoError,
  });

  return {
    ...preferenceActions,
    ...mapFilterActions,
  };
}
