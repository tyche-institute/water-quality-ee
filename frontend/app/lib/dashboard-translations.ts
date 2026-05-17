import { DASHBOARD_TRANSLATIONS_EN } from "./dashboard-translations-en";
import { DASHBOARD_TRANSLATIONS_ET } from "./dashboard-translations-et";
import { DASHBOARD_TRANSLATIONS_RU } from "./dashboard-translations-ru";
import type { DashboardTranslations } from "./dashboard-translation-types";

export type { DashboardTranslationEntry, DashboardTranslations, MetricGuideEntry } from "./dashboard-translation-types";

export const DASHBOARD_TRANSLATIONS: DashboardTranslations = {
  ru: DASHBOARD_TRANSLATIONS_RU,
  et: DASHBOARD_TRANSLATIONS_ET,
  en: DASHBOARD_TRANSLATIONS_EN,
};
