"use client";

import type { DashboardLang } from "./dashboard-types";
import type { FrontendSnapshot } from "./types";
import type { DashboardOverlayProps } from "./dashboard-controller-component-props";

export type OverlayInput = {
  lang: DashboardLang;
  snapshot: FrontendSnapshot;
  t: DashboardOverlayProps["t"];
  toast: string | null;
  freshnessBubble: string | null;
  countBubble: { seq: number; text: string } | null;
  infoOpen: boolean;
  infoTitle: string;
  infoText: string;
  infoPageOpen: boolean;
  infoPageTab: DashboardOverlayProps["infoPageTab"];
  parameterCards: DashboardOverlayProps["parameterCards"];
  quickInsights: DashboardOverlayProps["quickInsights"];
  expertModeText: string;
  dataFetchedLabel: string | null;
  modelTrainedLabel: string | null;
  dataFreshnessLevel: DashboardOverlayProps["dataFreshnessLevel"];
  modelFreshnessLevel: DashboardOverlayProps["modelFreshnessLevel"];
  freshnessLabel: DashboardOverlayProps["freshnessLabel"];
  severityLabel: DashboardOverlayProps["severityLabel"];
  openInfo: DashboardOverlayProps["openInfo"];
  onCloseInfo: DashboardOverlayProps["onCloseInfo"];
  onCloseInfoPage: DashboardOverlayProps["onCloseInfoPage"];
  onSelectInfoPageTab: DashboardOverlayProps["onSelectInfoPageTab"];
};
