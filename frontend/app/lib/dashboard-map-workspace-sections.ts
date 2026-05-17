"use client";

import { lruet } from "./dashboard-utils";
import {
  buildDashboardMapCanvasProps,
  buildDashboardSelectedPlaceWorkspaceProps,
  type DashboardMapCanvasProps,
  type DashboardSelectedPlaceWorkspaceProps,
} from "./dashboard-map-workspace-props";
import type { DashboardMapWorkspaceComponentProps } from "./dashboard-map-workspace-component-types";

const riskOrder: string[] = ["all", "low", "medium", "high", "unknown"];
const officialOrder: Array<"all" | "compliant" | "violation" | "unknown"> = [
  "all",
  "compliant",
  "violation",
  "unknown",
];

export function buildDashboardMapWorkspaceCanvasSectionProps(
  props: DashboardMapWorkspaceComponentProps,
): DashboardMapCanvasProps {
  const {
    desktopDetailRef,
    snapshot,
    county,
    countyPretty,
    clusterPlaces,
    watchlist,
    measurementsOpen,
    historyOpen,
    mobilePanelState,
    sheetMode,
    sheetDragging,
    sheetDragOffset,
    filteredCount,
    highCount,
    lowCount,
    violationsCount,
    counties,
    historyPlaceholder,
    selectedPointTitle,
    emptySelectedPointHint,
    measurementsLabel,
    historyLabel,
    closeLabel,
    countyLabel,
    riskLabelText,
    officialLabelText,
    minProbLabel,
    latestSampleDateLabel,
    dateFromLabel,
    dateToLabel,
    resetDateLabel,
    latestSampleDateHint,
    nearRadiusLabel,
    clearNearMeLabel,
    placeKindLabel,
    officialStatusText,
    explainViolation,
    explainMeasurementNorm,
    explainHistoryMeasurements,
    explainViolationFromHistory,
    labelForParam,
    descForParam,
    openInfo,
    onToggleWatch,
    onToggleMeasurements,
    onToggleHistory,
    onSetCounty,
    onSetRisk,
    onSetOfficial,
    onSetMinProbInput,
    onSetSampleDateFrom,
    onSetSampleDateTo,
    onSetNearbyRadiusKm,
    onSetTheme,
    onSetLang,
    onCyclePanelState,
    onSheetPointerDown,
    onSheetPointerMove,
    onSheetPointerUp,
    onSheetPointerCancel,
    onCloseFilterMode,
    onClosePlaceMode,
    onClearSampleDates,
    onClearNearMe,
    dataFetchedLabel,
    modelTrainedLabel,
    dataFreshnessLevel,
    modelFreshnessLevel,
    freshnessLabel,
    ...mapCanvasBaseProps
  } = props;
  void dataFetchedLabel;
  void modelTrainedLabel;
  void dataFreshnessLevel;
  void modelFreshnessLevel;
  void freshnessLabel;
  void desktopDetailRef;
  void clusterPlaces;
  void watchlist;
  void measurementsOpen;
  void historyOpen;
  void mobilePanelState;
  void sheetMode;
  void sheetDragging;
  void sheetDragOffset;
  void filteredCount;
  void highCount;
  void lowCount;
  void violationsCount;
  void counties;
  void historyPlaceholder;
  void selectedPointTitle;
  void emptySelectedPointHint;
  void measurementsLabel;
  void historyLabel;
  void closeLabel;
  void countyLabel;
  void riskLabelText;
  void officialLabelText;
  void minProbLabel;
  void latestSampleDateLabel;
  void dateFromLabel;
  void dateToLabel;
  void resetDateLabel;
  void latestSampleDateHint;
  void nearRadiusLabel;
  void clearNearMeLabel;
  void placeKindLabel;
  void officialStatusText;
  void explainViolation;
  void explainMeasurementNorm;
  void explainHistoryMeasurements;
  void explainViolationFromHistory;
  void labelForParam;
  void descForParam;
  void openInfo;
  void onToggleWatch;
  void onToggleMeasurements;
  void onToggleHistory;
  void onSetCounty;
  void onSetRisk;
  void onSetOfficial;
  void onSetMinProbInput;
  void onSetSampleDateFrom;
  void onSetSampleDateTo;
  void onSetNearbyRadiusKm;
  void onSetTheme;
  void onSetLang;
  void onCyclePanelState;
  void onSheetPointerDown;
  void onSheetPointerMove;
  void onSheetPointerUp;
  void onSheetPointerCancel;
  void onCloseFilterMode;
  void onClosePlaceMode;
  void onClearSampleDates;
  void onClearNearMe;

  return buildDashboardMapCanvasProps({
    ...mapCanvasBaseProps,
    snapshotPlaces: snapshot.places,
    selectedCounty: county !== "all" ? countyPretty(county) : undefined,
  });
}

