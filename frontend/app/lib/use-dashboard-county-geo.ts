"use client";

import { useEffect, useState } from "react";
import { pointInFeature } from "./geo";
import type { FrontendPlace } from "./types";

export function useDashboardCountyGeo({
  isMobile,
  snapshotPlaces,
  countyKey,
}: {
  isMobile: boolean;
  snapshotPlaces: FrontendPlace[];
  countyKey: (value: string | null | undefined) => string;
}) {
  const [countyGeoJson, setCountyGeoJson] = useState<GeoJSON.GeoJsonObject | null>(null);
  const [placeCountyGeo, setPlaceCountyGeo] = useState<Map<string, string> | null>(null);

  useEffect(() => {
    if (isMobile) return;
    if (countyGeoJson) return;
    let alive = true;
    const idle = (cb: () => void) => {
      const ric = (window as unknown as { requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
      if (typeof ric === "function") return ric(cb, { timeout: 2000 });
      return window.setTimeout(cb, 300);
    };
    const cancelIdle = (id: number) => {
      const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (typeof cic === "function") cic(id);
      else window.clearTimeout(id);
    };
    const handle = idle(() => {
      if (!alive) return;
      const geoUrl = `/data/estonia_counties_simplified.geojson?v=${process.env.NEXT_PUBLIC_SNAPSHOT_VERSION || "dev"}`;
      fetch(geoUrl, { cache: "force-cache" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (alive) setCountyGeoJson(data);
        })
        .catch(() => {
          if (alive) setCountyGeoJson(null);
        });
    });
    return () => {
      alive = false;
      cancelIdle(handle);
    };
  }, [countyGeoJson, isMobile]);

  useEffect(() => {
    if (!countyGeoJson || countyGeoJson.type !== "FeatureCollection") return;
    if (placeCountyGeo) return;
    let alive = true;
    const featureCollection = countyGeoJson as GeoJSON.FeatureCollection;
    const mapping = new Map<string, string>();
    const chunkSize = 500;
    let offset = 0;
    const processChunk = () => {
      if (!alive) return;
      const end = Math.min(offset + chunkSize, snapshotPlaces.length);
      for (let i = offset; i < end; i++) {
        const place = snapshotPlaces[i];
        for (const feature of featureCollection.features) {
          if (pointInFeature(place.lon, place.lat, feature)) {
            const name = String(feature.properties?.MNIMI || "")
              .trim()
              .split(/\s+/)
              .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
              .join(" ");
            mapping.set(place.id, countyKey(name));
            break;
          }
        }
      }
      offset = end;
      if (offset < snapshotPlaces.length) {
        timerId = window.setTimeout(processChunk, 0);
      } else if (alive) {
        setPlaceCountyGeo(mapping);
      }
    };
    let timerId = window.setTimeout(processChunk, 200);
    return () => {
      alive = false;
      window.clearTimeout(timerId);
    };
  }, [countyGeoJson, countyKey, placeCountyGeo, snapshotPlaces]);

  return {
    countyGeoJson,
    placeCountyGeo,
  };
}
