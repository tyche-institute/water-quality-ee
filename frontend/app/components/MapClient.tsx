"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { memo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import L from "leaflet";
import MapCountyLegend from "./MapCountyLegend";
import MapCountyOverlay from "./MapCountyOverlay";
import MapFloatingControls from "./MapFloatingControls";
import MapMarkerClusterLayer from "./MapMarkerClusterLayer";
import { FitBoundsOnVersion, FocusOnSelectedPoint, FocusOnUserLocation } from "./MapViewportEffects";
import { useMapCountyData } from "./use-map-county-data";
import type { FrontendPlace } from "../lib/types";

// Module-level constant so it's stable across renders
const ESTONIA_BOUNDS: [[number, number], [number, number]] = [
  [57.1, 20.7],
  [60.15, 29.4]
];

type Props = {
  places: FrontendPlace[];
  onSelectPoint?: (id: string) => void;
  onSelectCluster?: (ids: string[]) => void;
  locale?: "ru" | "et" | "en";
  onSelectCounty?: (county: string) => void;
  selectedCounty?: string;
  selectedPoint?: FrontendPlace | null;
  userLocation?: { lat: number; lon: number } | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  fullscreenLabel?: string;
  disableHoverPopups?: boolean;
  onResetView?: () => void;
  onRecenterUser?: () => void;
  resetViewLabel?: string;
  recenterLabel?: string;
  canRecenter?: boolean;
  isMobile?: boolean;
  showCountyOverlay?: boolean;
  /** Pre-loaded county GeoJSON from Dashboard. When provided, MapClient
   *  skips its own fetch and uses this for the overlay + polygon filter. */
  countyGeoJson?: GeoJSON.GeoJsonObject | null;
  fitBoundsKey?: string;
  fitBoundsPlaces?: [number, number][];
  /** Pixels obscured by the bottom sheet (peek/half) + on-screen keyboard. */
  bottomOverlayPx?: number;
  /** Pixels obscured by the top search bar + chip bar. */
  topOverlayPx?: number;
  /** Optional content rendered inside the map shell (e.g. freshness overlay). */
  children?: React.ReactNode;
};

