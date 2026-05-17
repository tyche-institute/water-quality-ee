"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { riskLabelForLang } from "../lib/dashboard-labels";
import { buildPlaceUncertaintyNotice } from "../lib/dashboard-uncertainty";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";

type Props = {
  lang: DashboardLang;
  t: {
    measurements: string;
    history: string;
    historyPlaceholder: string;
  };
  selectedPlace: FrontendPlace | null;
  clusterPlaces: FrontendPlace[] | null;
  watchlist: string[];
  measurementsOpen: boolean;
  historyOpen: boolean;
  onSelectPoint: (id: string) => void;
  onToggleMeasurements: () => void;
  onToggleHistory: () => void;
  placeKindLabel: (kind: string) => string;
  countyPretty: (value: string | null | undefined) => string;
  fmtDate: (value: string | null) => string;
  officialStatusText: (value: number | null) => string;
  explainViolation: (place: FrontendPlace) => string;
  openInfo: (title: string, body: string) => void;
  toggleWatch: (id: string) => void;
  labelForParam: (param: string) => string;
  descForParam: (param: string) => string;
  explainMeasurementNorm: (param: string, value: number, place: FrontendPlace) => string;
  explainHistoryMeasurements: (place: FrontendPlace, idx: number) => string;
  explainViolationFromHistory: (place: FrontendPlace, idx: number) => string;
  assessNorm: (param: string, value: number, domain: string) => { violated: boolean | null };
};

function mobilePlaceEmoji(kind: string): string {
  if (kind === "swimming") return "🏖";
  if (kind === "pool_spa") return "🏊";
  if (kind === "drinking_water") return "🚰";
  return "💧";
}

