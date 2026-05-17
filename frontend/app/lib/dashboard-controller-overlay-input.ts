"use client";

import type { FrontendSnapshot } from "./types";
import type { DashboardBootstrapState, DashboardRuntimeState } from "./dashboard-controller-input-types";

export function buildOverlayInput(
  snapshot: FrontendSnapshot,
  state: DashboardBootstrapState,
  runtime: DashboardRuntimeState,
) {
  return {
    lang: state.lang,
    snapshot,
    t: state.t,
    toast: runtime.toast,
    freshnessBubble: runtime.freshnessBubble,
    countBubble: runtime.countBubble,
    infoOpen: state.infoOpen,
    infoTitle: state.infoTitle,
    infoText: state.infoText,
    infoPageOpen: state.infoPageOpen,
    infoPageTab: state.infoPageTab,
    parameterCards: runtime.parameterCards,
    quickInsights: runtime.quickInsights,
    expertModeText: runtime.expertModeText,
    dataFetchedLabel: runtime.dataFetchedLabel,
    modelTrainedLabel: runtime.modelTrainedLabel,
    dataFreshnessLevel: runtime.dataFreshness.level,
    modelFreshnessLevel: runtime.modelFreshness.level,
    freshnessLabel: runtime.freshnessLabel,
    severityLabel: runtime.severityLabel,
    openInfo: runtime.openInfo,
    onCloseInfo: () => state.setInfoOpen(false),
    onCloseInfoPage: () => state.setInfoPageOpen(false),
    onSelectInfoPageTab: state.setInfoPageTab,
  };
}