function MapClient({
  places,
  onSelectPoint,
  onSelectCluster,
  locale = "ru",
  onSelectCounty,
  selectedCounty,
  selectedPoint,
  userLocation,
  isFullscreen = false,
  onToggleFullscreen,
  fullscreenLabel = "Fullscreen",
  disableHoverPopups = false,
  onResetView,
  onRecenterUser,
  resetViewLabel = "Reset view",
  recenterLabel = "Near me",
  canRecenter = true,
  isMobile = false,
  showCountyOverlay = true,
  countyGeoJson: countyGeoJsonProp,
  fitBoundsKey,
  fitBoundsPlaces,
  bottomOverlayPx = 0,
  topOverlayPx = 95,
  children
}: Props) {
  const center: [number, number] = [58.75, 25.0];
  const mapRef = useRef<L.Map | null>(null);
  const mapShellRef = useRef<HTMLDivElement | null>(null);
  const { selectedCountyNorm, countyRisk, countySampleCount, countyGeoJson } = useMapCountyData({
    places,
    selectedCounty,
    showCountyOverlay,
    countyGeoJsonProp,
  });

  // Dashboard already filters places by county (pre-computed polygon
  // mapping or string fallback). No need for a second polygon filter
  // here — it was causing a ~1s UI freeze on every county click.
  const visiblePlaces = places;


  useEffect(() => {
    return () => {
      // В dev (Fast Refresh) Leaflet иногда оставляет map instance на контейнере.
      // Явно удаляем карту, чтобы избежать "Map container is already initialized".
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Desktop: collapsing/expanding the filter sidebar changes the map column width.
  // Leaflet must be told or tiles stay laid out for the old box — the view "shifts".
  useEffect(() => {
    const shell = mapShellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        mapRef.current?.invalidateSize({ animate: false });
      });
    });
    ro.observe(shell);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const labels = [
      { name: "Lahemaa", lat: 59.58, lon: 25.9 },
      { name: "Soomaa", lat: 58.44, lon: 25.11 },
      { name: "Saaremaa", lat: 58.42, lon: 22.55 },
      { name: "Peipsi", lat: 58.6, lon: 27.3 }
    ];
    const g = L.layerGroup();
    labels.forEach((z) => {
      L.marker([z.lat, z.lon], {
        interactive: false,
        icon: L.divIcon({
          className: "",
          html: `<div class="zoneTag">${z.name}</div>`
        })
      }).addTo(g);
    });
    g.addTo(map);
    return () => {
      g.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const t = window.setTimeout(() => {
      mapRef.current?.invalidateSize();
      // After entering fullscreen, re-fit Estonia keeping it clear of
      // the search+chips overlay (≈95px top) and sheet peek (≈62px bottom).
      if (isFullscreen) {
        mapRef.current?.fitBounds(ESTONIA_BOUNDS, {
          animate: false,
          paddingTopLeft: [10, 95],
          paddingBottomRight: [10, 62]
        });
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [isFullscreen]);

  const resetView = () => {
    if (onResetView) {
      onResetView();
      return;
    }
    mapRef.current?.flyTo(center, 7, { duration: 0.6 });
  };

  const recenter = () => {
    onRecenterUser?.();
  };

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  return (
    <div ref={mapShellRef} className={`mapShell ${isFullscreen ? "isFullscreen" : ""}`}>
      <MapFloatingControls
        isMobile={isMobile}
        isFullscreen={isFullscreen}
        canRecenter={canRecenter}
        fullscreenLabel={fullscreenLabel}
        resetViewLabel={resetViewLabel}
        recenterLabel={recenterLabel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onRecenter={recenter}
        onToggleFullscreen={onToggleFullscreen}
      />
      <MapContainer
        ref={(instance) => {
          mapRef.current = instance;
        }}
        center={center}
        zoom={7}
        minZoom={6}
        maxZoom={15}
        maxBounds={ESTONIA_BOUNDS}
        maxBoundsViscosity={0.35}
        zoomAnimation={!isMobile}
        fadeAnimation={!isMobile}
        markerZoomAnimation={!isMobile}
        zoomControl={false}
        style={{ height: "100%", width: "100%", borderRadius: "0" }}
        scrollWheelZoom
        preferCanvas
      >
        {!isMobile && <ZoomControl position="topleft" />}
        <TileLayer
          attribution='Tiles &copy; Esri, OpenStreetMap contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          keepBuffer={isMobile ? 2 : 5}
        />
        <FocusOnUserLocation userLocation={userLocation} />
        <FocusOnSelectedPoint
          selectedPoint={selectedPoint}
          bottomOverlayPx={bottomOverlayPx}
          topOverlayPx={topOverlayPx}
        />
        <FitBoundsOnVersion
          fitBoundsKey={fitBoundsKey}
          places={fitBoundsPlaces}
          topOverlayPx={topOverlayPx}
          bottomOverlayPx={bottomOverlayPx}
        />
        {showCountyOverlay ? (
          <MapCountyOverlay
            countyGeoJson={countyGeoJson}
            selectedCounty={selectedCountyNorm}
            countyRisk={countyRisk}
            countySampleCount={countySampleCount}
            locale={locale}
            onSelectCounty={onSelectCounty}
          />
        ) : null}
        <MapMarkerClusterLayer
          places={visiblePlaces}
          locale={locale}
          onSelectPoint={onSelectPoint}
          onSelectCluster={onSelectCluster}
          disableHoverPopups={disableHoverPopups}
          isFullscreen={isFullscreen}
          isMobile={isMobile}
        />
      </MapContainer>
      {showCountyOverlay ? <MapCountyLegend locale={locale} /> : null}
      {children}
    </div>
  );
}

export default memo(MapClient);
