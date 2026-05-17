import type { DashboardLang } from "./dashboard-types";

export type MetricGuideEntry = {
  title: string;
  precise: string;
  intuitive: string;
  reading: string;
};

export type DashboardTranslationEntry = {
  filters: string;
  pin: string;
  unpin: string;
  openFilters: string;
  close: string;
  search: string;
  domain: string;
  locationType: string;
  county: string;
  risk: string;
  official: string;
  minProb: string;
  alertsOnly: string;
  nearMe: string;
  nearRadius: string;
  clearNearMe: string;
  geoDenied: string;
  geoUnsupported: string;
  latestSampleDate: string;
  dateFrom: string;
  dateTo: string;
  resetDate: string;
  latestSampleDateHint: string;
  clearFilters: string;
  mapTitle: string;
  selectedPoint: string;
  noSelectedPoint: string;
  measurements: string;
  history: string;
  historyPlaceholder: string;
  tabs: {
    alerts: string;
    domain: string;
    analytics: string;
    aboutModel: string;
    aboutService: string;
  };
  aboutModel: string;
  metricGuideTitle: string;
  metricGuide: {
    roc: MetricGuideEntry;
    pr: MetricGuideEntry;
    calibration: MetricGuideEntry;
    shap: MetricGuideEntry;
  };
};

export type DashboardTranslations = Record<DashboardLang, DashboardTranslationEntry>;
