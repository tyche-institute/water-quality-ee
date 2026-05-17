"use client";

import { useCallback } from "react";
import { track } from "./analytics";
import type { DashboardLang } from "./dashboard-types";
import { lruet } from "./dashboard-utils";
import type { FrontendPlace } from "./types";

export function useDashboardPanelActions({
  lang,
  segment,
  filteredCount,
  snapshotPlaces,
  mapAlertsCount,
  mapNearMeCount,
  nearbyOnly,
  userCoords,
  selectedPlaceId,
  measurementsOpen,
  historyOpen,
  setSegment,
  setAlertsOnly,
  setNearbyOnly,
  setGeoError,
  setMeasurementsOpen,
  setHistoryOpen,
  setSheetMode,
  setMobilePanelState,
  setClusterPlaceIds,
  activateNearMe,
  showCountBubble,
}: {
  lang: DashboardLang;
  segment: FrontendPlace["place_kind"] | "all";
  filteredCount: number;
  snapshotPlaces: FrontendPlace[];
  mapAlertsCount: number;
  mapNearMeCount: number | null;
  nearbyOnly: boolean;
  userCoords: { lat: number; lon: number } | null;
  selectedPlaceId: string | null;
  measurementsOpen: boolean;
  historyOpen: boolean;
  setSegment: (value: FrontendPlace["place_kind"] | "all") => void;
  setAlertsOnly: (value: boolean | ((prev: boolean) => boolean)) => void;
  setNearbyOnly: (value: boolean) => void;
  setGeoError: (value: string | null) => void;
  setMeasurementsOpen: (value: boolean) => void;
  setHistoryOpen: (value: boolean) => void;
  setSheetMode: (value: "place" | "filter") => void;
  setMobilePanelState: (value: "collapsed" | "half" | "full") => void;
  setClusterPlaceIds: (value: string[] | null) => void;
  activateNearMe: () => void;
  showCountBubble: (text: string) => void;
}) {
  const selectAllSegment = useCallback(() => {
    setSegment("all");
    showCountBubble(lruet(lang, `Все точки: ${filteredCount}`, `Kõik punktid: ${filteredCount}`, `All points: ${filteredCount}`));
  }, [filteredCount, lang, setSegment, showCountBubble]);

  const toggleSegment = useCallback((kind: FrontendPlace["place_kind"]) => {
    const next = segment === kind ? "all" : kind;
    setSegment(next);
    const label =
      kind === "swimming"
        ? lruet(lang, "Купальные", "Suplusvesi", "Swimming")
        : kind === "pool_spa"
          ? lruet(lang, "Бассейны", "Basseinid", "Pools")
          : kind === "drinking_water"
            ? lruet(lang, "Питьевая", "Joogivesi", "Drinking")
            : lruet(lang, "Источники", "Allikad", "Sources");
    const count = snapshotPlaces.filter((place) => place.place_kind === kind).length;
    showCountBubble(`${label}: ${count}`);
  }, [lang, segment, setSegment, showCountBubble, snapshotPlaces]);

  const toggleAlerts = useCallback(() => {
    setAlertsOnly((value) => !value);
    showCountBubble(lruet(lang, `Тревог на карте: ${mapAlertsCount}`, `Häireid kaardil: ${mapAlertsCount}`, `Alerts on map: ${mapAlertsCount}`));
  }, [lang, mapAlertsCount, setAlertsOnly, showCountBubble]);

  const toggleNearMe = useCallback(() => {
    if (nearbyOnly) {
      setNearbyOnly(false);
      setGeoError(null);
    } else if (userCoords) {
      setNearbyOnly(true);
      setGeoError(null);
    } else {
      activateNearMe();
    }
    const count = mapNearMeCount ?? 0;
    showCountBubble(lruet(lang, `Рядом на карте: ${count}`, `Läheduses kaardil: ${count}`, `Near me on map: ${count}`));
  }, [activateNearMe, lang, mapNearMeCount, nearbyOnly, setGeoError, setNearbyOnly, showCountBubble, userCoords]);

  const toggleMeasurements = useCallback(() => {
    if (!selectedPlaceId) return;
    const next = !measurementsOpen;
    track("measurements_toggled", { open: next, place_id: selectedPlaceId });
    setMeasurementsOpen(next);
    if (typeof window !== "undefined") window.localStorage.setItem("water.ui.measurements-open.v1", String(next));
  }, [measurementsOpen, selectedPlaceId, setMeasurementsOpen]);

  const toggleHistory = useCallback(() => {
    if (!selectedPlaceId) return;
    const next = !historyOpen;
    track("history_toggled", { open: next, place_id: selectedPlaceId });
    setHistoryOpen(next);
    if (typeof window !== "undefined") window.localStorage.setItem("water.ui.history-open.v1", String(next));
  }, [historyOpen, selectedPlaceId, setHistoryOpen]);

  const closeFilterMode = useCallback(() => {
    setSheetMode("place");
    setMobilePanelState("collapsed");
  }, [setMobilePanelState, setSheetMode]);

  const closePlaceMode = useCallback(() => {
    setMobilePanelState("collapsed");
    setClusterPlaceIds(null);
  }, [setClusterPlaceIds, setMobilePanelState]);

  return {
    selectAllSegment,
    toggleSegment,
    toggleAlerts,
    toggleNearMe,
    toggleMeasurements,
    toggleHistory,
    closeFilterMode,
    closePlaceMode,
  };
}
