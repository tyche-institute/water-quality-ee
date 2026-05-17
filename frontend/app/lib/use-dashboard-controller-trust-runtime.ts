"use client";

import { track } from "./analytics";
import { fmtDate } from "./dashboard-utils";
import { useDashboardToasts } from "./use-dashboard-toasts";
import { useDashboardTrust } from "./use-dashboard-trust";
import type { useDashboardControllerBootstrap } from "./use-dashboard-controller-bootstrap";
import type { FrontendPlace, FrontendSnapshot } from "./types";

type BootstrapState = ReturnType<typeof useDashboardControllerBootstrap>;

export function useDashboardControllerTrustRuntime(
  snapshot: FrontendSnapshot,
  state: BootstrapState,
  historyMeasurements: (place: FrontendPlace, idx: number) => Record<string, number>,
  data: {
    isMobile: boolean;
  },
) {
  const trust = useDashboardTrust({
    lang: state.lang,
    snapshot,
    selectedId: state.selectedId,
    setInfoTitle: state.setInfoTitle,
    setInfoText: state.setInfoText,
    setInfoOpen: state.setInfoOpen,
    trackInfoOpened: (title, text, selectedPlaceId) => {
      track("info_opened", {
        title,
        body_length: text.length,
        selected_place_id: selectedPlaceId,
      });
    },
    fmtDate,
    historyMeasurements,
  });
  const toasts = useDashboardToasts({
    isMobile: data.isMobile,
    lang: state.lang,
    places: snapshot.places,
    dataFetchedLabel: trust.dataFetchedLabel,
    modelTrainedLabel: trust.modelTrainedLabel,
  });

  return {
    ...trust,
    ...toasts,
  };
}
