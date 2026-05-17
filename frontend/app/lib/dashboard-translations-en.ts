import type { DashboardTranslationEntry } from "./dashboard-translation-types";

export const DASHBOARD_TRANSLATIONS_EN: DashboardTranslationEntry = {
  filters: "Filters",
  pin: "Pin",
  unpin: "Unpin",
  openFilters: "Open filters",
  close: "Close",
  search: "Search by place/county",
  domain: "Domain",
  locationType: "Location type",
  county: "County",
  risk: "Risk",
  official: "Official status",
  minProb: "Probability threshold",
  alertsOnly: "Alerts only",
  nearMe: "Near me",
  nearRadius: "Radius",
  clearNearMe: "Clear geolocation",
  geoDenied: "Geolocation access denied. Please allow location access in your browser.",
  geoUnsupported: "Geolocation is not supported in this browser.",
  latestSampleDate: "Latest sample date",
  dateFrom: "From",
  dateTo: "To",
  resetDate: "Reset",
  latestSampleDateHint: "If date range is active, points without latest sample date are hidden.",
  clearFilters: "Clear filters",
  mapTitle: "Interactive water quality map",
  selectedPoint: "Selected point",
  noSelectedPoint: "Click a marker or table row to see point details.",
  measurements: "Water measurements",
  history: "History",
  historyPlaceholder: "History for this point is not available in the current export.",
  tabs: {
    alerts: "Alerts",
    domain: "Domains",
    analytics: "Diagnostics",
    aboutModel: "About model",
    aboutService: "About service",
  },
  aboutModel:
    "ML models (LR, RF, GB, LightGBM) estimate violation probability from lab measurements. This is decision support, not medical advice.",
  metricGuideTitle: "How to read metrics: precise + intuitive",
  metricGuide: {
    roc: {
      title: "1) ROC-AUC — class separability",
      precise:
        "ROC curve compares TPR and FPR across all thresholds. AUC is area under the curve: probability that a random violation gets a higher risk than a random compliant sample.",
      intuitive:
        "If you take one bad and one good sample, ROC-AUC shows how often the model ranks the bad one higher.",
      reading:
        "Rule of thumb: 0.5 random, 0.7-0.8 fair, 0.8-0.9 good, >0.9 very good. High AUC alone does not set a decision threshold.",
    },
    pr: {
      title: "2) Precision / Recall — error trade-off",
      precise:
        "Recall = TP/(TP+FN), Precision = TP/(TP+FP). FN are missed violations, FP are false alarms.",
      intuitive:
        "Recall asks: how many dangerous cases were found? Precision asks: how many alerts were truly dangerous?",
      reading:
        "For water safety, high Recall is often preferred. High Recall + low Precision means more false alarms.",
    },
    calibration: {
      title: "3) Calibration — probability reliability",
      precise:
        "Calibration checks whether predicted probabilities match observed frequencies (reliability curve, Brier score).",
      intuitive:
        "A well-calibrated model means 80% predictions are truly near 80% in reality.",
      reading:
        "If calibration is weak, use probabilities mainly for prioritization/ranking rather than literal percentages.",
    },
    shap: {
      title: "4) SHAP — risk explanation",
      precise:
        "SHAP decomposes a single prediction into feature contributions around a baseline risk.",
      intuitive:
        "It shows which parameters pushed risk up or down for this sample.",
      reading:
        "Interpret as model behavior explanation, not as causal proof of contamination source.",
    },
  },
};
