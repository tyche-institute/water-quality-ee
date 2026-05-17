"use client";

import { useState } from "react";
import { useSelectedPlaceUrl } from "./url-state";
import { useDashboardPlacesTableSort, useDashboardWatchlist } from "./use-dashboard-watchlist";

export function useDashboardControllerSelectionState() {
  const [selectedId, setSelectedId] = useSelectedPlaceUrl();
  const [clusterPlaceIds, setClusterPlaceIds] = useState<string[] | null>(null);
  const { watchlist, toggleWatch: toggleWatchState } = useDashboardWatchlist();
  const { placesTableSort, cyclePlacesTableSort } = useDashboardPlacesTableSort();

  return {
    selectedId,
    setSelectedId,
    clusterPlaceIds,
    setClusterPlaceIds,
    watchlist,
    toggleWatchState,
    placesTableSort,
    cyclePlacesTableSort,
  };
}
