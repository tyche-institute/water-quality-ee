"use client";

import { useDashboardCountyGeo } from "./use-dashboard-county-geo";
import { useDashboardHeaderCompactEffect } from "./use-dashboard-header-compact-effect";
import { useDashboardMapMobileEnvironment } from "./use-dashboard-map-mobile-environment";
import type { FrontendPlace } from "./types";

export function useDashboardMapEnvironment({
  snapshotPlaces,
  setHeaderCompact,
  setIsMapFullscreen,
  setMobilePanelState,
  mobilePanelState,
  countyKey,
}: {
  snapshotPlaces: FrontendPlace[];
  setHeaderCompact: (value: boolean) => void;
  setIsMapFullscreen: (value: boolean) => void;
  setMobilePanelState: (value: "collapsed" | "half" | "full") => void;
  mobilePanelState: "collapsed" | "half" | "full";
  countyKey: (value: string | null | undefined) => string;
}) {
  const { isMobile, mobileBottomOverlayPx } = useDashboardMapMobileEnvironment({
    setIsMapFullscreen,
    setMobilePanelState,
    mobilePanelState,
  });
  const { countyGeoJson, placeCountyGeo } = useDashboardCountyGeo({
    isMobile,
    snapshotPlaces,
    countyKey,
  });
  useDashboardHeaderCompactEffect(setHeaderCompact);

  return {
    isMobile,
    countyGeoJson,
    placeCountyGeo,
    mobileBottomOverlayPx,
  };
}
