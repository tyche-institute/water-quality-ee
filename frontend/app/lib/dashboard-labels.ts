import type { DashboardLang } from "./dashboard-types";
import { lruet } from "./dashboard-utils";

export function severityLabelForLang(lang: DashboardLang, level: "good" | "warn" | "bad"): string {
  return lruet(
    lang,
    level === "good" ? "ok" : level === "warn" ? "внимание" : "критично",
    level === "good" ? "ok" : level === "warn" ? "hoiatus" : "kriitiline",
    level === "good" ? "ok" : level === "warn" ? "warning" : "critical"
  );
}

export function officialStatusTextForLang(lang: DashboardLang, value: number | null): string {
  if (value === 1) return lruet(lang, "соответствует", "vastab", "compliant");
  if (value === 0) return lruet(lang, "нарушение", "rikkumine", "violation");
  return lruet(lang, "неизвестно", "teadmata", "unknown");
}

export function placeKindLabelForLang(lang: DashboardLang, kind: string): string {
  const key = (kind || "other").toLowerCase();
  if (lang === "ru") {
    if (key === "swimming") return "Купальные воды";
    if (key === "pool_spa") return "Бассейн / SPA";
    if (key === "drinking_water") return "Питьевая вода (сеть)";
    if (key === "drinking_source") return "Источник питьевой воды";
    return "Другое";
  }
  if (lang === "et") {
    if (key === "swimming") return "Suplusvesi";
    if (key === "pool_spa") return "Bassein / SPA";
    if (key === "drinking_water") return "Joogivesi (võrk)";
    if (key === "drinking_source") return "Joogivee allikas";
    return "Muu";
  }
  if (key === "swimming") return "Open water";
  if (key === "pool_spa") return "Pool / SPA";
  if (key === "drinking_water") return "Drinking water (network)";
  if (key === "drinking_source") return "Drinking water source";
  return "Other";
}

export function riskLabelForLang(lang: DashboardLang, risk: string): string {
  if (risk === "all") return lruet(lang, "Все", "Kõik", "All");
  if (risk === "low") return lruet(lang, "Низкий", "Madal", "Low");
  if (risk === "medium") return lruet(lang, "Средний", "Keskmine", "Medium");
  if (risk === "high") return lruet(lang, "Высокий", "Kõrge", "High");
  return lruet(lang, "Неизвестно", "Teadmata", "Unknown");
}

export function officialLabelForLang(lang: DashboardLang, value: string): string {
  if (value === "all") return lruet(lang, "Все", "Kõik", "All");
  if (value === "compliant") return lruet(lang, "Соответствует", "Vastab", "Compliant");
  if (value === "violation") return lruet(lang, "Нарушение", "Ei vasta", "Violation");
  return lruet(lang, "Неизвестно", "Teadmata", "Unknown");
}
