"use client";

import type { CSSProperties, ReactNode } from "react";
import type {
  DashboardLang,
  DashboardMobilePanelState,
  DashboardMobileSheetMode,
  DashboardOfficialFilter,
  DashboardTheme,
} from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";
import DashboardMobileSheetFilterContent from "./DashboardMobileSheetFilterContent";
import DashboardMobilePlaceSheet from "./DashboardMobilePlaceSheet";

type Props = {
  lang: DashboardLang;
  mobilePanelState: DashboardMobilePanelState;
  sheetMode: DashboardMobileSheetMode;
  sheetDragging: boolean;
  sheetDragOffset: number;
  filteredCount: number;
  selectedPlace: FrontendPlace | null;
  clusterPlaces: FrontendPlace[] | null;
  watchlist: string[];
  measurementsOpen: boolean;
  historyOpen: boolean;
  measurementsLabel: string;
  historyLabel: string;
  historyPlaceholder: string;
  closeLabel: string;
  clearFiltersLabel: string;
  countyLabel: string;
  riskLabel: string;
  officialLabel: string;
  minProbLabel: string;
  latestSampleDateLabel: string;
  dateFromLabel: string;
  dateToLabel: string;
  resetDateLabel: string;
  latestSampleDateHint: string;
  nearRadiusLabel: string;
  clearNearMeLabel: string;
  themeLightLabel: string;
  themeDarkLabel: string;
  visibleCount: number;
  highCount: number;
  lowCount: number;
  violationsCount: number;
  riskOrder: string[];
  officialOrder: ReadonlyArray<"all" | "compliant" | "violation" | "unknown">;
  county: string;
  risk: string;
  official: DashboardOfficialFilter;
  minProb: number;
  minProbInput: number;
  sampleDateFrom: string;
  sampleDateTo: string;
  nearbyOnly: boolean;
  nearbyRadiusKm: number;
  userCoords: { lat: number; lon: number } | null;
  geoError: string | null;
  counties: Array<{ value: string; label: string }>;
  theme: DashboardTheme;
  placeKindLabel: (kind: string) => string;
  countyPretty: (value: string | null | undefined) => string;
  fmtDate: (value: string | null) => string;
  officialStatusText: (value: number | null) => string;
  explainViolation: (place: FrontendPlace) => string;
  openInfo: (title: string, text: string) => void;
  toggleWatch: (id: string) => void;
  labelForParam: (param: string) => string;
  descForParam: (param: string) => string;
  explainMeasurementNorm: (param: string, value: number | string, place: FrontendPlace) => string;
  explainHistoryMeasurements: (place: FrontendPlace, idx: number) => string;
  explainViolationFromHistory: (place: FrontendPlace, idx: number) => string;
  assessNorm: (param: string, value: number, domain: string) => { violated: boolean | null };
  onToggleMeasurements: () => void;
  onToggleHistory: () => void;
  onCyclePanelState: () => void;
  onSheetPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onSheetPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onSheetPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onSheetPointerCancel: () => void;
  onClearFilters: () => void;
  onCloseFilterMode: () => void;
  onClosePlaceMode: () => void;
  onSelectPoint: (id: string) => void;
  onSetCounty: (value: string) => void;
  onSetRisk: (value: string) => void;
  onSetOfficial: (value: DashboardOfficialFilter) => void;
  onSetMinProbInput: (value: number) => void;
  onSetSampleDateFrom: (value: string) => void;
  onSetSampleDateTo: (value: string) => void;
  onClearSampleDates: () => void;
  onSetNearbyRadiusKm: (value: number) => void;
  onClearNearMe: () => void;
  onSetTheme: (value: DashboardTheme) => void;
  onSetLang: (value: DashboardLang) => void;
  renderIcon: (name: string) => ReactNode;
};