export default function DashboardMobilePlaceSheet({
  lang,
  t,
  selectedPlace,
  clusterPlaces,
  watchlist,
  measurementsOpen,
  historyOpen,
  onSelectPoint,
  onToggleMeasurements,
  onToggleHistory,
  placeKindLabel,
  countyPretty,
  fmtDate,
  officialStatusText,
  explainViolation,
  openInfo,
  toggleWatch,
  labelForParam,
  descForParam,
  explainMeasurementNorm,
  explainHistoryMeasurements,
  explainViolationFromHistory,
  assessNorm,
}: Props) {
  if (!selectedPlace && clusterPlaces) {
    return (
      <div className="gmSheetPlaceContent">
        <div className="gmClusterList">
          {clusterPlaces.map((place) => (
            <button key={place.id} type="button" className="gmClusterItem" onClick={() => onSelectPoint(place.id)}>
              <span className="gmClusterItemEmoji" aria-hidden="true">{mobilePlaceEmoji(place.place_kind)}</span>
              <span className="gmClusterItemBody">
                <span className="gmClusterItemName">{place.location}</span>
                <span className="gmClusterItemMeta">
                  {placeKindLabel(place.place_kind)}
                  {place.county ? ` · ${countyPretty(place.county)}` : ""}
                </span>
              </span>
              <span className="gmClusterItemBadges">
                {place.official_compliant === 0 ? <span className="badge bad" style={{ fontSize: "0.7rem" }}>✗</span> : null}
                {place.official_compliant === 1 ? <span className="badge good" style={{ fontSize: "0.7rem" }}>✓</span> : null}
                {place.risk_level === "high" ? <span className="badge bad" style={{ fontSize: "0.7rem" }}>▲</span> : null}
                {place.risk_level === "medium" ? <span className="badge warn" style={{ fontSize: "0.7rem" }}>▲</span> : null}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedPlace) {
    return (
      <div className="gmSheetPlaceContent">
        <p className="hint" style={{ textAlign: "center", paddingTop: "1.2rem" }}>
          {lruet(lang, "Нажмите на метку на карте", "Vajuta kaardil märgile", "Tap a marker on the map")}
        </p>
      </div>
    );
  }

  const isWatching = watchlist.includes(selectedPlace.id);
  const uncertaintyNotice = buildPlaceUncertaintyNotice(lang, selectedPlace);

  return (
    <div className="gmSheetPlaceContent">
      <div className="gmPlaceKindRow">
        <span className="gmPlaceKindEmoji" aria-hidden="true">{mobilePlaceEmoji(selectedPlace.place_kind)}</span>
        <span className="gmPlaceKindLabel">{placeKindLabel(selectedPlace.place_kind)}</span>
        {selectedPlace.county ? <span className="gmPlaceCounty">· {countyPretty(selectedPlace.county)}</span> : null}
      </div>

      <p className="hint gmPlaceMeta" data-trust-order="sample-date">
        {lruet(lang, "Последняя проба", "Viimane proov", "Latest sample")}: <b>{fmtDate(selectedPlace.sample_date)}</b>
      </p>

      <div className="gmStatusStack">
        <div className="gmStatusCard" data-trust-order="official-status">
          <span className="gmStatusEyebrow">{lruet(lang, "Официальный статус", "Ametlik staatus", "Official status")}</span>
          <div className="gmStatusValue">
            {selectedPlace.official_compliant === 0 ? (
              <button
                className="badge bad linkBtn clickableBadge"
                onClick={() => openInfo(lruet(lang, "Официальное нарушение", "Ametlik rikkumine", "Official violation"), explainViolation(selectedPlace))}
              >
                ✗ {officialStatusText(0)}
              </button>
            ) : (
              <span className={`badge ${selectedPlace.official_compliant === 1 ? "good" : "warn"}`}>
                {selectedPlace.official_compliant === 1 ? "✓ " : ""}{officialStatusText(selectedPlace.official_compliant)}
              </span>
            )}
          </div>
        </div>
      </div>

      {uncertaintyNotice ? (
        <div className={`gmTrustNotice ${uncertaintyNotice.level === "bad" ? "gmTrustNoticeBad" : "gmTrustNoticeWarn"}`}>
          <strong>{uncertaintyNotice.summary}</strong>
          <br />
          {uncertaintyNotice.detail}
        </div>
      ) : null}

      <div className="gmWatchlistRow">
        <button type="button" className={`gmWatchlistBtn ${isWatching ? "gmWatchlistBtnOn" : ""}`} onClick={() => toggleWatch(selectedPlace.id)} aria-pressed={isWatching}>
          <span className="cellIcon" style={{ color: isWatching ? "#f59e0b" : "var(--muted)" }}>
            {isWatching ? "★" : "☆"}
          </span>
          {isWatching
            ? lruet(lang, "В избранном", "Jälgin", "On watchlist")
            : lruet(lang, "В избранное", "Lisa jälgimisse", "Add to watchlist")}
        </button>
      </div>

      <button
        className="gmStatusCard gmStatusCardModel gmModelSummary"
        data-trust-order="model-context"
        type="button"
        onClick={() => openInfo(
          lruet(lang, "Оценка модели", "Mudeli hinnang", "Model assessment"),
          [
            `${lruet(lang, "Уровень риска", "Riskitase", "Risk level")}: ${riskLabelForLang(lang, selectedPlace.risk_level)}`,
            `P(violation): ${selectedPlace.model_violation_prob !== null ? selectedPlace.model_violation_prob.toFixed(2) : "n/a"}`,
            `LR/RF/GB/LGBM: ${[selectedPlace.lr_violation_prob, selectedPlace.rf_violation_prob, selectedPlace.gb_violation_prob, selectedPlace.lgbm_violation_prob].map((v) => (typeof v === "number" ? v.toFixed(2) : "n/a")).join(" / ")}`,
          ].join("\n"),
        )}
      >
        <span className="gmStatusEyebrow">{lruet(lang, "Оценка модели", "Mudeli hinnang", "Model assessment")}</span>
        <span className="gmStatusValue gmStatusValueModel">
          <span className={`gmStatusProb ${selectedPlace.risk_level === "high" ? "bad" : selectedPlace.risk_level === "medium" ? "warn" : selectedPlace.risk_level === "low" ? "good" : ""}`}>
            {selectedPlace.model_violation_prob !== null ? selectedPlace.model_violation_prob.toFixed(2) : "n/a"}
          </span>
          <span className="gmStatusRiskText">{riskLabelForLang(lang, selectedPlace.risk_level)}</span>
        </span>
      </button>

      {Object.keys(selectedPlace.measurements || {}).length ? (
        <>
          <button type="button" className="gmSectionToggle" aria-expanded={measurementsOpen} onClick={onToggleMeasurements}>
            <span className="gmSectionToggleTitle">{t.measurements}</span>
            <span className="gmSectionToggleMeta">
              {Object.keys(selectedPlace.measurements || {}).length}
              {" · "}
              {measurementsOpen
                ? lruet(lang, "скрыть", "peida", "hide")
                : lruet(lang, "показать", "kuva", "show")}
            </span>
          </button>
          {measurementsOpen ? (
            <>
              <p className="hint gmMeasurementsHint">
                {lruet(lang, "По алфавиту. Нажмите ячейку — справка или норма.", "Tähestikuliselt. Klõpsa — info või norm.", "A–Z. Tap a cell for info or norm.")}
              </p>
              <div className="tableWrap compact">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{lruet(lang, "Показатель", "Näitaja", "Parameter")}</th>
                      <th>{lruet(lang, "Значение", "Väärtus", "Value")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedPlace.measurements || {}).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => {
                      const { violated } = assessNorm(key, Number(value), selectedPlace.domain);
                      return (
                        <tr key={`ms-${key}`} className={violated === true ? "rowViolated" : ""}>
                          <td>
                            <button className="linkBtn" onClick={() => openInfo(labelForParam(key), descForParam(key))}>
                              {labelForParam(key)}
                            </button>
                          </td>
                          <td>
                            <button
                              className={`linkBtn${violated === true ? " valueViolated" : ""}`}
                              onClick={() => openInfo(`${labelForParam(key)}: ${lruet(lang, "норматив", "norm", "norm")}`, explainMeasurementNorm(key, value, selectedPlace))}
                            >
                              {String(value)}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {selectedPlace.sample_history?.length ? (
        <>
          <button type="button" className="gmSectionToggle" aria-expanded={historyOpen} onClick={onToggleHistory}>
            <span className="gmSectionToggleTitle">{t.history}</span>
            <span className="gmSectionToggleMeta">
              {selectedPlace.sample_history.length}
              {" · "}
              {historyOpen
                ? lruet(lang, "скрыть", "peida", "hide")
                : lruet(lang, "показать", "kuva", "show")}
            </span>
          </button>
          {historyOpen ? (
            <div className="tableWrap compact">
              <table className="table">
                <thead>
                  <tr>
                    <th>{lruet(lang, "Дата", "Kuupäev", "Date")}</th>
                    <th>{lruet(lang, "Статус", "Staatus", "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlace.sample_history.slice(0, 12).map((item, idx) => (
                    <tr key={`mh-${idx}`} style={{ cursor: "pointer" }} onClick={() => openInfo(lruet(lang, `История: ${fmtDate(item.sample_date)}`, `Ajalugu: ${fmtDate(item.sample_date)}`, `History: ${fmtDate(item.sample_date)}`), explainHistoryMeasurements(selectedPlace, idx))}>
                      <td>{fmtDate(item.sample_date)}</td>
                      <td>
                        {item.official_compliant === 0 ? (
                          <button className="linkBtn badge bad clickableBadge" onClick={(event) => { event.stopPropagation(); openInfo(lruet(lang, "Официальное нарушение (история)", "Ametlik rikkumine (ajalugu)", "Official violation (history)"), explainViolationFromHistory(selectedPlace, idx)); }}>
                            {officialStatusText(0)}
                          </button>
                        ) : (
                          <span className={`badge ${item.official_compliant === 1 ? "good" : "warn"}`}>
                            {officialStatusText(item.official_compliant)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      ) : (
        <p className="hint" style={{ fontSize: "0.82rem", marginTop: "0.6rem" }}>{t.historyPlaceholder}</p>
      )}
    </div>
  );
}
