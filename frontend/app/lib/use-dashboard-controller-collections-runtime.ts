"use client";

import { countyKey, countyPretty } from "./dashboard-controller-utils";
import { useDashboardControllerAnalyticsRuntime } from "./use-dashboard-controller-analytics-runtime";
import type { useDashboardControllerBootstrap } from "./use-dashboard-controller-bootstrap";
import { useDashboardControllerFilterRuntime } from "./use-dashboard-controller-filter-runtime";
import type { useDashboardControllerSceneState } from "./use-dashboard-controller-scene-state";
import { useDashboardDerivedData } from "./use-dashboard-derived-data";
import type { FrontendSnapshot } from "./types";

type BootstrapState = ReturnType<typeof useDashboardControllerBootstrap>;
type SceneState = ReturnType<typeof useDashboardControllerSceneState>;

export function useDashboardControllerCollectionsRuntime(
  snapshot: FrontendSnapshot,
  state: BootstrapState,
  scene: SceneState,
  input: {
    pushHeaderLang: (lang: "ru" | "et" | "en") => void;
    dataFreshnessLevel: string;
    modelFreshnessLevel: string;
  },
) {
  const derived = useDashboardDerivedData({
    places: snapshot.places,
    setCounty: state.setCounty,
    countyKey,
    countyPretty,
  });
  const filter = useDashboardControllerFilterRuntime(snapshot, state, scene);
  const analytics = useDashboardControllerAnalyticsRuntime(snapshot, state, {
    filtered: filter.filtered,
    pushHeaderLang: input.pushHeaderLang,
    dataFreshnessLevel: input.dataFreshnessLevel,
    modelFreshnessLevel: input.modelFreshnessLevel,
  });

  return {
    ...derived,
    ...filter,
    ...analytics,
  };
}
