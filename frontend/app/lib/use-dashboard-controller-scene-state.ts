"use client";

import { useDashboardChipBar } from "./use-dashboard-chip-bar";
import { useDashboardMapEnvironment } from "./use-dashboard-map-environment";
import { useDashboardMobileSheet } from "./use-dashboard-mobile-sheet";
import { usePlaceCollections } from "./use-place-collections";
import { countyKey } from "./dashboard-controller-utils";
import type { useDashboardControllerBootstrap } from "./use-dashboard-controller-bootstrap";
import type { FrontendSnapshot } from "./types";

type BootstrapState = ReturnType<typeof useDashboardControllerBootstrap>;

export function useDashboardControllerSceneState(snapshot: FrontendSnapshot, state: BootstrapState) {
  const { selectedPlace, clusterPlaces, watchlistPlaces } = usePlaceCollections({
    places: snapshot.places,
    selectedId: state.selectedId,
    clusterPlaceIds: state.clusterPlaceIds,
    watchlist: state.watchlist,
  });
  const {
    mobilePanelState,
    setMobilePanelState,
    sheetMode,
    setSheetMode,
    sheetDragging,
    sheetDragOffset,
    cycleMobilePanelState,
    onSheetPointerDown,
    onSheetPointerMove,
    onSheetPointerUp,
    resetSheetDrag,
  } = useDashboardMobileSheet({
    selectedPlaceId: selectedPlace?.id ?? null,
    clusterPlacesCount: clusterPlaces?.length ?? 0,
  });
  const { chipPos, onChipPointerDown, onChipPointerMove, onChipPointerUp, onChipClick } = useDashboardChipBar({
    chipBarRef: state.chipBarRef,
  });
  const {
    isMobile,
    countyGeoJson,
    placeCountyGeo,
    mobileBottomOverlayPx,
  } = useDashboardMapEnvironment({
    snapshotPlaces: snapshot.places,
    setHeaderCompact: state.setHeaderCompact,
    setIsMapFullscreen: state.setIsMapFullscreen,
    setMobilePanelState,
    mobilePanelState,
    countyKey,
  });

  return {
    selectedPlace,
    clusterPlaces,
    watchlistPlaces,
    mobilePanelState,
    setMobilePanelState,
    sheetMode,
    setSheetMode,
    sheetDragging,
    sheetDragOffset,
    cycleMobilePanelState,
    onSheetPointerDown,
    onSheetPointerMove,
    onSheetPointerUp,
    resetSheetDrag,
    chipPos,
    onChipPointerDown,
    onChipPointerMove,
    onChipPointerUp,
    onChipClick,
    isMobile,
    countyGeoJson,
    placeCountyGeo,
    mobileBottomOverlayPx,
  };
}
