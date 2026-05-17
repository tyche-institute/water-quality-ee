"use client";

import type { CSSProperties, PointerEventHandler, ReactNode, RefObject } from "react";
import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";

type PlaceKindSegment = "all" | "swimming" | "pool_spa" | "drinking_water" | "drinking_source";

type Props = {
  mapPanelRef: RefObject<HTMLElement | null>;
  chipBarRef: RefObject<HTMLDivElement | null>;
  lang: DashboardLang;
  title: string;
  filtersLabel: string;
  clearFiltersLabel: string;
  nearMeLabel: string;
  isMapFullscreen: boolean;
  isMobile: boolean;
  chipPos: { left: number; top: number } | null;
  segment: string;
  alertsOnly: boolean;
  nearbyOnly: boolean;
  risk: string;
  userCoords: { lat: number; lon: number } | null;
  snapshotPlaces: FrontendPlace[];
  mapPlaces: FrontendPlace[];
  selectedPlace: FrontendPlace | null;
  selectedCounty: string | undefined;
  resetViewLabel: string;
  mobileBottomOverlayPx: number;
  freshnessOverlay: ReactNode;
  onChipPointerDown: PointerEventHandler<HTMLDivElement>;
  onChipPointerMove: PointerEventHandler<HTMLDivElement>;
  onChipPointerUp: PointerEventHandler<HTMLDivElement>;
  onChipClickCapture: React.MouseEventHandler<HTMLDivElement>;
  onSelectAllSegment: () => void;
  onToggleSegment: (kind: Exclude<PlaceKindSegment, "all">) => void;
  onToggleAlerts: () => void;
  onToggleNearMe: () => void;
  onClearRisk: () => void;
  onClearFilters: () => void;
  onToggleFullscreen: (() => void) | undefined;
  renderMap: (props: {
    places: FrontendPlace[];
    selectedPoint: FrontendPlace | null;
    selectedCounty: string | undefined;
    userLocation: { lat: number; lon: number } | null;
    isFullscreen: boolean;
    isMobile: boolean;
    onToggleFullscreen: (() => void) | undefined;
    disableHoverPopups: boolean;
    recenterLabel: string;
    resetViewLabel: string;
    showCountyOverlay: boolean;
    bottomOverlayPx: number;
    topOverlayPx: number;
    children: ReactNode;
  }) => ReactNode;
  renderIcon: (name: string) => ReactNode;
};

