"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import DashboardIcon, { type DashboardIconName } from "./DashboardIcon";
import DashboardMapFreshnessOverlay from "./DashboardMapFreshnessOverlay";
import DashboardMapPanel from "./DashboardMapPanel";
import type { DashboardLang } from "../lib/dashboard-types";
import type { FrontendPlace, FrontendSnapshot } from "../lib/types";
import { lruet } from "../lib/dashboard-utils";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#e8e0d8",
      }}
      aria-hidden="true"
    />
  ),
});

type Props = {
  mapPanelRef: ComponentProps<typeof DashboardMapPanel>["mapPanelRef"];
  chipBarRef: ComponentProps<typeof DashboardMapPanel>["chipBarRef"];
  lang: DashboardLang;
  title: string;
  filtersLabel: string;
  clearFiltersLabel: string;
  nearMeLabel: string;
  isMapFullscreen: boolean;
  isMobile: boolean;
  chipPos: ComponentProps<typeof DashboardMapPanel>["chipPos"];
  segment: string;
  alertsOnly: boolean;
  nearbyOnly: boolean;
  risk: string;
  userCoords: { lat: number; lon: number } | null;
  snapshotPlaces: FrontendSnapshot["places"];
  mapPlaces: FrontendPlace[];
  selectedPlace: FrontendPlace | null;
  selectedCounty: string | undefined;
  mobileBottomOverlayPx: number;
  countyGeoJson: ComponentProps<typeof MapClient>["countyGeoJson"];
  fitBoundsKey: string;
  fitBoundsPlaces: ComponentProps<typeof MapClient>["fitBoundsPlaces"];
  onSelectPoint: (id: string) => void;
  onSelectCluster: ComponentProps<typeof MapClient>["onSelectCluster"];
  onSelectCounty: (county: string) => void;
  onToggleFullscreen: (() => void) | undefined;
  onActivateNearMe: () => void;
  onSelectAllSegment: () => void;
  onToggleSegment: (kind: "swimming" | "pool_spa" | "drinking_water" | "drinking_source") => void;
  onToggleAlerts: () => void;
  onToggleNearMe: () => void;
  onClearRisk: () => void;
  onClearFilters: () => void;
  onChipPointerDown: React.PointerEventHandler<HTMLDivElement>;
  onChipPointerMove: React.PointerEventHandler<HTMLDivElement>;
  onChipPointerUp: React.PointerEventHandler<HTMLDivElement>;
  onChipClickCapture: React.MouseEventHandler<HTMLDivElement>;
};

export default function DashboardMapCanvas({
  mapPanelRef,
  chipBarRef,
  lang,
  title,
  filtersLabel,
  clearFiltersLabel,
  nearMeLabel,
  isMapFullscreen,
  isMobile,
  chipPos,
  segment,
  alertsOnly,
  nearbyOnly,
  risk,
  userCoords,
  snapshotPlaces,
  mapPlaces,
  selectedPlace,
  selectedCounty,
  mobileBottomOverlayPx,
  countyGeoJson,
  fitBoundsKey,
  fitBoundsPlaces,
  onSelectPoint,
  onSelectCluster,
  onSelectCounty,
  onToggleFullscreen,
  onActivateNearMe,
  onSelectAllSegment,
  onToggleSegment,
  onToggleAlerts,
  onToggleNearMe,
  onClearRisk,
  onClearFilters,
  onChipPointerDown,
  onChipPointerMove,
  onChipPointerUp,
  onChipClickCapture,
}: Props) {
  return (
    <DashboardMapPanel
      mapPanelRef={mapPanelRef}
      chipBarRef={chipBarRef}
      lang={lang}
      title={title}
      filtersLabel={filtersLabel}
      clearFiltersLabel={clearFiltersLabel}
      nearMeLabel={nearMeLabel}
      isMapFullscreen={isMapFullscreen}
      isMobile={isMobile}
      chipPos={chipPos}
      segment={segment}
      alertsOnly={alertsOnly}
      nearbyOnly={nearbyOnly}
      risk={risk}
      userCoords={userCoords}
      snapshotPlaces={snapshotPlaces}
      mapPlaces={mapPlaces}
      selectedPlace={selectedPlace}
      selectedCounty={selectedCounty}
      resetViewLabel={lruet(lang, "Сбросить вид", "Lähtesta vaade", "Reset view")}
      mobileBottomOverlayPx={mobileBottomOverlayPx}
      freshnessOverlay={<DashboardMapFreshnessOverlay lang={lang} />}
      onChipPointerDown={onChipPointerDown}
      onChipPointerMove={onChipPointerMove}
      onChipPointerUp={onChipPointerUp}
      onChipClickCapture={onChipClickCapture}
      onSelectAllSegment={onSelectAllSegment}
      onToggleSegment={onToggleSegment}
      onToggleAlerts={onToggleAlerts}
      onToggleNearMe={onToggleNearMe}
      onClearRisk={onClearRisk}
      onClearFilters={onClearFilters}
      onToggleFullscreen={onToggleFullscreen}
      renderMap={({ places, selectedPoint, selectedCounty: activeCounty, userLocation, isFullscreen, isMobile: mobileView, onToggleFullscreen: toggleFullscreen, disableHoverPopups, recenterLabel, resetViewLabel, showCountyOverlay, bottomOverlayPx, topOverlayPx, children }) => (
        <MapClient
          places={places}
          onSelectPoint={onSelectPoint}
          onSelectCluster={onSelectCluster}
          onSelectCounty={onSelectCounty}
          selectedCounty={activeCounty}
          locale={lang}
          selectedPoint={selectedPoint}
          userLocation={userLocation}
          isFullscreen={isFullscreen}
          isMobile={mobileView}
          onToggleFullscreen={toggleFullscreen}
          fullscreenLabel={mobileView ? "" : (isFullscreen ? lruet(lang, "Выйти из полноэкранного", "Välju täisekraanist", "Exit fullscreen") : lruet(lang, "Полный экран", "Täisekraan", "Fullscreen"))}
          disableHoverPopups={disableHoverPopups}
          onRecenterUser={onActivateNearMe}
          recenterLabel={recenterLabel}
          resetViewLabel={resetViewLabel}
          showCountyOverlay={showCountyOverlay}
          countyGeoJson={countyGeoJson}
          fitBoundsKey={fitBoundsKey}
          fitBoundsPlaces={fitBoundsPlaces}
          bottomOverlayPx={bottomOverlayPx}
          topOverlayPx={topOverlayPx}
        >
          {children}
        </MapClient>
      )}
      renderIcon={(name) => <DashboardIcon name={name as DashboardIconName} />}
    />
  );
}
