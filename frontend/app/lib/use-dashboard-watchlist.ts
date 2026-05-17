"use client";

import { useCallback, useEffect, useState } from "react";

export type PlacesTableSortKey = "date" | "prob" | "location" | "county";

export function useDashboardWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("water.watchlist.v1");
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("water.watchlist.v1", JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatch = useCallback((id: string) => {
    setWatchlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  return {
    watchlist,
    toggleWatch,
  };
}

export function useDashboardPlacesTableSort() {
  const [placesTableSort, setPlacesTableSort] = useState<{ key: PlacesTableSortKey; dir: "asc" | "desc" }>({
    key: "date",
    dir: "desc",
  });

  const cyclePlacesTableSort = useCallback((key: PlacesTableSortKey) => {
    setPlacesTableSort((prev) => {
      if (prev.key !== key) {
        const defaultDir = key === "location" || key === "county" ? "asc" : "desc";
        return { key, dir: defaultDir };
      }
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  }, []);

  return {
    placesTableSort,
    cyclePlacesTableSort,
  };
}