export function buildDashboardMapWorkspaceSelectedPlaceSectionProps(
  props: DashboardMapWorkspaceComponentProps,
): DashboardSelectedPlaceWorkspaceProps {
  const {
    lang,
    snapshot,
    desktopDetailRef,
    selectedPlace,
    clusterPlaces,
    watchlist,
    measurementsOpen,
    historyOpen,
    historyPlaceholder,
    selectedPointTitle,
    emptySelectedPointHint,
    measurementsLabel,
    historyLabel,
    closeLabel,
    clearFiltersLabel,
    countyLabel,
    riskLabelText,
    officialLabelText,
    minProbLabel,
    latestSampleDateLabel,
    dateFromLabel,
    dateToLabel,
    resetDateLabel,
    latestSampleDateHint,
    nearRadiusLabel,
    clearNearMeLabel,
    filteredCount,
    dataFetchedLabel,
    modelTrainedLabel,
    dataFreshnessLevel,
    modelFreshnessLevel,
    freshnessLabel,
    highCount,
    lowCount,
    violationsCount,
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
    mobilePanelState,
    sheetMode,
    sheetDragging,
    sheetDragOffset,
    placeKindLabel,
    countyPretty,
    officialStatusText,
    explainViolation,
    explainMeasurementNorm,
    explainHistoryMeasurements,
    explainViolationFromHistory,
    labelForParam,
    descForParam,
    openInfo,
    onSelectPoint,
    onToggleWatch,
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
  } = props;

  return buildDashboardSelectedPlaceWorkspaceProps({
    desktopDetailRef,
    lang,
    snapshot,
    selectedPlace,
    clusterPlaces,
    watchlist,
    measurementsOpen,
    historyOpen,
    historyPlaceholder,
    selectedPointTitle,
    emptySelectedPointHint,
    measurementsLabel,
    historyLabel,
    closeLabel,
    clearFiltersLabel,
    countyLabel,
    riskLabelText,
    officialLabelText,
    minProbLabel,
    latestSampleDateLabel,
    dateFromLabel,
    dateToLabel,
    resetDateLabel,
    latestSampleDateHint,
    nearRadiusLabel,
    clearNearMeLabel,
    themeLightLabel: lruet(lang, "Светлая", "Hele", "Light"),
    themeDarkLabel: lruet(lang, "Тёмная", "Tume", "Dark"),
    filteredCount,
    dataFetchedLabel,
    modelTrainedLabel,
    dataFreshnessLevel,
    modelFreshnessLevel,
    freshnessLabel,
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
    mobilePanelState,
    sheetMode,
    sheetDragging,
    sheetDragOffset,
    placeKindLabel,
    countyPretty,
    officialStatusText,
    explainViolation,
    explainMeasurementNorm,
    explainHistoryMeasurements,
    explainViolationFromHistory,
    labelForParam,
    descForParam,
    openInfo,
    onSelectPoint,
    onToggleWatch,
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
  });
}
