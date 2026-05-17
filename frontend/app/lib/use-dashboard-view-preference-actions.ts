"use client";

import { useCallback } from "react";
import type { DashboardLang } from "./dashboard-types";

export function useDashboardViewPreferenceActions({
  setLang,
  pushHeaderLang,
  setLangMenuOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}: {
  setLang: (value: DashboardLang) => void;
  pushHeaderLang: (value: DashboardLang) => void;
  setLangMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
}) {
  const toggleLangMenu = useCallback(() => {
    setLangMenuOpen((value) => !value);
  }, [setLangMenuOpen]);

  const selectLangOption = useCallback((nextLang: DashboardLang) => {
    setLang(nextLang);
    pushHeaderLang(nextLang);
    setLangMenuOpen(false);
  }, [pushHeaderLang, setLang, setLangMenuOpen]);

  const toggleSidebar = useCallback(() => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("water.ui.sidebar-collapsed.v1", String(next));
    }
  }, [setSidebarCollapsed, sidebarCollapsed]);

  const setMobileSheetLang = useCallback((nextLang: DashboardLang) => {
    setLang(nextLang);
    pushHeaderLang(nextLang);
  }, [pushHeaderLang, setLang]);

  return {
    toggleLangMenu,
    selectLangOption,
    toggleSidebar,
    setMobileSheetLang,
  };
}