export default function DashboardMobileBottomSheet({
  lang,
  mobilePanelState,
  sheetMode,
  sheetDragging,
  sheetDragOffset,
  filteredCount,
  selectedPlace,
  clusterPlaces,
  watchlist,
  measurementsOpen,
  historyOpen,
  measurementsLabel,
  historyLabel,
  historyPlaceholder,
  closeLabel,
  clearFiltersLabel,
  countyLabel,
  riskLabel,
  officialLabel,
  minProbLabel,
  latestSampleDateLabel,
  dateFromLabel,
  dateToLabel,
  resetDateLabel,
  latestSampleDateHint,
  nearRadiusLabel,
  clearNearMeLabel,
  themeLightLabel,
  themeDarkLabel,
  visibleCount,
  highCount,
  lowCount,
  violationsCount,
  riskOrder,
  officialOrder,
  county,
  risk,
  official,
  minProb,
  minProbInput,
  sampleDateFrom,
  sampleDateTo,
  nearbyOnly,
  nearbyRadiusKm,
  userCoords,
  geoError,
  counties,
  theme,
  placeKindLabel,
  countyPretty,
  fmtDate,
  officialStatusText,
  explainViolation,
  openInfo,
  toggleWatch,
  labelForParam,
  descForParam,
  explainMeasurementNorm,
  explainHistoryMeasurements,
  explainViolationFromHistory,
  assessNorm,
  onToggleMeasurements,
  onToggleHistory,
  onCyclePanelState,
  onSheetPointerDown,
  onSheetPointerMove,
  onSheetPointerUp,
  onSheetPointerCancel,
  onClearFilters,
  onCloseFilterMode,
  onClosePlaceMode,
  onSelectPoint,
  onSetCounty,
  onSetRisk,
  onSetOfficial,
  onSetMinProbInput,
  onSetSampleDateFrom,
  onSetSampleDateTo,
  onClearSampleDates,
  onSetNearbyRadiusKm,
  onClearNearMe,
  onSetTheme,
  onSetLang,
  renderIcon,
}: Props) {
  return (
    <section className={`mobileBottomSheet ${mobilePanelState} ${sheetDragging ? "dragging" : ""}`} style={{ "--sheet-drag-offset": `${sheetDragOffset}px` } as CSSProperties}>
      <button
        type="button"
        className="gmSheetHandle"
        onClick={onCyclePanelState}
        onPointerDown={onSheetPointerDown}
        onPointerMove={onSheetPointerMove}
        onPointerUp={onSheetPointerUp}
        onPointerCancel={onSheetPointerCancel}
        aria-label={lruet(lang, "Изменить высоту панели", "Muuda paneeli kõrgust", "Toggle panel height")}
      >
        <span className="gmSheetHandlePill" />
      </button>

      {mobilePanelState === "collapsed" ? (
        <div className="gmSheetPeek">
          <span className="gmSheetPeekCount">{filteredCount}</span>
          <span className="gmSheetPeekLabel">{lruet(lang, " мест на карте", " kohta kaardil", " places on map")}</span>
        </div>
      ) : sheetMode === "filter" ? (
        <div className="gmSheetModeHeader">
          <span className="gmSheetModeTitle">{lruet(lang, "Фильтры", "Filtrid", "Filters")}</span>
          <button className="gmSheetClearBtn" type="button" onClick={onClearFilters} aria-label={clearFiltersLabel} title={clearFiltersLabel}>
            {renderIcon("filter-x")}
          </button>
          <button className="gmSheetCloseBtn" type="button" onClick={onCloseFilterMode} aria-label={closeLabel}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="gmSheetModeHeader">
          <span className="gmSheetModeTitle">
            {selectedPlace
              ? selectedPlace.location
              : clusterPlaces
                ? lruet(lang, `${clusterPlaces.length} мест в этой точке`, `${clusterPlaces.length} kohta selles punktis`, `${clusterPlaces.length} places at this location`)
                : lruet(lang, "Выберите точку", "Vali koht", "Select a place")}
          </span>
          <button className="gmSheetCloseBtn" type="button" onClick={onClosePlaceMode} aria-label={closeLabel}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {mobilePanelState !== "collapsed" ? (
        <div className="gmSheetBody">
          {sheetMode === "filter" ? (
            <DashboardMobileSheetFilterContent
              lang={lang}
              nearRadiusLabel={nearRadiusLabel}
              clearNearMeLabel={clearNearMeLabel}
              countyLabel={countyLabel}
              riskLabel={riskLabel}
              officialLabel={officialLabel}
              minProbLabel={minProbLabel}
              latestSampleDateLabel={latestSampleDateLabel}
              dateFromLabel={dateFromLabel}
              dateToLabel={dateToLabel}
              resetDateLabel={resetDateLabel}
              latestSampleDateHint={latestSampleDateHint}
              themeLightLabel={themeLightLabel}
              themeDarkLabel={themeDarkLabel}
              visibleCount={visibleCount}
              highCount={highCount}
              lowCount={lowCount}
              violationsCount={violationsCount}
              riskOrder={riskOrder}
              officialOrder={officialOrder}
              county={county}
              risk={risk}
              official={official}
              minProb={minProb}
              minProbInput={minProbInput}
              sampleDateFrom={sampleDateFrom}
              sampleDateTo={sampleDateTo}
              nearbyOnly={nearbyOnly}
              nearbyRadiusKm={nearbyRadiusKm}
              userCoords={userCoords}
              geoError={geoError}
              counties={counties}
              theme={theme}
              onSetCounty={onSetCounty}
              onSetRisk={onSetRisk}
              onSetOfficial={onSetOfficial}
              onSetMinProbInput={onSetMinProbInput}
              onSetSampleDateFrom={onSetSampleDateFrom}
              onSetSampleDateTo={onSetSampleDateTo}
              onClearSampleDates={onClearSampleDates}
              onSetNearbyRadiusKm={onSetNearbyRadiusKm}
              onClearNearMe={onClearNearMe}
              onSetTheme={onSetTheme}
              onSetLang={onSetLang}
              renderIcon={renderIcon}
            />
          ) : (
            <DashboardMobilePlaceSheet
              lang={lang}
              t={{ measurements: measurementsLabel, history: historyLabel, historyPlaceholder }}
              selectedPlace={selectedPlace}
              clusterPlaces={clusterPlaces}
              watchlist={watchlist}
              measurementsOpen={measurementsOpen}
              historyOpen={historyOpen}
              onSelectPoint={onSelectPoint}
              onToggleMeasurements={onToggleMeasurements}
              onToggleHistory={onToggleHistory}
              placeKindLabel={placeKindLabel}
              countyPretty={countyPretty}
              fmtDate={fmtDate}
              officialStatusText={officialStatusText}
              explainViolation={explainViolation}
              openInfo={openInfo}
              toggleWatch={toggleWatch}
              labelForParam={labelForParam}
              descForParam={descForParam}
              explainMeasurementNorm={explainMeasurementNorm}
              explainHistoryMeasurements={explainHistoryMeasurements}
              explainViolationFromHistory={explainViolationFromHistory}
              assessNorm={assessNorm}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
