import type { DashboardFreshnessLevel, DashboardLang } from "./dashboard-types";
import freshnessPolicy from "./freshness-policy.json";

export const DASHBOARD_FRESHNESS_POLICY = {
  agingDays: freshnessPolicy.dashboard.agingFromDays,
  staleDays: freshnessPolicy.dashboard.staleFromDays,
} as const;

export const RELEASE_FRESHNESS_POLICY = freshnessPolicy;

const FRESHNESS_SEVERITY: Record<DashboardFreshnessLevel, number> = {
  fresh: 0,
  unknown: 1,
  aging: 2,
  stale: 3,
};

export function freshnessBadgeTone(level: DashboardFreshnessLevel): "good" | "warn" | "bad" {
  if (level === "stale") return "bad";
  if (level === "aging" || level === "unknown") return "warn";
  return "good";
}

export function worstFreshnessLevel(...levels: DashboardFreshnessLevel[]): DashboardFreshnessLevel {
  return levels.reduce((worst, level) => {
    return FRESHNESS_SEVERITY[level] > FRESHNESS_SEVERITY[worst] ? level : worst;
  }, "fresh" as DashboardFreshnessLevel);
}

export function buildFreshnessNotice(
  lang: DashboardLang,
  dataLevel: DashboardFreshnessLevel,
  modelLevel: DashboardFreshnessLevel,
): string | null {
  if (dataLevel === "stale" || modelLevel === "stale") {
    return lang === "ru"
      ? "Свежесть деградировала: ориентируйтесь в первую очередь на официальный статус и дату пробы."
      : lang === "et"
        ? "Värskus on halvenenud: lähtuge eelkõige ametlikust staatusest ja proovi kuupäevast."
        : "Freshness has degraded: rely on the official status and sample date first.";
  }

  if (dataLevel === "aging" || modelLevel === "aging") {
    return lang === "ru"
      ? "Данные начинают стареть: используйте модель осторожно и проверяйте дату обновления."
      : lang === "et"
        ? "Andmed hakkavad vananema: kasutage mudelit ettevaatlikult ja kontrollige uuenduse kuupäeva."
        : "Data is starting to age: use the model cautiously and check the update date.";
  }

  return null;
}
