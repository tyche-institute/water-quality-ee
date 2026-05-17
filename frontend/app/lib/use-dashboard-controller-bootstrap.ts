"use client";

import { DASHBOARD_TRANSLATIONS } from "./dashboard-translations";
import { useDashboardControllerFilterState } from "./use-dashboard-controller-filter-state";
import { useDashboardControllerFrameState } from "./use-dashboard-controller-frame-state";
import { useDashboardControllerInfoState } from "./use-dashboard-controller-info-state";
import { useDashboardControllerPreferencesState } from "./use-dashboard-controller-preferences-state";
import { useDashboardControllerSelectionState } from "./use-dashboard-controller-selection-state";

export function useDashboardControllerBootstrap() {
  const frameState = useDashboardControllerFrameState();
  const selectionState = useDashboardControllerSelectionState();
  const filterState = useDashboardControllerFilterState();
  const infoState = useDashboardControllerInfoState();
  const preferencesState = useDashboardControllerPreferencesState();

  return {
    ...preferencesState,
    ...infoState,
    ...filterState,
    ...selectionState,
    ...frameState,
    t: DASHBOARD_TRANSLATIONS[preferencesState.lang],
  };
}
