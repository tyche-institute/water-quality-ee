"use client";

import type { ComponentProps } from "react";
import type DashboardMainContent from "../components/DashboardMainContent";
import type DashboardOverlays from "../components/DashboardOverlays";
import type DashboardTopChrome from "../components/DashboardTopChrome";
import { buildDashboardMainContentProps, buildDashboardOverlayProps, buildDashboardTopChromeProps } from "./dashboard-view-model-props";
import type { MainContentInput } from "./dashboard-controller-main-content-types";
import type { OverlayInput } from "./dashboard-controller-overlay-types";
import type { TopChromeInput } from "./dashboard-controller-top-chrome-types";

export function buildOverlayPacket(
  infoCloseBtnRef: ComponentProps<typeof DashboardOverlays>["infoCloseBtnRef"],
  overlay: OverlayInput,
) {
  return {
    infoCloseBtnRef,
    ...buildDashboardOverlayProps(overlay),
  };
}

export function buildTopChromePacket(
  langMenuRef: ComponentProps<typeof DashboardTopChrome>["langMenuRef"],
  topChrome: TopChromeInput,
) {
  return {
    langMenuRef,
    ...buildDashboardTopChromeProps(topChrome),
  };
}

export function buildMainContentPacket(
  mapPanelRef: ComponentProps<typeof DashboardMainContent>["mapPanelRef"],
  desktopDetailRef: ComponentProps<typeof DashboardMainContent>["desktopDetailRef"],
  chipBarRef: ComponentProps<typeof DashboardMainContent>["chipBarRef"],
  mainContent: MainContentInput,
) {
  return {
    mapPanelRef,
    desktopDetailRef,
    chipBarRef,
    ...buildDashboardMainContentProps(mainContent),
  };
}