export default function DashboardMapPanel({
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
  resetViewLabel,
  mobileBottomOverlayPx,
  freshnessOverlay,
  onChipPointerDown,
  onChipPointerMove,
  onChipPointerUp,
  onChipClickCapture,
  onSelectAllSegment,
  onToggleSegment,
  onToggleAlerts,
  onToggleNearMe,
  onClearRisk,
  onClearFilters,
  onToggleFullscreen,
  renderMap,
  renderIcon,
}: Props) {
  const domainCount = (kind: Exclude<PlaceKindSegment, "all">) => snapshotPlaces.filter((place) => place.place_kind === kind).length;

  return (
    <section
      ref={mapPanelRef}
      className={`panel mapTopPanel ${isMapFullscreen ? "mapPanelFullscreen" : ""} ${isMobile ? "mobileMapPanel" : ""}`}
    >
      <div className="mapHeaderRow">
        <h3 className="sectionTitle">{title}</h3>
      </div>
      {!isMobile ? (
        <div
          ref={chipBarRef}
          className="mapChipBar desktopOnly"
          role="toolbar"
          aria-label={filtersLabel}
          style={chipPos ? ({ left: chipPos.left, top: chipPos.top, bottom: "auto", transform: "none" } as CSSProperties) : undefined}
          onPointerDown={onChipPointerDown}
          onPointerMove={onChipPointerMove}
          onPointerUp={onChipPointerUp}
          onClickCapture={onChipClickCapture}
        >
          <button
            type="button"
            className={`mapChip ${segment === "all" ? "mapChipActive" : ""}`}
            onClick={onSelectAllSegment}
            aria-label={lruet(lang, "Все", "Kõik", "All")}
            data-tooltip={lruet(lang, "Все", "Kõik", "All")}
          >
            {renderIcon("grid")}
          </button>
          {(["swimming", "pool_spa", "drinking_water", "drinking_source"] as const).map((kind) => {
            const iconName = kind === "swimming" ? "swim" : kind === "pool_spa" ? "pool" : kind === "drinking_water" ? "tap" : "drop";
            const label =
              kind === "swimming"
                ? lruet(lang, "Купальные", "Suplusvesi", "Swimming")
                : kind === "pool_spa"
                  ? lruet(lang, "Бассейны", "Basseinid", "Pools")
                  : kind === "drinking_water"
                    ? lruet(lang, "Питьевая", "Joogivesi", "Drinking")
                    : lruet(lang, "Источники", "Allikad", "Sources");
            return (
              <button
                key={`mapchip-${kind}`}
                type="button"
                className={`mapChip ${segment === kind ? "mapChipActive" : ""}`}
                onClick={() => onToggleSegment(kind)}
                aria-label={`${label}: ${domainCount(kind)}`}
                data-tooltip={label}
              >
                {renderIcon(iconName)}
              </button>
            );
          })}
          <div className="mapChipDivider" aria-hidden="true" />
          <button
            type="button"
            className={`mapChip mapChipAlert ${alertsOnly ? "mapChipActive" : ""}`}
            onClick={onToggleAlerts}
            aria-label={alertsOnly ? lruet(lang, "Снять фильтр тревог", "Eemalda häirete filter", "Clear alerts filter") : lruet(lang, "Только тревоги", "Ainult häired", "Alerts only")}
            aria-pressed={alertsOnly}
            data-tooltip={alertsOnly ? lruet(lang, "Снять фильтр тревог", "Eemalda häirete filter", "Clear alerts filter") : lruet(lang, "Только тревоги", "Ainult häired", "Alerts only")}
          >
            {renderIcon("alert")}
          </button>
          <button
            type="button"
            className={`mapChip ${nearbyOnly ? "mapChipActive" : ""}`}
            onClick={onToggleNearMe}
            aria-label={nearbyOnly ? lruet(lang, "Снять фильтр «рядом»", "Eemalda läheduse filter", "Clear near-me filter") : lruet(lang, "Рядом со мной", "Minu lähedal", "Near me")}
            aria-pressed={nearbyOnly}
            data-tooltip={nearbyOnly ? lruet(lang, "Снять фильтр «рядом»", "Eemalda läheduse filter", "Clear near-me filter") : lruet(lang, "Рядом со мной", "Minu lähedal", "Near me")}
          >
            {renderIcon("locate")}
          </button>
          {risk !== "all" ? (
            <button
              type="button"
              className="mapChip mapChipActive"
              onClick={onClearRisk}
              aria-label={lruet(lang, "Сбросить риск", "Lähtesta risk", "Clear risk filter")}
              data-tooltip={lruet(lang, "Сбросить риск", "Lähtesta risk", "Clear risk filter")}
            >
              {renderIcon("signal")}
            </button>
          ) : null}
          <button type="button" className="mapChip mapChipClear" onClick={onClearFilters} aria-label={clearFiltersLabel} data-tooltip={clearFiltersLabel}>
            {renderIcon("filter-x")}
          </button>
        </div>
      ) : null}
      {renderMap({
        places: mapPlaces,
        selectedPoint: selectedPlace,
        selectedCounty,
        userLocation: nearbyOnly ? userCoords : null,
        isFullscreen: isMapFullscreen,
        isMobile,
        onToggleFullscreen,
        disableHoverPopups: isMobile || !isMapFullscreen,
        recenterLabel: nearMeLabel,
        resetViewLabel,
        showCountyOverlay: !isMobile,
        bottomOverlayPx: isMobile ? mobileBottomOverlayPx : 0,
        topOverlayPx: isMobile ? 105 : 88,
        children: freshnessOverlay,
      })}
    </section>
  );
}
