"use client";

import type { DashboardOverlayProps } from "./dashboard-controller-component-props";
import type { OverlayInput } from "./dashboard-controller-overlay-types";

export function buildDashboardOverlayProps(
  input: OverlayInput,
): Omit<DashboardOverlayProps, "infoCloseBtnRef"> {
  return {
    lang: input.lang,
    snapshot: input.snapshot,
    t: input.t,
    toast: input.toast,
    freshnessBubble: input.freshnessBubble,
    countBubble: input.countBubble,
    infoOpen: input.infoOpen,
    infoTitle: input.infoTitle,
    infoText: input.infoText,
    infoPageOpen: input.infoPageOpen,
    infoPageTab: input.infoPageTab,
    parameterCards: input.parameterCards,
    quickInsights: input.quickInsights,
    expertModeText: input.expertModeText,
    dataFetchedLabel: input.dataFetchedLabel,
    modelTrainedLabel: input.modelTrainedLabel,
    dataFreshnessLevel: input.dataFreshnessLevel,
    modelFreshnessLevel: input.modelFreshnessLevel,
    freshnessLabel: input.freshnessLabel,
    severityLabel: input.severityLabel,
    openInfo: input.openInfo,
    onCloseInfo: input.onCloseInfo,
    onCloseInfoPage: input.onCloseInfoPage,
    onSelectInfoPageTab: input.onSelectInfoPageTab,
  };
}
