"use client";

import type { ComponentProps } from "react";
import type DashboardInsightsSection from "../components/DashboardInsightsSection";
import type DashboardMapWorkspace from "../components/DashboardMapWorkspace";
import type { DashboardMainContentProps } from "./dashboard-controller-component-props";
import type { MainContentInput } from "./dashboard-controller-main-content-types";
import { fmtDate } from "./dashboard-utils";
import type { DashboardMainContentComponentProps } from "./dashboard-main-content-component-types";

type DashboardMapWorkspaceProps = ComponentProps<typeof DashboardMapWorkspace>;
type DashboardInsightsSectionProps = ComponentProps<typeof DashboardInsightsSection>;

export function buildDashboardMainContentProps(
  input: MainContentInput,
): Omit<DashboardMainContentProps, "mapPanelRef" | "desktopDetailRef" | "chipBarRef"> {
  return { ...input };
}

export function buildDashboardMainContentWorkspaceProps(
  props: DashboardMainContentComponentProps,
): DashboardMapWorkspaceProps {
  const { selectedId, placesTableRows, placesTableSort, topAlerts, domainStats, onCycleSort, ...workspaceProps } = props;
  void selectedId;
  void placesTableRows;
  void placesTableSort;
  void topAlerts;
  void domainStats;
  void onCycleSort;
  return workspaceProps;
}

export function buildDashboardMainContentInsightsProps(
  props: DashboardMainContentComponentProps,
): DashboardInsightsSectionProps {
  const {
    lang,
    isMobile,
    filteredCount,
    placesTableRows,
    selectedId,
    watchlist,
    placesTableSort,
    topAlerts,
    domainStats,
    openInfo,
    explainViolation,
    officialStatusText,
    countyPretty,
    onSelectPoint,
    onToggleWatch,
    onCycleSort,
  } = props;

  return {
    lang,
    isMobile,
    filteredCount,
    placesTableRows,
    selectedId,
    watchlist,
    placesTableSort,
    topAlerts,
    domainStats,
    openInfo,
    explainViolation,
    officialStatusText,
    countyPretty,
    fmtDate,
    onSelectPoint,
    onToggleWatch,
    onCycleSort,
  };
}
