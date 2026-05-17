"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FrontendPlace } from "./types";

type PlaceHistoryMap = Record<string, FrontendPlace["sample_history"]>;
type PlaceDetailsMap = Record<string, { measurements?: Record<string, number> }>;

const SNAPSHOT_VERSION = process.env.NEXT_PUBLIC_SNAPSHOT_VERSION || "dev";
const HISTORY_URL = `/data/snapshot.history.json?v=${SNAPSHOT_VERSION}`;
const DETAILS_URL = `/data/snapshot.details.json?v=${SNAPSHOT_VERSION}`;

export function usePlaceWithDetails(place: FrontendPlace | null): FrontendPlace | null {
  const [historyById, setHistoryById] = useState<PlaceHistoryMap>({});
  const [detailsById, setDetailsById] = useState<PlaceDetailsMap>({});
  const historyFetchStarted = useRef(false);
  const detailsFetchStarted = useRef(false);

  useEffect(() => {
    if (!place) return;
    if (place.sample_history?.length || historyById[place.id]) return;
    if (historyFetchStarted.current) return;

    let cancelled = false;
    historyFetchStarted.current = true;

    fetch(HISTORY_URL, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((all: PlaceHistoryMap) => {
        if (cancelled) return;
        setHistoryById(all);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [place, historyById]);

  useEffect(() => {
    if (!place) return;
    if (Object.keys(place.measurements || {}).length > 0 || detailsById[place.id]) return;
    if (detailsFetchStarted.current) return;

    let cancelled = false;
    detailsFetchStarted.current = true;

    fetch(DETAILS_URL, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((all: PlaceDetailsMap) => {
        if (cancelled) return;
        setDetailsById(all);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [place, detailsById]);

  return useMemo(() => {
    if (!place) return null;
    const lazyHistory = place.sample_history?.length ? place.sample_history : historyById[place.id];
    const lazyDetails = Object.keys(place.measurements || {}).length > 0 ? null : detailsById[place.id];
    if (!lazyHistory && !lazyDetails) return place;
    return {
      ...place,
      sample_history: lazyHistory ?? place.sample_history,
      measurements: lazyDetails?.measurements ?? place.measurements,
    };
  }, [place, historyById, detailsById]);
}
