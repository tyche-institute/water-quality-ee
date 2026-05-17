"use client";

import { useDashboardAnalytics } from "./use-dashboard-analytics";
import { useDashboardUiEffects } from "./use-dashboard-ui-effects";
import type { useDashboardControllerBootstrap } from "./use-dashboard-controller-bootstrap";
import type { FrontendSnapshot } from "./types";

type BootstrapState = ReturnType<typeof useDashboardControllerBootstrap>;

export function useDashboardControllerAnalyticsRuntime(
  snapshot: FrontendSnapshot,
  state: BootstrapState,
  input: {
    filtered: typeof snapshot.places;
    pushHeaderLang: (lang: "ru" | "et" | "en") => void;
    dataFreshnessLevel: string;
    modelFreshnessLevel: string;
  },
) {
  useDashboardUiEffects({
    lang: state.lang,
    pushHeaderLang: input.pushHeaderLang,
    langMenuOpen: state.langMenuOpen,
    langMenuRef: state.langMenuRef,
    setLangMenuOpen: state.setLangMenuOpen,
    minProbInput: state.minProbInput,
    setMinProb: state.setMinProb,
    cyrillicFont: state.cyrillicFont,
    theme: state.theme,
    dashboardOpenPayload: {
      places_count: snapshot.places_count,
      has_model: snapshot.has_model_predictions,
      data_freshness: input.dataFreshnessLevel,
      model_freshness: input.modelFreshnessLevel,
    },
    filtersChangedPayload: {
      segment: state.segment,
      risk: state.risk,
      county: state.county,
      official: state.official,
      alerts_only: state.alertsOnly,
      nearby_only: state.nearbyOnly,
      nearby_radius_km: state.nearbyOnly ? state.nearbyRadiusKm : null,
      min_prob: Number(state.minProb.toFixed(2)),
      sample_date_from: state.sampleDateFrom || null,
      sample_date_to: state.sampleDateTo || null,
      query_length: state.query.length,
      visible_count: input.filtered.length,
    },
  });

  return useDashboardAnalytics(input.filtered, snapshot.diagnostics, state.lang);
}
