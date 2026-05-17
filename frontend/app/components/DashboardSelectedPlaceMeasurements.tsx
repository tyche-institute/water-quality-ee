"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";

type Props = {
  lang: DashboardLang;
  place: FrontendPlace;
  isOpen: boolean;
  onToggle: () => void;
  openInfo: (title: string, body: string) => void;
  labelForParam: (param: string) => string;
  descForParam: (param: string) => string;
  explainMeasurementNorm: (param: string, value: number, place: FrontendPlace) => string;
};

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6.7 9.3 5.3 5.3 5.3-5.3 1.4 1.4-6.7 6.7-6.7-6.7 1.4-1.4Z" fill="currentColor" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 3.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm1.2 10.6h-2.4v-1.7h.6v-3.2h-.6v-1.7h1.8c.33 0 .6.27.6.6v4.3h.6v1.7Z" fill="currentColor" />
    </svg>
  );
}

export default function DashboardSelectedPlaceMeasurements({
  lang,
  place,
  isOpen,
  onToggle,
  openInfo,
  labelForParam,
  descForParam,
  explainMeasurementNorm,
}: Props) {
  return (
    <div className={`panel reportPanel reportPanelCollapsible ${isOpen ? "" : "reportPanelClosed"}`}>
      <div className="reportPanelHeader">
        <button
          type="button"
          className="reportPanelToggle"
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          <span className={`reportPanelChevron ${isOpen ? "open" : ""}`} aria-hidden="true">
            <ChevronIcon />
          </span>
          <h4>{lruet(lang, "Показатели", "Naitajad", "Measurements")}</h4>
        </button>
        <button
          type="button"
          className="reportPanelInfoBtn"
          onClick={() =>
            openInfo(
              lruet(lang, "Показатели", "Naitajad", "Measurements"),
              lruet(
                lang,
                "Показатели из последней пробы, по алфавиту (внутренние имена полей). Нажмите на название или значение — появится справка или сравнение с нормой.",
                "Viimase proovi naitajad tahestikuliselt (valjanimetus). Klopsa nimele voi vaartusele — kuvatakse kirjeldus voi normi vordlus.",
                "Latest-sample parameters sorted A–Z (field names). Tap name or value for a description or norm comparison.",
              ),
            )
          }
          aria-label={lruet(lang, "Справка о показателях", "Naitajate kirjeldus", "About the parameters")}
          title={lruet(lang, "Справка о показателях", "Naitajate kirjeldus", "About the parameters")}
        >
          <InfoIcon />
        </button>
      </div>
      {isOpen ? (
        Object.keys(place.measurements || {}).length === 0 ? (
          <p className="hint">n/a</p>
        ) : (
          <div className="tableWrap compact">
            <table className="table">
              <thead>
                <tr>
                  <th>{lruet(lang, "Показатель", "Naitaja", "Parameter")}</th>
                  <th>{lruet(lang, "Значение", "Vaartus", "Value")}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(place.measurements || {})
                  .sort(([ka], [kb]) => ka.localeCompare(kb))
                  .slice(0, 25)
                  .map(([key, value]) => (
                    <tr key={`m-${key}`}>
                      <td>
                        <button
                          className="linkBtn"
                          onClick={() => openInfo(labelForParam(key), descForParam(key))}
                        >
                          {labelForParam(key)}
                        </button>
                      </td>
                      <td>
                        <button
                          className="linkBtn"
                          onClick={() =>
                            openInfo(
                              `${labelForParam(key)}: ${lruet(lang, "норматив", "norm", "norm")}`,
                              explainMeasurementNorm(key, value, place),
                            )
                          }
                        >
                          {String(value)}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
