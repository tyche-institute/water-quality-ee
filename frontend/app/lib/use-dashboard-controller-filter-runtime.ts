"use client";

import { comparePlacesTableBase, distanceKm, fmtDate } from "./dashboard-utils";
import { countyKey, countyPretty } from "./dashboard-controller-utils";
import { useDashboardFiltering } from "./use-dashboard-filtering";
import { useDashboardMapUi } from "./use-dashboard-map-ui";
import { useDashboardPanelActions } from "./use-dashboard-panel-actions";
import type { useDashboardControllerBootstrap } from "./use-dashboard-controller-bootstrap";
import type { useDashboardControllerSceneState } from "./use-dashboard-controller-scene-state";
import type { FrontendSnapshot } from "./types";

type BootstrapState = ReturnType<typeof useDashboardControllerBootstrap>;
type SceneState = ReturnType<typeof useDashboardControllerSceneState>;

export function useDashboardControllerFilterRuntime(
  snapshot: FrontendSnapshot,
  state: BootstrapState,
  scene: SceneState,
) {
  const filtering = useDashboardFiltering({
    places: snapshot.places,
    query: state.query,
    segment: state.segment,
    risk: state.risk,
    county: state.county,
    official: state.official,
    alertsOnly: state.alertsOnly,
    nearbyOnly: state.nearbyOnly,
    userCoords: state.userCoords,
    nearbyRadiusKm: state.nearbyRadiusKm,
    minProb: state.minProb,
    sampleDateFrom: state.sampleDateFrom,
    sampleDateTo: state.sampleDateTo,
    placeCountyGeo: scene.placeCountyGeo,
    isMobile: scene.isMobile,
    placesTableSort: state.placesTableSort,
    countyKey,
    countyPretty,
    fmtDate,
    distanceKm,
    comparePlacesTableBase,
  });
  const mapUi = useDashboardMapUi({
    mapPanelRef: state.mapPanelRef,
    isMapFullscreen: state.isMapFullscreen,
    setIsMapFullscreen: state.setIsMapFullscreen,
    setGeoError: state.setGeoError,
    setUserCoords: state.setUserCoords,
    setNearbyOnly: state.setNearbyOnly,
    geoUnsupportedLabel: state.t.geoUnsupported,
    geoDeniedLabel: state.t.geoDenied,
  });
  const panelActions = useDashboardPanelActions({
    lang: state.lang,
    segment: state.segment,
    filteredCount: filtering.filtered.length,
    snapshotPlaces: snapshot.places,
    mapAlertsCount: filtering.mapAlertsCount,
    mapNearMeCount: filtering.mapNearMeCount,
    nearbyOnly: state.nearbyOnly,
    userCoords: state.userCoords,
    selectedPlaceId: scene.selectedPlace?.id ?? null,
    measurementsOpen: state.measurementsOpen,
    historyOpen: state.historyOpen,
    setSegment: state.setSegment,
    setAlertsOnly: state.setAlertsOnly,
    setNearbyOnly: state.setNearbyOnly,
    setGeoError: state.setGeoError,
    setMeasurementsOpen: state.setMeasurementsOpen,
    setHistoryOpen: state.setHistoryOpen,
    setSheetMode: scene.setSheetMode,
    setMobilePanelState: scene.setMobilePanelState,
    setClusterPlaceIds: state.setClusterPlaceIds,
    activateNearMe: mapUi.activateNearMe,
    showCountBubble: mapUi.showCountBubble,
  });

  return {
    ...filtering,
    ...mapUi,
    ...panelActions,
  };
}
