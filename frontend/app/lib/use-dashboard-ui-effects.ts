"use client";

import { useEffect } from "react";
import { track } from "./analytics";

export function useDashboardUiEffects({
  lang,
  pushHeaderLang,
  langMenuOpen,
  langMenuRef,
  setLangMenuOpen,
  minProbInput,
  setMinProb,
  cyrillicFont,
  theme,
  dashboardOpenPayload,
  filtersChangedPayload,
}: {
  lang: "ru" | "et" | "en";
  pushHeaderLang: (value: "ru" | "et" | "en") => void;
  langMenuOpen: boolean;
  langMenuRef: React.RefObject<HTMLDivElement | null>;
  setLangMenuOpen: (value: boolean) => void;
  minProbInput: number;
  setMinProb: (value: number) => void;
  cyrillicFont: "ibm" | "manrope";
  theme: "light" | "dark";
  dashboardOpenPayload: {
    places_count: number;
    has_model: boolean;
    data_freshness: string;
    model_freshness: string;
  };
  filtersChangedPayload: {
    segment: string;
    risk: string;
    county: string;
    official: string;
    alerts_only: boolean;
    nearby_only: boolean;
    nearby_radius_km: number | null;
    min_prob: number;
    sample_date_from: string | null;
    sample_date_to: string | null;
    query_length: number;
    visible_count: number;
  };
}) {
  useEffect(() => {
    track("dashboard_open", dashboardOpenPayload);
  }, [dashboardOpenPayload]);

  useEffect(() => {
    pushHeaderLang(lang);
  }, [lang, pushHeaderLang]);

  useEffect(() => {
    if (!langMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!langMenuRef.current) return;
      if (!langMenuRef.current.contains(event.target as Node)) setLangMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [langMenuOpen, langMenuRef, setLangMenuOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMinProb(minProbInput), 120);
    return () => clearTimeout(timeoutId);
  }, [minProbInput, setMinProb]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.remove("cyr-ibm", "cyr-manrope");
    document.body.classList.add(cyrillicFont === "manrope" ? "cyr-manrope" : "cyr-ibm");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("water.ui.cyrillic-font.v1", cyrillicFont);
    }
  }, [cyrillicFont]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (theme === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("water.ui.theme.v1", theme);
    }
  }, [theme]);

  useEffect(() => {
    track("filters_changed", filtersChangedPayload);
  }, [filtersChangedPayload]);
}
