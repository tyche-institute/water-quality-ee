"use client";

import { forwardRef } from "react";
import type { ReactNode } from "react";
import type { DashboardLang } from "../lib/dashboard-types";
import type { FrontendPlace, FrontendSnapshot } from "../lib/types";
import DashboardClusterPicker from "./DashboardClusterPicker";
import DashboardSelectedPlaceHistory from "./DashboardSelectedPlaceHistory";
import DashboardSelectedPlaceMeasurements from "./DashboardSelectedPlaceMeasurements";
import DashboardSelectedPlaceSummary from "./DashboardSelectedPlaceSummary";

type Props = {
  lang: DashboardLang;
  snapshot: FrontendSnapshot;
  selectedPlace: FrontendPlace | null;
  clusterPlaces: FrontendPlace[] | null;
  watchlist: string[];
  measurementsOpen: boolean;
  historyOpen: boolean;
  historyPlaceholder: string;
  title: string;
  emptyHint: string;
  onSelectPoint: (id: string) => void;
  onToggleWatch: (id: string) => void;
  onToggleMeasurements: () => void;
  onToggleHistory: () => void;
  countyPretty: (value: string | null | undefined) => string;
  fmtDate: (value: string | null) => string;
  officialStatusText: (value: number | null) => string;
  explainViolation: (place: FrontendPlace) => string;
  openInfo: (title: string, text: string) => void;
  labelForParam: (key: string) => string;
  descForParam: (key: string) => string;
  explainMeasurementNorm: (param: string, rawValue: number | string, place: FrontendPlace) => string;
  explainHistoryMeasurements: (place: FrontendPlace, idx: number) => string;
  explainViolationFromHistory: (place: FrontendPlace, idx: number) => string;
  renderStarIcon: (active: boolean) => ReactNode;
  watchlistAddLabel: string;
  watchlistRemoveLabel: string;
};

const DashboardDesktopSelectedPlacePanel = forwardRef<HTMLDivElement, Props>(function DashboardDesktopSelectedPlacePanel({
  lang,
  snapshot,
  selectedPlace,
  clusterPlaces,
  watchlist,
  measurementsOpen,
  historyOpen,
  historyPlaceholder,
  title,
  emptyHint,
  onSelectPoint,
  onToggleWatch,
  onToggleMeasurements,
  onToggleHistory,
  countyPretty,
  fmtDate,
  officialStatusText,
  explainViolation,
  openInfo,
  labelForParam,
  descForParam,
  explainMeasurementNorm,
  explainHistoryMeasurements,
  explainViolationFromHistory,
  renderStarIcon,
  watchlistAddLabel,
  watchlistRemoveLabel,
}, ref) {
  const isWatching = selectedPlace ? watchlist.includes(selectedPlace.id) : false;

  return (
    <section ref={ref} className="panel selectedPointDesktop desktopOnly">
      <div className="selectedPointHeader">
        <h3 className="sectionTitle">{title}</h3>
        {selectedPlace ? (
          <button
            type="button"
            className="starBtn selectedPointWatchBtn"
            onClick={() => onToggleWatch(selectedPlace.id)}
            aria-pressed={isWatching}
            aria-label={isWatching ? watchlistRemoveLabel : watchlistAddLabel}
            title={isWatching ? watchlistRemoveLabel : watchlistAddLabel}
          >
            {renderStarIcon(isWatching)}
          </button>
        ) : null}
      </div>
      {!selectedPlace && clusterPlaces ? (
        <DashboardClusterPicker lang={lang} clusterPlaces={clusterPlaces} onSelectPoint={onSelectPoint} />
      ) : !selectedPlace ? (
        <p className="hint">{emptyHint}</p>
      ) : (
        <div className="pointGrid">
          <DashboardSelectedPlaceSummary
            lang={lang}
            place={selectedPlace}
            canonicalModel={snapshot.canonical_model}
            countyPretty={countyPretty}
            fmtDate={fmtDate}
            officialStatusText={officialStatusText}
            explainViolation={explainViolation}
            openInfo={openInfo}
          />
          <DashboardSelectedPlaceMeasurements
            lang={lang}
            place={selectedPlace}
            isOpen={measurementsOpen}
            onToggle={onToggleMeasurements}
            openInfo={openInfo}
            labelForParam={labelForParam}
            descForParam={descForParam}
            explainMeasurementNorm={explainMeasurementNorm}
          />
          <DashboardSelectedPlaceHistory
            lang={lang}
            place={selectedPlace}
            isOpen={historyOpen}
            onToggle={onToggleHistory}
            fmtDate={fmtDate}
            openInfo={openInfo}
            officialStatusText={officialStatusText}
            explainHistoryMeasurements={explainHistoryMeasurements}
            explainViolationFromHistory={explainViolationFromHistory}
            historyPlaceholder={historyPlaceholder}
          />
        </div>
      )}
    </section>
  );
});

export default DashboardDesktopSelectedPlacePanel;
