"use client";

import { useCallback } from "react";
import { track } from "./analytics";
import type { DashboardMobilePanelState, DashboardMobileSheetMode } from "./dashboard-types";
import type { FrontendPlace } from "./types";

export function useDashboardMapFilterActions({
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
}: {
  isMobile: boolean;
  nearbyOnly: boolean;
  userCoords: { lat: number; lon: number } | null;
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
}) {
  const clearFilters = useCallback(() => {
    setQuery("");
    setSegment("all");
    setRisk("all");
    setCounty("all");
    setOfficial("all");
    setAlertsOnly(false);
    setSampleDateFrom("");
    setSampleDateTo("");
    setMinProb(0);
    setMinProbInput(0);
    setNearbyOnly(false);
    setNearbyRadiusKm(10);
    setGeoError(null);
  }, [
    setAlertsOnly,
    setCounty,
    setGeoError,
    setMinProb,
    setMinProbInput,
    setNearbyOnly,
    setNearbyRadiusKm,
    setOfficial,
    setQuery,
    setRisk,
    setSampleDateFrom,
    setSampleDateTo,
    setSegment,
  ]);

  const selectPoint = useCallback((id: string) => {
    track("place_selected", { place_id: id, is_mobile: isMobile });
    setSelectedId(id);
    setClusterPlaceIds(null);
    if (isMobile) {
      setSheetMode("place");
      setMobilePanelState("half");
    }
  }, [isMobile, setClusterPlaceIds, setMobilePanelState, setSelectedId, setSheetMode]);

  const handleClusterSelect = useCallback((ids: string[]) => {
    setClusterPlaceIds(ids);
    setSelectedId(null);
    if (isMobile) {
      setSheetMode("place");
      setMobilePanelState("half");
    }
  }, [isMobile, setClusterPlaceIds, setMobilePanelState, setSelectedId, setSheetMode]);

  const openFilters = useCallback(() => {
    setSheetMode("filter");
    setMobilePanelState("full");
  }, [setMobilePanelState, setSheetMode]);

  const toggleNearbyOnly = useCallback(() => {
    if (nearbyOnly) {
      setNearbyOnly(false);
      return;
    }
    if (userCoords) setNearbyOnly(true);
  }, [nearbyOnly, setNearbyOnly, userCoords]);

  return {
    clearFilters,
    selectPoint,
    handleClusterSelect,
    openFilters,
    toggleNearbyOnly,
  };
}
