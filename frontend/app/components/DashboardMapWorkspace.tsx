"use client";

import DashboardMapCanvas from "./DashboardMapCanvas";
import DashboardSelectedPlaceWorkspace from "./DashboardSelectedPlaceWorkspace";
import {
  buildDashboardMapWorkspaceCanvasSectionProps,
  buildDashboardMapWorkspaceSelectedPlaceSectionProps,
} from "../lib/dashboard-map-workspace-sections";
import type { DashboardMapWorkspaceComponentProps as Props } from "../lib/dashboard-map-workspace-component-types";
export default function DashboardMapWorkspace(props: Props) {
  const mapCanvasProps = buildDashboardMapWorkspaceCanvasSectionProps(props);
  const selectedPlaceWorkspaceProps = buildDashboardMapWorkspaceSelectedPlaceSectionProps(props);

  return (
    <div className="mapWithDetail">
      <DashboardMapCanvas {...mapCanvasProps} />
      <DashboardSelectedPlaceWorkspace {...selectedPlaceWorkspaceProps} />
    </div>
  );
}
