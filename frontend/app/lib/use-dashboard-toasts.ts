"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardLang } from "./dashboard-types";
import { lruet } from "./dashboard-utils";
import type { FrontendPlace } from "./types";

export function useDashboardToasts({
  isMobile,
  lang,
  places,
  dataFetchedLabel,
  modelTrainedLabel,
}: {
  isMobile: boolean;
  lang: DashboardLang;
  places: FrontendPlace[];
  dataFetchedLabel: string | null;
  modelTrainedLabel: string | null;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const [freshnessBubble, setFreshnessBubble] = useState<string | null>(null);
  const toastFiredRef = useRef(false);
  const freshnessToastFiredRef = useRef(false);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!freshnessBubble) return;
    const timeoutId = setTimeout(() => setFreshnessBubble(null), 5000);
    return () => clearTimeout(timeoutId);
  }, [freshnessBubble]);

  useEffect(() => {
    if (!isMobile || toastFiredRef.current) return;
    toastFiredRef.current = true;
    const totalPlaces = places.length;
    const totalViolations = places.filter((place) => place.official_compliant === 0).length;
    const summaryMessage = lruet(
      lang,
      `${totalPlaces} точек · ${totalViolations} нарушений`,
      `${totalPlaces} punkti · ${totalViolations} rikkumist`,
      `${totalPlaces} points · ${totalViolations} violations`
    );
    const timeoutId = setTimeout(() => setToast(summaryMessage), 300);
    return () => clearTimeout(timeoutId);
  }, [isMobile, lang, places]);

  useEffect(() => {
    if (!isMobile || freshnessToastFiredRef.current || !dataFetchedLabel) return;
    freshnessToastFiredRef.current = true;
    const dataLabel = lruet(lang, "Данные", "Andmed", "Data");
    const modelLabel = lruet(lang, "Модель", "Mudel", "Model");
    const timeoutId = setTimeout(() => {
      setFreshnessBubble(
        modelTrainedLabel
          ? `${dataLabel}: ${dataFetchedLabel}\n${modelLabel}: ${modelTrainedLabel}`
          : `${dataLabel}: ${dataFetchedLabel}`
      );
    }, 4500);
    return () => clearTimeout(timeoutId);
  }, [isMobile, lang, dataFetchedLabel, modelTrainedLabel]);

  return {
    toast,
    freshnessBubble,
  };
}
