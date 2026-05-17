"use client";

import { useMemo } from "react";
import type { DashboardLang } from "./dashboard-types";
import { lruet } from "./dashboard-utils";
import type { FrontendPlace, FrontendSnapshot } from "./types";

type QuickInsight = {
  key: string;
  label: string;
  value: string;
  level: "good" | "warn" | "bad";
  hint: string;
};

type DomainStat = [string, { total: number; violations: number; highRisk: number }];

export function useDashboardAnalytics(
  filtered: FrontendPlace[],
  diagnostics: FrontendSnapshot["diagnostics"],
  lang: DashboardLang,
) {
  return useMemo(() => {
    const low = filtered.filter((x) => x.risk_level === "low").length;
    const high = filtered.filter((x) => x.risk_level === "high").length;
    const violations = filtered.filter((x) => x.official_compliant === 0).length;

    const probabilityValues = filtered
      .map((x) => x.model_violation_prob)
      .filter((v): v is number => v !== null);
    const avgProb =
      probabilityValues.length > 0
        ? probabilityValues.reduce((a, b) => a + b, 0) / probabilityValues.length
        : null;

    const healthIndex = (() => {
      if (!filtered.length) return 0;
      const officialPassShare =
        filtered.filter((x) => x.official_compliant === 1).length / filtered.length;
      const modelSafety = avgProb === null ? 0.5 : 1 - avgProb;
      return Math.round((officialPassShare * 0.6 + modelSafety * 0.4) * 100);
    })();

    const domainCounts: Record<string, { total: number; violations: number; highRisk: number }> = {};
    filtered.forEach((p) => {
      const key = p.domain;
      if (!domainCounts[key]) domainCounts[key] = { total: 0, violations: 0, highRisk: 0 };
      domainCounts[key].total += 1;
      if (p.official_compliant === 0) domainCounts[key].violations += 1;
      if (p.risk_level === "high") domainCounts[key].highRisk += 1;
    });
    const domainStats: DomainStat[] = Object.entries(domainCounts).sort(
      (a, b) => b[1].total - a[1].total,
    );

    const topAlerts = filtered
      .filter((p) => p.official_compliant === 0 || p.risk_level === "high")
      .sort((a, b) => {
        const ap = a.model_violation_prob ?? (a.risk_level === "high" ? 1 : 0);
        const bp = b.model_violation_prob ?? (b.risk_level === "high" ? 1 : 0);
        return bp - ap;
      })
      .slice(0, 8);

    const uncertaintySummary = diagnostics.uncertainty_summary;
    const uncertaintyCounts = uncertaintySummary?.uncertainty_level_counts || {};
    const publicationGapCount = Number(uncertaintySummary?.places_with_publication_gap || 0);
    const highUncertaintyCount = Number(uncertaintyCounts.high || 0);
    const lowUncertaintyCount = Number(uncertaintyCounts.low || 0);
    const lowUncertaintyShare =
      filtered.length > 0 ? lowUncertaintyCount / filtered.length : null;

    const quickInsights: QuickInsight[] = [
      {
        key: "coverage",
        label: lruet(lang, "Покрытие модели", "Mudeli katvus", "Model coverage"),
        value: `${(diagnostics.model_coverage_share * 100).toFixed(1)}%`,
        level:
          diagnostics.model_coverage_share >= 0.9
            ? "good"
            : diagnostics.model_coverage_share >= 0.6
              ? "warn"
              : "bad",
        hint:
          lruet(lang, "Доля точек, где есть прогноз ML.", "Punktide osakaal, kus ML-prognoos on olemas.", "Share of places that currently have an ML score."),
      },
      {
        key: "official_violation",
        label: lruet(lang, "Офиц. нарушения", "Ametlikud rikkumised", "Official violations"),
        value:
          diagnostics.official_violation_share === null
            ? "n/a"
            : `${(diagnostics.official_violation_share * 100).toFixed(1)}%`,
        level:
          diagnostics.official_violation_share === null
            ? "warn"
            : diagnostics.official_violation_share <= 0.08
              ? "good"
              : diagnostics.official_violation_share <= 0.15
                ? "warn"
                : "bad",
        hint:
          lruet(lang, "Доля точек с официально зафиксированным нарушением.", "Ametliku rikkumisega punktide osakaal.", "Share of places with an official violation."),
      },
      {
        key: "avg_model_risk",
        label: lruet(lang, "Средний риск модели", "Keskmine mudelirisk", "Average model risk"),
        value: avgProb === null ? "n/a" : avgProb.toFixed(2),
        level:
          avgProb === null ? "warn" : avgProb < 0.35 ? "good" : avgProb < 0.6 ? "warn" : "bad",
        hint:
          lruet(lang, "Средняя P(нарушения) по текущему фильтру.", "Keskmine P(rikkumine) aktiivse filtri all.", "Average P(violation) under the current filter."),
      },
      {
        key: "publication_gap",
        label: lruet(lang, "Скрытые нарушения", "Peidetud rikkumised", "Hidden violations"),
        value: `${publicationGapCount}`,
        level:
          publicationGapCount === 0
            ? "good"
            : publicationGapCount <= 25
              ? "warn"
              : "bad",
        hint: lruet(
          lang,
          "Точки, где официальное нарушение не воспроизводится по опубликованным параметрам.",
          "Punktid, kus ametlik rikkumine ei ole avaldatud näitajatest taastoodetav.",
          "Places where the official violation is not reproducible from the published parameters.",
        ),
      },
      {
        key: "low_uncertainty",
        label: lruet(lang, "Низкая неопределённость", "Madal ebakindlus", "Low uncertainty"),
        value: lowUncertaintyShare === null ? "n/a" : `${(lowUncertaintyShare * 100).toFixed(1)}%`,
        level:
          lowUncertaintyShare === null
            ? "warn"
            : lowUncertaintyShare >= 0.75
              ? "good"
              : lowUncertaintyShare >= 0.5
                ? "warn"
                : "bad",
        hint: lruet(
          lang,
          "Доля точек, где опубликованных данных достаточно для нормальной интерпретации ML-слоя.",
          "Punktide osakaal, kus avaldatud andmeid piisab ML-kihi tavaliseks tõlgendamiseks.",
          "Share of places where the published data is sufficient for normal ML interpretation.",
        ),
      },
    ];

    return {
      low,
      high,
      violations,
      avgProb,
      healthIndex,
      domainStats,
      topAlerts,
      quickInsights,
      highUncertaintyCount,
    };
  }, [diagnostics.model_coverage_share, diagnostics.official_violation_share, diagnostics.uncertainty_summary, filtered, lang]);
}
