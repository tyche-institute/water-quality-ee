"use client";

import type { ComponentProps } from "react";
import type DashboardMainContent from "../components/DashboardMainContent";
import type DashboardOverlays from "../components/DashboardOverlays";
import type DashboardTopChrome from "../components/DashboardTopChrome";
import type { MainContentInput } from "./dashboard-controller-main-content-types";
import type { OverlayInput } from "./dashboard-controller-overlay-types";
import type { TopChromeInput } from "./dashboard-controller-top-chrome-types";

export type DashboardControllerViewModelInput = {
  isMobile: boolean;
  sidebarCollapsed: boolean;
  infoCloseBtnRef: ComponentProps<typeof DashboardOverlays>["infoCloseBtnRef"];
  langMenuRef: ComponentProps<typeof DashboardTopChrome>["langMenuRef"];
  mapPanelRef: ComponentProps<typeof DashboardMainContent>["mapPanelRef"];
  desktopDetailRef: ComponentProps<typeof DashboardMainContent>["desktopDetailRef"];
  chipBarRef: ComponentProps<typeof DashboardMainContent>["chipBarRef"];
  overlay: OverlayInput;
  topChrome: TopChromeInput;
  mainContent: MainContentInput;
};
