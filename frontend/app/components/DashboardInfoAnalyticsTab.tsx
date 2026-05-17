"use client";

import { describeRefreshDelta, formatRefreshHistoryTimestamp } from "../lib/dashboard-refresh-history";
import type { DashboardFreshnessLevel, DashboardLang, DashboardSeverityLevel } from "../lib/dashboard-types";
import { formatLocalizedCount, lruet } from "../lib/dashboard-utils";
import { freshnessBadgeTone, worstFreshnessLevel } from "../lib/freshness-policy";
import { VERIFY_PATH } from "../lib/site-metadata";
import type { FrontendSnapshot } from "../lib/types";

type QuickInsight = {
  key: string;
  label: string;
  value: string;
  level: DashboardSeverityLevel;
  hint: string;
};

type Props = {
  lang: DashboardLang;
  tabTitle: string;
  quickInsights: QuickInsight[];
  snapshot: FrontendSnapshot;
  dataFetchedLabel: string | null;
  modelTrainedLabel: string | null;
  dataFreshnessLevel: DashboardFreshnessLevel;
  modelFreshnessLevel: DashboardFreshnessLevel;
  freshnessLabel: (level: DashboardFreshnessLevel) => string;
  severityLabel: (level: DashboardSeverityLevel) => string;
};

export default function DashboardInfoAnalyticsTab({
  lang,
  tabTitle,
  quickInsights,
  snapshot,
  dataFetchedLabel,
  modelTrainedLabel,
  dataFreshnessLevel,
  modelFreshnessLevel,
  freshnessLabel,
  severityLabel,
}: Props) {
  const uncertaintySummary = snapshot.diagnostics.uncertainty_summary;
  const uncertaintyCounts = uncertaintySummary?.uncertainty_level_counts;
  const publicationGapCount = Number(uncertaintySummary?.places_with_publication_gap || 0);
  const mediumCount = Number(uncertaintyCounts?.medium || 0);
  const highCount = Number(uncertaintyCounts?.high || 0);
  const refreshHistory = snapshot.refresh_history || [];
  const freshnessState = worstFreshnessLevel(dataFreshnessLevel, modelFreshnessLevel);

  return (
    <div>
      <h4>{tabTitle}</h4>
      <div className="freshnessDiag" data-freshness-state={freshnessState}>
        <div className="freshnessDiagRow">
          <span className="freshnessDiagLabel">{lruet(lang, "Данные обновлены", "Andmed uuendatud", "Data updated")}</span>
          <span className="freshnessDiagValue">
            {dataFetchedLabel ?? "—"}{" "}
            <span className={`badge ${freshnessBadgeTone(dataFreshnessLevel)}`}>
              {freshnessLabel(dataFreshnessLevel)}
            </span>
          </span>
        </div>
        {modelTrainedLabel ? (
          <div className="freshnessDiagRow">
            <span className="freshnessDiagLabel">{lruet(lang, "Модель обучена", "Mudel treenitud", "Model trained")}</span>
            <span className="freshnessDiagValue">
              {modelTrainedLabel}{" "}
              <span className={`badge ${freshnessBadgeTone(modelFreshnessLevel)}`}>
                {freshnessLabel(modelFreshnessLevel)}
              </span>
            </span>
          </div>
        ) : null}
        <div className="freshnessDiagRow">
          <span className="freshnessDiagLabel">{lruet(lang, "Расписание", "Ajakava", "Schedule")}</span>
          <span className="freshnessDiagValue">{lruet(lang, "еженедельно (пн)", "iganädalane (E)", "weekly (Mon)")}</span>
        </div>
        <div className="freshnessDiagRow">
          <span className="freshnessDiagLabel">{lruet(lang, "Проверка и источник", "Kontroll ja allikas", "Verification and source")}</span>
          <span className="freshnessDiagValue">
            <a className="freshnessDiagVerifyLink" href={VERIFY_PATH}>
              {lruet(lang, "Открыть /verify", "Ava /verify", "Open /verify")}
            </a>
          </span>
        </div>
      </div>
      {uncertaintySummary ? (
        <div className="uncertaintyDiag">
          <div className="uncertaintyDiagHeader">
            <strong>{lruet(lang, "Неопределённость публикации", "Avaldamise ebakindlus", "Publication uncertainty")}</strong>
            <span className={`badge ${publicationGapCount > 0 ? "warn" : "good"}`}>
              {publicationGapCount > 0 ? lruet(lang, "нужна осторожность", "vajab ettevaatust", "use caution") : lruet(lang, "нормально", "korras", "normal")}
            </span>
          </div>
          <p className="hint uncertaintyDiagHint">
            {lruet(
              lang,
              "Этот слой показывает, где открытых параметров недостаточно для уверенной интерпретации ML-оценки или официального решения.",
              "See kiht näitab, kus avaandmete näitajatest ei piisa ML-hinnangu või ametliku otsuse kindlaks tõlgendamiseks.",
              "This layer shows where the open data is insufficient for confident interpretation of the ML score or the official decision.",
            )}
          </p>
          <div className="uncertaintyDiagGrid">
            <div className="uncertaintyDiagStat">
              <span className="uncertaintyDiagLabel">{lruet(lang, "Скрытые нарушения", "Peidetud rikkumised", "Hidden violations")}</span>
              <span className="uncertaintyDiagValue">{publicationGapCount}</span>
            </div>
            <div className="uncertaintyDiagStat">
              <span className="uncertaintyDiagLabel">{lruet(lang, "Средняя неопределённость", "Keskmine ebakindlus", "Medium uncertainty")}</span>
              <span className="uncertaintyDiagValue">{mediumCount}</span>
            </div>
            <div className="uncertaintyDiagStat">
              <span className="uncertaintyDiagLabel">{lruet(lang, "Высокая неопределённость", "Kõrge ebakindlus", "High uncertainty")}</span>
              <span className="uncertaintyDiagValue">{highCount}</span>
            </div>
          </div>
        </div>
      ) : null}
      {refreshHistory.length ? (
        <div className="uncertaintyDiag refreshHistoryDiag">
          <div className="uncertaintyDiagHeader">
            <strong>{lruet(lang, "История обновлений", "Uuenduste ajalugu", "Refresh history")}</strong>
            <span className="badge good">
              {formatLocalizedCount(lang, refreshHistory.length, {
                ru: ["запись", "записи", "записей"],
                et: ["kirje", "kirjet"],
                en: ["entry", "entries"],
              })}
            </span>
          </div>
          <p className="hint uncertaintyDiagHint">
            {lruet(
              lang,
              "Небольшой журнал последних refresh-ов: когда обновлялись данные и что изменилось относительно предыдущего snapshot.",
              "Viimaste uuenduste lühike ajalugu: millal andmed värskendusid ja mis eelmise snapshot'iga võrreldes muutus.",
              "A short log of recent refreshes: when data changed and what shifted relative to the previous snapshot.",
            )}
          </p>
          <div className="refreshHistoryList">
            {refreshHistory.slice(0, 6).map((entry, index) => {
              const deltaText = describeRefreshDelta(lang, entry);
              return (
                <div className="refreshHistoryItem" key={`${entry.generated_at ?? "unknown"}-${index}`}>
                  <div className="refreshHistoryHead">
                    <strong>{formatRefreshHistoryTimestamp(entry.generated_at) ?? "—"}</strong>
                    <span className="refreshHistoryMeta">
                      {entry.git_sha ? `#${entry.git_sha.slice(0, 7)}` : ""}
                      {entry.model_version ? ` · ${entry.model_version}` : ""}
                    </span>
                  </div>
                  <div className="refreshHistoryStats">
                    <span>{lruet(lang, "Точек", "Punkte", "Places")}: {entry.places_count}</span>
                    <span>
                      {lruet(lang, "Скрытые нарушения", "Peidetud rikkumised", "Hidden violations")}:{" "}
                      {formatLocalizedCount(lang, Number(entry.publication_gap_count || 0), {
                        ru: ["нарушение", "нарушения", "нарушений"],
                        et: ["rikkumine", "rikkumist"],
                        en: ["violation", "violations"],
                      })}
                    </span>
                    <span>{lruet(lang, "Нарушения", "Rikkumised", "Violations")}: {entry.official_violation_share === null ? "n/a" : `${(entry.official_violation_share * 100).toFixed(1)}%`}</span>
                  </div>
                  {deltaText ? <div className="refreshHistoryDelta">{deltaText}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="stats">
        {quickInsights.map((i) => (
          <div className="stat" key={`ip-qi-${i.key}`}>
            <div className="k">{i.label}</div>
            <div className="v">
              {i.value} <span className={`badge ${i.level}`}>{severityLabel(i.level)}</span>
            </div>
            <div className="hint">{i.hint}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "0.75rem" }}>
        <p className="hint">
          {lruet(
            lang,
            "Модели (LR, RF, GB, LightGBM) оценивают P(нарушение) по лабораторным данным. Это не прогноз будущего.",
            "Mudelid (LR, RF, GB, LightGBM) hindavad P(rikkumine) laborinäitajate põhjal.",
            "Models (LR, RF, GB, LightGBM) estimate P(violation) from lab data.",
          )}
        </p>
        <div className="tableWrap compact mobileResponsiveTable" style={{ marginTop: "0.5rem" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Model</th>
                <th>{lruet(lang, "Средняя P", "Keskmine P", "Average P")}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(snapshot.diagnostics.mean_model_probabilities || {}).map(([key, val]) => (
                <tr key={`ip-diag-${key}`}>
                  <td>{snapshot.model_labels?.[key] || key}</td>
                  <td>{typeof val === "number" ? val.toFixed(2) : "n/a"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
