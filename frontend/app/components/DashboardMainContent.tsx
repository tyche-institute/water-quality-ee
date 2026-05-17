"use client";

import DashboardInsightsSection from "./DashboardInsightsSection";
import DashboardMapWorkspace from "./DashboardMapWorkspace";
import type { DashboardMainContentComponentProps as Props } from "../lib/dashboard-main-content-component-types";
import {
  buildDashboardMainContentInsightsProps,
  buildDashboardMainContentWorkspaceProps,
} from "../lib/dashboard-main-content-props";

export default function DashboardMainContent(props: Props) {
  const workspaceProps = buildDashboardMainContentWorkspaceProps(props);
  const insightsProps = buildDashboardMainContentInsightsProps(props);

  return (
    <div className="mainContent">
      <DashboardMapWorkspace {...workspaceProps} />
      <DashboardInsightsSection {...insightsProps} />
    </div>
  );
}
