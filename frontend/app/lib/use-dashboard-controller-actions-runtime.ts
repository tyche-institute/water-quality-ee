"use client";

import { useDashboardActions } from "./use-dashboard-actions";
import { useDashboardViewActions } from "./use-dashboard-view-actions";
import type { useDashboardControllerBootstrap } from "./use-dashboard-controller-bootstrap";
import type { useDashboardControllerSceneState } from "./use-dashboard-controller-scene-state";
import type { FrontendPlace, FrontendSnapshot } from "./types";

type BootstrapState = ReturnType<typeof useDashboardControllerBootstrap>;
type SceneState = ReturnType<typeof useDashboardControllerSceneState>;

export function useDashboardControllerActionsRuntime(
  snapshot: FrontendSnapshot,
  state: BootstrapState,
  scene: Pick<SceneState, "isMobile" | "setSheetMode" | "setMobilePanelState">,
  helpers: {
    pushHeaderLang: (lang: "ru" | "et" | "en") => void;
    explainViolationFromMeasurements: (domain: string, measurements: Record<string, number>) => string;
    historyMeasurements: (place: FrontendPlace, idx: number) => Record<string, number>;
  },
) {
  const actions = useDashboardActions({
    isMobile: scene.isMobile,
    nearbyOnly: state.nearbyOnly,
    userCoords: state.userCoords,
    watchlist: state.watchlist,
    setLang: state.setLang,
    setShowLangDialog: state.setShowLangDialog,
    setSheetMode: scene.setSheetMode,
    setMobilePanelState: scene.setMobilePanelState,
    setSelectedId: state.setSelectedId,
    setClusterPlaceIds: state.setClusterPlaceIds,
    setQuery: state.setQuery,
    setSegment: state.setSegment,
    setRisk: state.setRisk,
    setCounty: state.setCounty,
    setOfficial: state.setOfficial,
    setAlertsOnly: state.setAlertsOnly,
    setSampleDateFrom: state.setSampleDateFrom,
    setSampleDateTo: state.setSampleDateTo,
    setMinProb: state.setMinProb,
    setMinProbInput: state.setMinProbInput,
    setNearbyOnly: state.setNearbyOnly,
    setNearbyRadiusKm: state.setNearbyRadiusKm,
    setGeoError: state.setGeoError,
    toggleWatchState: state.toggleWatchState,
  });
  const viewActions = useDashboardViewActions({
    setInfoPageOpen: state.setInfoPageOpen,
    setInfoPageTab: state.setInfoPageTab,
    setLang: state.setLang,
    pushHeaderLang: helpers.pushHeaderLang,
    setLangMenuOpen: state.setLangMenuOpen,
    sidebarCollapsed: state.sidebarCollapsed,
    setSidebarCollapsed: state.setSidebarCollapsed,
    setUserCoords: state.setUserCoords,
    setNearbyOnly: state.setNearbyOnly,
    setGeoError: state.setGeoError,
    setSampleDateFrom: state.setSampleDateFrom,
    setSampleDateTo: state.setSampleDateTo,
    setTheme: state.setTheme,
    explainViolationFromMeasurements: helpers.explainViolationFromMeasurements,
    historyMeasurements: helpers.historyMeasurements,
  });

  return {
    ...actions,
    ...viewActions,
  };
}
