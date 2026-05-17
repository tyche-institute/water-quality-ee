"use client";

import DashboardMainContent from "./DashboardMainContent";
import DashboardOverlays from "./DashboardOverlays";
import DashboardTopChrome from "./DashboardTopChrome";
import { useDashboardController } from "../lib/use-dashboard-controller";
import type { FrontendSnapshot } from "../lib/types";

type Props = { snapshot: FrontendSnapshot };

export default function Dashboard({ snapshot }: Props) {
  const { dashboardClassName, overlayProps, topChromeProps, mainContentProps } = useDashboardController(snapshot);

  return (
    <div className={dashboardClassName}>
      <DashboardOverlays {...overlayProps} />
      <DashboardTopChrome {...topChromeProps} />
      <DashboardMainContent {...mainContentProps} />
    </div>
  );
}
