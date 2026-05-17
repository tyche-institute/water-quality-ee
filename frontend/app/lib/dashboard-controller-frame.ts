"use client";

import type { DashboardBootstrapState, DashboardRuntimeState } from "./dashboard-controller-input-types";

export function buildDashboardControllerFrame(state: DashboardBootstrapState, runtime: DashboardRuntimeState) {
  return {
    isMobile: runtime.isMobile,
    sidebarCollapsed: state.sidebarCollapsed,
    infoCloseBtnRef: state.infoCloseBtnRef,
    langMenuRef: state.langMenuRef,
    mapPanelRef: state.mapPanelRef,
    desktopDetailRef: state.desktopDetailRef,
    chipBarRef: state.chipBarRef,
  };
}
