"use client";

import { useCallback, useMemo } from "react";
import type { DashboardFreshnessLevel, DashboardLang } from "./dashboard-types";
import { formatRefreshHistoryTimestamp } from "./dashboard-refresh-history";
import { lruet } from "./dashboard-utils";
import { summarizeFreshness } from "./freshness";
import { DASHBOARD_FRESHNESS_POLICY } from "./freshness-policy";
import type { FrontendSnapshot } from "./types";

export function useDashboardTrustFreshness(lang: DashboardLang, snapshot: FrontendSnapshot) {
  const formatTimestamp = useCallback((raw: string | null | undefined): string | null => {
    return formatRefreshHistoryTimestamp(raw);
  }, []);

  const dataFetchedLabel = useMemo(() => {
    return formatTimestamp(snapshot.data_fetched_at ?? snapshot.generated_at);
  }, [formatTimestamp, snapshot.data_fetched_at, snapshot.generated_at]);

  const modelTrainedLabel = useMemo(() => {
    if (snapshot.model_trained_at) return formatTimestamp(snapshot.model_trained_at);
    if (snapshot.has_model_predictions) return formatTimestamp(snapshot.generated_at);
    return null;
  }, [formatTimestamp, snapshot.generated_at, snapshot.has_model_predictions, snapshot.model_trained_at]);

  const dataFreshness = useMemo(() => {
    return summarizeFreshness(snapshot.data_fetched_at ?? snapshot.generated_at, DASHBOARD_FRESHNESS_POLICY);
  }, [snapshot.data_fetched_at, snapshot.generated_at]);

  const modelFreshness = useMemo(() => {
    return summarizeFreshness(
      snapshot.model_trained_at ?? (snapshot.has_model_predictions ? snapshot.generated_at : null),
      DASHBOARD_FRESHNESS_POLICY
    );
  }, [snapshot.generated_at, snapshot.has_model_predictions, snapshot.model_trained_at]);

  const freshnessLabel = useCallback((level: DashboardFreshnessLevel) => {
    return lruet(
      lang,
      level === "fresh" ? "свежее" : level === "aging" ? "стареет" : level === "stale" ? "устарело" : "неизвестно",
      level === "fresh" ? "värske" : level === "aging" ? "vananeb" : level === "stale" ? "aegunud" : "teadmata",
      level === "fresh" ? "fresh" : level === "aging" ? "aging" : level === "stale" ? "stale" : "unknown",
    );
  }, [lang]);

  return {
    dataFetchedLabel,
    modelTrainedLabel,
    dataFreshness,
    modelFreshness,
    freshnessLabel,
  };
}
