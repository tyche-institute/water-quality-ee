"use client";

import DashboardDesktopSelectedPlacePanel from "./DashboardDesktopSelectedPlacePanel";
import DashboardMobileBottomSheet from "./DashboardMobileBottomSheet";
import type { DashboardSelectedPlaceWorkspaceComponentProps as Props } from "../lib/dashboard-selected-place-workspace-component-types";
import {
  buildDashboardDesktopSelectedPlacePanelProps,
  buildDashboardMobileBottomSheetProps,
} from "../lib/dashboard-selected-place-workspace-props";

export default function DashboardSelectedPlaceWorkspace(props: Props) {
  const desktopPanelProps = buildDashboardDesktopSelectedPlacePanelProps(props);
  const mobileBottomSheetProps = buildDashboardMobileBottomSheetProps(props);

  return (
    <>
      <DashboardDesktopSelectedPlacePanel {...desktopPanelProps} />
      <DashboardMobileBottomSheet {...mobileBottomSheetProps} />
    </>
  );
}
