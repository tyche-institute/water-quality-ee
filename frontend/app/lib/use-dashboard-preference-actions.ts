"use client";

import { useCallback } from "react";
import { track } from "./analytics";
import type { DashboardLang } from "./dashboard-types";

export function useDashboardPreferenceActions({
  watchlist,
  setLang,
  setShowLangDialog,
  toggleWatchState,
}: {
  watchlist: string[];
  setLang: (value: DashboardLang) => void;
  setShowLangDialog: (value: boolean) => void;
  toggleWatchState: (id: string) => void;
}) {
  const pushHeaderLang = useCallback((nextLang: DashboardLang) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("water.ui.lang", nextLang);
    window.dispatchEvent(new CustomEvent("water-ui-lang-changed", { detail: { lang: nextLang } }));
  }, []);

  const chooseLang = useCallback((nextLang: DashboardLang) => {
    setLang(nextLang);
    setShowLangDialog(false);
    pushHeaderLang(nextLang);
  }, [pushHeaderLang, setLang, setShowLangDialog]);

  const toggleWatch = useCallback((id: string) => {
    track("watchlist_toggled", { place_id: id, enabled: !watchlist.includes(id) });
    toggleWatchState(id);
  }, [toggleWatchState, watchlist]);

  return {
    pushHeaderLang,
    chooseLang,
    toggleWatch,
  };
}
