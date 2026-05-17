"use client";

import { buildDashboardClassName } from "./dashboard-controller-classname";
import { buildMainContentPacket, buildOverlayPacket, buildTopChromePacket } from "./dashboard-controller-view-model-packets";
import type { DashboardControllerViewModelInput } from "./dashboard-controller-view-model-types";

export function buildDashboardControllerViewModel({
  isMobile,
  sidebarCollapsed,
  infoCloseBtnRef,
  langMenuRef,
  mapPanelRef,
  desktopDetailRef,
  chipBarRef,
  overlay,
  topChrome,
  mainContent,
}: DashboardControllerViewModelInput) {
  return {
    dashboardClassName: buildDashboardClassName(isMobile, sidebarCollapsed),
    overlayProps: buildOverlayPacket(infoCloseBtnRef, overlay),
    topChromeProps: buildTopChromePacket(langMenuRef, topChrome),
    mainContentProps: buildMainContentPacket(mapPanelRef, desktopDetailRef, chipBarRef, mainContent),
  };
}
