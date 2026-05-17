"use client";

import { useCallback, useMemo } from "react";
import { buildExpertModeText, PARAM_INFO, pickLocalizedParamDesc, pickLocalizedParamLabel } from "./dashboard-content";
import { officialLabelForLang, officialStatusTextForLang, placeKindLabelForLang, riskLabelForLang, severityLabelForLang } from "./dashboard-labels";
import type { DashboardLang } from "./dashboard-types";
import { lruet } from "./dashboard-utils";

export function useDashboardTrustCopy(lang: DashboardLang) {
  const expertModeText = useMemo(() => buildExpertModeText(lang), [lang]);

  const labelForParam = useCallback((key: string) => {
    const info = PARAM_INFO[key];
    if (!info) return key;
    return pickLocalizedParamLabel(lang, info);
  }, [lang]);

  const descForParam = useCallback((key: string) => {
    const info = PARAM_INFO[key];
    if (!info) {
      return lruet(
        lang,
        "Лабораторный параметр качества воды. Важность зависит от типа точки (питьевая вода, бассейн, открытая вода) и нормативов.",
        "Laboratoorne veekvaliteedi näitaja. Tähendus sõltub domeenist ja normidest.",
        "Laboratory water quality parameter. Its meaning depends on domain and applicable norms."
      );
    }
    return pickLocalizedParamDesc(lang, info);
  }, [lang]);

  const severityLabel = useCallback((level: "good" | "warn" | "bad") => severityLabelForLang(lang, level), [lang]);
  const officialStatusText = useCallback((value: number | null) => officialStatusTextForLang(lang, value), [lang]);
  const placeKindLabel = useCallback((kind: string) => placeKindLabelForLang(lang, kind), [lang]);
  const riskLabel = useCallback((risk: string) => riskLabelForLang(lang, risk), [lang]);
  const officialLabel = useCallback((value: string) => officialLabelForLang(lang, value), [lang]);

  return {
    expertModeText,
    labelForParam,
    descForParam,
    severityLabel,
    officialStatusText,
    placeKindLabel,
    riskLabel,
    officialLabel,
  };
}
