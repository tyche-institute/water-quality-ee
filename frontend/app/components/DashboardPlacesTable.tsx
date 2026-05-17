"use client";

import type { ReactNode } from "react";
import type { DashboardLang } from "../lib/dashboard-types";
import { riskLabelForLang } from "../lib/dashboard-labels";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";

type Props = {
  lang: DashboardLang;
  isMobile: boolean;
  filteredCount: number;
  rows: FrontendPlace[];
  selectedId: string | null;
  watchlist: string[];
  placesTableSort: { key: "date" | "location" | "county" | "prob"; dir: "asc" | "desc" };
  onCycleSort: (key: "date" | "location" | "county" | "prob") => void;
  onSelectPoint: (id: string) => void;
  onToggleWatch: (id: string) => void;
  openInfo: (title: string, text: string) => void;
  explainViolation: (place: FrontendPlace) => string;
  officialStatusText: (value: number | null) => string;
  countyPretty: (value: string | null | undefined) => string;
  fmtDate: (value: string | null) => string;
  renderIcon: (name: string) => ReactNode;
};

export default function DashboardPlacesTable({
  lang,
  isMobile,
  filteredCount,
  rows,
  selectedId,
  watchlist,
  placesTableSort,
  onCycleSort,
  onSelectPoint,
  onToggleWatch,
  openInfo,
  explainViolation,
  officialStatusText,
  countyPretty,
  fmtDate,
  renderIcon,
}: Props) {
  const visibleRows = Math.min(rows.length, 250);

  return (
    <>
      <div className="placesTableIntro">
        <p className="hint placesTableIntroText">
          {lruet(
            lang,
            "Точки, которые проходят текущие фильтры. Нажмите строку для деталей, заголовок столбца — для сортировки.",
            "Punktid, mis vastavad praegustele filtritele. Detailideks vajuta rida, sortimiseks veerupealkirja.",
            "Places matching the current filters. Click a row for details and a column header to sort."
          )}
        </p>
        <span className="placesTableCountBadge">
          {lruet(lang, `Показано ${visibleRows} из ${filteredCount}`, `Näidatud ${visibleRows} / ${filteredCount}`, `Showing ${visibleRows} of ${filteredCount}`)}
        </span>
      </div>
      <div className={`tableWrap ${isMobile ? "mobileResponsiveTable" : ""}`}>
        <table className="table placesTable">
          <thead>
            <tr>
              <th scope="col">
                <button type="button" className="tableSortBtn" onClick={() => onCycleSort("location")} aria-pressed={placesTableSort.key === "location"}>
                  {lruet(lang, "Локация", "Asukoht", "Location")}
                  {placesTableSort.key === "location" ? (placesTableSort.dir === "asc" ? " · ↑" : " · ↓") : ""}
                </button>
              </th>
              <th scope="col">
                <button type="button" className="tableSortBtn" onClick={() => onCycleSort("county")} aria-pressed={placesTableSort.key === "county"}>
                  {lruet(lang, "Уезд", "Maakond", "County")}
                  {placesTableSort.key === "county" ? (placesTableSort.dir === "asc" ? " · ↑" : " · ↓") : ""}
                </button>
              </th>
              <th className="iconCol">
                <span className="iconTooltip" data-tip={lruet(lang, "Домен / тип воды", "Domeen / vee tüüp", "Domain / water type")} title={lruet(lang, "Домен / тип воды", "Domeen / vee tüüp", "Domain / water type")}>
                  <span className="cellIcon" style={{ color: "var(--brand)" }}>{renderIcon("drop")}</span>
                </span>
              </th>
              <th className="iconCol">
                <button
                  className="linkBtn iconTooltip"
                  style={{ padding: 0 }}
                  data-tip={lruet(lang, "Официальный статус", "Ametlik staatus", "Official status")}
                  title={lruet(lang, "Официальный статус", "Ametlik staatus", "Official status")}
                  aria-label={lruet(lang, "Официальный статус", "Ametlik staatus", "Official status")}
                  onClick={() => openInfo(
                    lruet(lang, "Официальный статус", "Ametlik staatus", "Official status"),
                    lruet(lang, "Зелёный — соответствует нормам, красный — есть официальное нарушение.", "Roheline — vastab normile, punane — ametlik rikkumine.", "Green = compliant, red = official violation.")
                  )}
                >
                  <span className="cellIcon">{renderIcon("check-circle")}</span>
                </button>
              </th>
              <th className="iconCol">
                <button
                  className="linkBtn iconTooltip"
                  style={{ padding: 0 }}
                  data-tip={lruet(lang, "Риск модели (ML)", "Mudeli risk (ML)", "Model risk (ML)")}
                  title={lruet(lang, "Риск модели (ML)", "Mudeli risk (ML)", "Model risk (ML)")}
                  aria-label={lruet(lang, "Риск модели (ML)", "Mudeli risk (ML)", "Model risk (ML)")}
                  onClick={() => openInfo(
                    lruet(lang, "Риск модели", "Mudeli risk", "Model risk"),
                    lruet(lang, "Low/Medium/High — интерпретация вероятности нарушения по ML-модели.", "Low/Medium/High — rikkumise tõenäosuse ML-tõlgendus.", "Low/Medium/High — interpretation of model-estimated violation probability.")
                  )}
                >
                  <span className="cellIcon">{renderIcon("signal")}</span>
                </button>
              </th>
              <th className="iconCol pvColHead" scope="col">
                <button type="button" className="tableSortBtn tableSortBtnPv" onClick={() => onCycleSort("prob")} aria-pressed={placesTableSort.key === "prob"} title={lruet(lang, "P(нарушения) — вероятность по ML", "P(rikkumine) — ML tõenäosus", "P(violation) — ML probability")}>
                  <small style={{ fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.01em" }}>P(v)</small>
                  {placesTableSort.key === "prob" ? (placesTableSort.dir === "asc" ? " ↑" : " ↓") : ""}
                </button>
              </th>
              <th className="dateCol iconCol" scope="col">
                <button type="button" className="tableSortBtn tableSortBtnDate" onClick={() => onCycleSort("date")} aria-pressed={placesTableSort.key === "date"} title={lruet(lang, "Дата последней пробы", "Viimase proovi kuupäev", "Latest sample date")} aria-label={lruet(lang, "Дата последней пробы", "Viimase proovi kuupäev", "Latest sample date")}>
                  <span className="iconTooltip" data-tip={lruet(lang, "Дата последней пробы", "Viimase proovi kuupäev", "Latest sample date")}>
                    <span className="cellIcon" style={{ color: "var(--brand)" }}>{renderIcon("calendar")}</span>
                  </span>
                  {placesTableSort.key === "date" ? <span className="tableSortArrow" aria-hidden="true">{placesTableSort.dir === "asc" ? " ·↑" : " ·↓"}</span> : null}
                </button>
              </th>
              <th className="iconCol">
                <span className="iconTooltip" data-tip={lruet(lang, "Отслеживание (избранное)", "Jälgimine (lemmikud)", "Watchlist (favorites)")} title={lruet(lang, "Отслеживание (избранное)", "Jälgimine (lemmikud)", "Watchlist (favorites)")}>
                  <span className="cellIcon" style={{ color: "#f59e0b" }}>{renderIcon("star")}</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 250).map((place) => {
              const domainIcon =
                place.domain === "supluskoha" ? "swim"
                : place.domain === "basseinid" ? "pool"
                : place.domain === "veevark" ? "tap"
                : "drop";
              const domainTip =
                place.domain === "supluskoha"
                  ? lruet(lang, "Купание (supluskoha)", "Supluskoht", "Swimming beach")
                  : place.domain === "basseinid"
                    ? lruet(lang, "Бассейн / СПА (basseinid)", "Bassein / SPA", "Pool / SPA")
                    : place.domain === "veevark"
                      ? lruet(lang, "Водопровод (veevärk)", "Ühisveevärk", "Water network")
                      : lruet(lang, "Питьевой источник (joogivesi)", "Joogivee allikas", "Drinking water source");
              const riskColor =
                place.risk_level === "high" ? "var(--bad)"
                : place.risk_level === "medium" ? "var(--warn)"
                : place.risk_level === "low" ? "var(--good)"
                : "var(--muted)";
              const riskTip = `${riskLabelForLang(lang, place.risk_level)}${place.model_violation_prob !== null ? ` · P=${place.model_violation_prob.toFixed(2)}` : ""}`;
              const watching = watchlist.includes(place.id);
              const watchLabel = watching
                ? lruet(lang, "Убрать из избранного", "Eemalda jälgimisest", "Unwatch")
                : lruet(lang, "Добавить в избранное", "Lisa jälgimisse", "Watch");

              return (
                <tr key={place.id} onClick={() => onSelectPoint(place.id)} className={selectedId === place.id ? "rowSelected" : ""}>
                  <td>{place.location}</td>
                  <td>{countyPretty(place.county || "Unknown")}</td>
                  <td className="iconCol">
                    <span className="iconTooltip" data-tip={domainTip} title={domainTip} style={{ color: "var(--brand)" }}>
                      <span className="cellIcon">{renderIcon(domainIcon)}</span>
                    </span>
                  </td>
                  <td className="iconCol">
                    {place.official_compliant === 0 ? (
                      <button
                        className="starBtn iconTooltip"
                        data-tip={lruet(lang, "Нарушение — нажмите для подробностей", "Rikkumine — klõpsake üksikasjade jaoks", "Violation — click for details")}
                        title={lruet(lang, "Нарушение — нажмите для подробностей", "Rikkumine — klõpsake üksikasjade jaoks", "Violation — click for details")}
                        aria-label={lruet(lang, "Нарушение — нажмите для подробностей", "Rikkumine — klõpsake üksikasjade jaoks", "Violation — click for details")}
                        style={{ color: "var(--bad)" }}
                        onClick={(event) => {
                          event.stopPropagation();
                          openInfo(lruet(lang, "Официальное нарушение", "Ametlik rikkumine", "Official violation"), explainViolation(place));
                        }}
                      >
                        <span className="cellIcon">{renderIcon("x-circle")}</span>
                      </button>
                    ) : place.official_compliant === 1 ? (
                      <span className="iconTooltip" data-tip={officialStatusText(1)} title={officialStatusText(1)} style={{ color: "var(--good)" }}>
                        <span className="cellIcon">{renderIcon("check-circle")}</span>
                      </span>
                    ) : (
                      <span className="iconTooltip" data-tip={officialStatusText(null)} title={officialStatusText(null)} style={{ color: "var(--muted)" }}>
                        <span className="cellIcon">{renderIcon("dash-circle")}</span>
                      </span>
                    )}
                  </td>
                  <td className="iconCol">
                    <span className="iconTooltip" data-tip={riskTip} title={riskTip} style={{ color: riskColor }}>
                      <span className="cellIcon">{renderIcon("signal")}</span>
                    </span>
                  </td>
                  <td className="iconCol placesTableProbCell" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {place.model_violation_prob !== null ? place.model_violation_prob.toFixed(2) : "—"}
                  </td>
                  <td className="dateCol placesTableDateCell">{fmtDate(place.sample_date)}</td>
                  <td className="iconCol">
                    <button
                      className="starBtn iconTooltip"
                      data-tip={watchLabel}
                      title={watchLabel}
                      aria-label={watchLabel}
                      style={{ color: watching ? "#f59e0b" : "var(--muted)" }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleWatch(place.id);
                      }}
                    >
                      <span className="cellIcon">{renderIcon(watching ? "star" : "star-outline")}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
