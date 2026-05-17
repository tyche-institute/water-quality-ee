"use client";

import { useState } from "react";
import type { DashboardLang, DashboardTheme } from "./dashboard-types";

type CyrillicFont = "ibm" | "manrope";

export function useDashboardPreferences() {
  const [lang, setLang] = useState<DashboardLang>(() => {
    if (typeof window === "undefined") return "ru";
    const saved = window.localStorage.getItem("water.ui.lang");
    return saved === "ru" || saved === "et" || saved === "en" ? saved : "ru";
  });
  const [showLangDialog, setShowLangDialog] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem("water.ui.lang");
  });
  const [cyrillicFont, setCyrillicFont] = useState<CyrillicFont>(() => {
    if (typeof window === "undefined") return "ibm";
    const saved = window.localStorage.getItem("water.ui.cyrillic-font.v1");
    return saved === "ibm" || saved === "manrope" ? saved : "ibm";
  });
  const [theme, setTheme] = useState<DashboardTheme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("water.ui.theme.v1");
    return saved === "dark" ? "dark" : "light";
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("water.ui.sidebar-collapsed.v1") === "true";
  });
  const [measurementsOpen, setMeasurementsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("water.ui.measurements-open.v1") !== "false";
  });
  const [historyOpen, setHistoryOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("water.ui.history-open.v1") !== "false";
  });
  const [headerCompact, setHeaderCompact] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  return {
    lang,
    setLang,
    showLangDialog,
    setShowLangDialog,
    cyrillicFont,
    setCyrillicFont,
    theme,
    setTheme,
    drawerOpen,
    setDrawerOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    measurementsOpen,
    setMeasurementsOpen,
    historyOpen,
    setHistoryOpen,
    headerCompact,
    setHeaderCompact,
    langMenuOpen,
    setLangMenuOpen,
  };
}
