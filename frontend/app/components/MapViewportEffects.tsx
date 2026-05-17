"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { FrontendPlace } from "../lib/types";

/**
 * Compute the map-container y coordinate where the selected marker should
 * appear: the centre of the visible strip between the top chrome and the
 * bottom sheet, clamped with a ~72px margin on each side so the pin never
 * hugs either edge.
 */
function computeVisibleTargetY(
  mapHeight: number,
  viewportHeight: number,
  topOverlayPx: number,
  bottomOverlayPx: number,
): number {
  const sheetTopY = Math.max(0, viewportHeight - bottomOverlayPx);
  const chromeBottomY = Math.min(mapHeight, Math.max(0, topOverlayPx));
  const margin = 72;
  const safeTop = chromeBottomY + margin;
  const safeBottom = Math.min(mapHeight, sheetTopY) - margin;
  if (safeBottom <= safeTop) {
    return Math.max(margin, Math.min(mapHeight - margin, sheetTopY - margin));
  }
  const centre = (chromeBottomY + Math.min(mapHeight, sheetTopY)) / 2;
  return Math.max(safeTop, Math.min(safeBottom, centre));
}

export function FocusOnSelectedPoint({
  selectedPoint,
  bottomOverlayPx = 0,
  topOverlayPx = 0,
}: {
  selectedPoint?: FrontendPlace | null;
  bottomOverlayPx?: number;
  topOverlayPx?: number;
}) {
  const map = useMap();
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedPoint) {
      prevIdRef.current = null;
      return;
    }
    const idChanged = selectedPoint.id !== prevIdRef.current;
    prevIdRef.current = selectedPoint.id;

    const target: [number, number] = [selectedPoint.lat, selectedPoint.lon];
    const targetZoom = Math.max(map.getZoom(), 11);
    const mapSize = map.getSize();
    const mapHeight = mapSize.y;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : mapHeight;
    const desiredY = computeVisibleTargetY(mapHeight, viewportHeight, topOverlayPx, bottomOverlayPx);
    const offsetY = mapHeight / 2 - desiredY;
    const point = map.project(target, targetZoom);
    point.y += offsetY;
    const adjusted = map.unproject(point, targetZoom);

    if (idChanged) {
      map.flyTo(adjusted, targetZoom, { duration: 0.6 });
    } else {
      map.panTo(adjusted, { animate: true, duration: 0.35 });
    }
  }, [bottomOverlayPx, map, selectedPoint, topOverlayPx]);

  return null;
}

export function FitBoundsOnVersion({
  fitBoundsKey,
  places,
  topOverlayPx = 95,
  bottomOverlayPx = 62,
}: {
  fitBoundsKey?: string;
  places?: [number, number][];
  topOverlayPx?: number;
  bottomOverlayPx?: number;
}) {
  const map = useMap();
  const prevKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!fitBoundsKey || fitBoundsKey === prevKeyRef.current || !places || places.length === 0) return;
    prevKeyRef.current = fitBoundsKey;
    if (places.length === 1) {
      const targetZoom = Math.max(map.getZoom(), 12);
      const mapSize = map.getSize();
      const mapHeight = mapSize.y;
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : mapHeight;
      const desiredY = computeVisibleTargetY(mapHeight, viewportHeight, topOverlayPx, bottomOverlayPx);
      const point = map.project(places[0], targetZoom);
      point.y += mapHeight / 2 - desiredY;
      const adjusted = map.unproject(point, targetZoom);
      map.flyTo(adjusted, targetZoom, { duration: 0.6 });
      return;
    }
    const bounds = L.latLngBounds(places.map(([lat, lon]) => [lat, lon]));
    map.fitBounds(bounds, {
      animate: true,
      paddingTopLeft: [10, topOverlayPx],
      paddingBottomRight: [10, bottomOverlayPx],
      maxZoom: 13,
    });
  }, [bottomOverlayPx, fitBoundsKey, map, places, topOverlayPx]);

  return null;
}

export function FocusOnUserLocation({ userLocation }: { userLocation?: { lat: number; lon: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) return;
    map.flyTo([userLocation.lat, userLocation.lon], Math.max(map.getZoom(), 11), {
      duration: 0.7,
    });
  }, [map, userLocation]);

  return null;
}
