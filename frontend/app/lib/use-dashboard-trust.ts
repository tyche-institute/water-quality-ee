"use client";

import { useCallback } from "react";
import type { DashboardLang } from "./dashboard-types";
import { useDashboardTrustCopy } from "./use-dashboard-trust-copy";
import { useDashboardTrustExplainers } from "./use-dashboard-trust-explainers";
import { useDashboardTrustFreshness } from "./use-dashboard-trust-freshness";
import type { FrontendPlace, FrontendSnapshot } from "./types";

export function useDashboardTrust({
  lang,
  snapshot,
  selectedId,
  setInfoTitle,
  setInfoText,
  setInfoOpen,
  trackInfoOpened,
  fmtDate,
  historyMeasurements,
}: {
  lang: DashboardLang;
  snapshot: FrontendSnapshot;
  selectedId: string | null;
  setInfoTitle: (value: string) => void;
  setInfoText: (value: string) => void;
  setInfoOpen: (value: boolean) => void;
  trackInfoOpened: (title: string, text: string, selectedPlaceId: string | null) => void;
  fmtDate: (value: string | null) => string;
  historyMeasurements: (place: FrontendPlace, idx: number) => Record<string, number>;
}) {
  const copy = useDashboardTrustCopy(lang);
  const explainers = useDashboardTrustExplainers({
    lang,
    fmtDate,
    labelForParam: copy.labelForParam,
    descForParam: copy.descForParam,
    historyMeasurements,
  });
  const freshness = useDashboardTrustFreshness(lang, snapshot);

  const openInfo = useCallback((title: string, text: string) => {
    trackInfoOpened(title, text, selectedId);
    setInfoTitle(title);
    setInfoText(text);
    setInfoOpen(true);
  }, [selectedId, setInfoOpen, setInfoText, setInfoTitle, trackInfoOpened]);

  return {
    ...copy,
    ...explainers,
    openInfo,
    ...freshness,
  };
}
