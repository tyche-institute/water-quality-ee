"use client";

import type { DashboardLang } from "./dashboard-types";
import { lruet } from "./dashboard-utils";
import type { FrontendPlace } from "./types";

export function buildPlaceUncertaintyNotice(
  lang: DashboardLang,
  place: FrontendPlace,
): { level: "warn" | "bad"; summary: string; detail: string } | null {
  const measured = place.n_measured_norm_params ?? 0;
  const total = place.n_total_norm_params ?? 0;
  const coverageText = total > 0 ? `${measured}/${total}` : "n/a";
  const flags = new Set(place.data_quality_flags ?? []);

  if (place.audit_bucket === "hidden_violation") {
    return {
      level: "bad",
      summary: lruet(
        lang,
        "Официальное нарушение не объясняется опубликованными параметрами этой пробы.",
        "Ametlik rikkumine ei ole selle proovi avaldatud näitajatest taastoodetav.",
        "The official violation is not reproducible from this sample's published parameters.",
      ),
      detail: lruet(
        lang,
        `Покрытие проверяемых норм: ${coverageText}. Решение могло зависеть от периодических, не опубликованных или контекстных данных.`,
        `Kontrollitavate normide kaetus: ${coverageText}. Otsus võis sõltuda perioodilistest, avaldamata või kontekstipõhistest andmetest.`,
        `Checked-norm coverage: ${coverageText}. The decision may depend on periodic, non-published, or contextual inputs.`,
      ),
    };
  }

  if (place.audit_bucket === "hidden_pass") {
    return {
      level: "warn",
      summary: lruet(
        lang,
        "Опубликованные показатели выглядят строже официального статуса.",
        "Avaldatud näitajad näivad ametlikust staatusest rangemad.",
        "The published measurements look stricter than the official label.",
      ),
      detail: lruet(
        lang,
        `Покрытие проверяемых норм: ${coverageText}. Такое расхождение может отражать агрегированные или доменно-специфичные правила, а не прямую ошибку данных.`,
        `Kontrollitavate normide kaetus: ${coverageText}. Selline lahknevus võib peegeldada agregeeritud või domeenispetsiifilisi reegleid, mitte otsest andmeviga.`,
        `Checked-norm coverage: ${coverageText}. This mismatch can reflect aggregation or domain-specific rules rather than a direct data error.`,
      ),
    };
  }

  if (flags.has("sparse_published_parameter_coverage")) {
    return {
      level: "warn",
      summary: lruet(
        lang,
        "Для этой пробы опубликована только часть проверяемых параметров.",
        "Selle proovi jaoks on avaldatud ainult osa kontrollitavatest näitajatest.",
        "Only part of the checkable parameters is published for this sample.",
      ),
      detail: lruet(
        lang,
        `Покрытие проверяемых норм: ${coverageText}. Интерпретируйте ML-риск как decision support, а не как полную картину.`,
        `Kontrollitavate normide kaetus: ${coverageText}. Tõlgenda ML-riski otsustustoe, mitte täieliku pildina.`,
        `Checked-norm coverage: ${coverageText}. Treat ML risk as decision support, not as the full picture.`,
      ),
    };
  }

  return null;
}
