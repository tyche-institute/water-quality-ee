"use client";

import { historyMeasurementsForPlace } from "./dashboard-explainers";
import { fmtDate } from "./dashboard-utils";
import { useDashboardControllerActionsRuntime } from "./use-dashboard-controller-actions-runtime";
import type { useDashboardControllerBootstrap } from "./use-dashboard-controller-bootstrap";
import type { useDashboardControllerSceneState } from "./use-dashboard-controller-scene-state";
import { useDashboardControllerTrustRuntime } from "./use-dashboard-controller-trust-runtime";
import type { FrontendPlace, FrontendSnapshot } from "./types";

type BootstrapState = ReturnType<typeof useDashboardControllerBootstrap>;
type SceneState = ReturnType<typeof useDashboardControllerSceneState>;

export function useDashboardControllerInteractionRuntime(
  snapshot: FrontendSnapshot,
  state: BootstrapState,
  scene: SceneState,
) {
  const historyMeasurements = (place: FrontendPlace, idx: number): Record<string, number> =>
    historyMeasurementsForPlace(place, idx, fmtDate);

  const trust = useDashboardControllerTrustRuntime(snapshot, state, historyMeasurements, {
    isMobile: scene.isMobile,
  });
  const actions = useDashboardControllerActionsRuntime(snapshot, state, scene, {
    pushHeaderLang: (lang) => state.setLang(lang),
    explainViolationFromMeasurements: trust.explainViolationFromMeasurements,
    historyMeasurements,
  });

  return {
    historyMeasurements,
    ...trust,
    ...actions,
  };
}
