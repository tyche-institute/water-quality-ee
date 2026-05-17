"use client";

import { useMemo } from "react";
import type { FrontendPlace } from "./types";
import { usePlaceWithDetails } from "./use-place-details";

type Params = {
  places: FrontendPlace[];
  selectedId: string | null;
  clusterPlaceIds: string[] | null;
  watchlist: string[];
};

type Result = {
  selectedPlace: FrontendPlace | null;
  clusterPlaces: FrontendPlace[] | null;
  watchlistPlaces: FrontendPlace[];
};

export function usePlaceCollections({
  places,
  selectedId,
  clusterPlaceIds,
  watchlist,
}: Params): Result {
  const selectedPlaceBase = useMemo(() => {
    if (!selectedId) return null;
    return places.find((p) => p.id === selectedId) || null;
  }, [selectedId, places]);

  const selectedPlace = usePlaceWithDetails(selectedPlaceBase);

  const clusterPlaces = useMemo(() => {
    if (!clusterPlaceIds || clusterPlaceIds.length === 0) return null;
    const idSet = new Set(clusterPlaceIds);
    return places.filter((p) => idSet.has(p.id));
  }, [clusterPlaceIds, places]);

  const watchlistPlaces = useMemo(() => {
    const byId = new Set(watchlist);
    const list = places.filter((p) => byId.has(p.id));
    return [...list].sort((a, b) => {
      const pa = a.model_violation_prob;
      const pb = b.model_violation_prob;
      if (pa !== null && pb !== null && pa !== pb) return pb - pa;
      if (pa !== null && pb === null) return -1;
      if (pa === null && pb !== null) return 1;
      return a.location.localeCompare(b.location, undefined, { sensitivity: "base" });
    });
  }, [watchlist, places]);

  return { selectedPlace, clusterPlaces, watchlistPlaces };
}
