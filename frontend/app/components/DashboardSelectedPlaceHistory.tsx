"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";

type Props = {
  lang: DashboardLang;
  place: FrontendPlace;
  isOpen: boolean;
  onToggle: () => void;
  fmtDate: (value: string | null) => string;
  openInfo: (title: string, body: string) => void;
  officialStatusText: (value: number | null) => string;
  explainHistoryMeasurements: (place: FrontendPlace, idx: number) => string;
  explainViolationFromHistory: (place: FrontendPlace, idx: number) => string;
  historyPlaceholder: string;
};

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6.7 9.3 5.3 5.3 5.3-5.3 1.4 1.4-6.7 6.7-6.7-6.7 1.4-1.4Z" fill="currentColor" />
    </svg>
  );
}

export default function DashboardSelectedPlaceHistory({
  lang,
  place,
  isOpen,
  onToggle,
  fmtDate,
  openInfo,
  officialStatusText,
  explainHistoryMeasurements,
  explainViolationFromHistory,
  historyPlaceholder,
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
          <h4>{lruet(lang, "История", "Ajalugu", "History")}</h4>
        </button>
      </div>
      {isOpen ? (
        place.sample_history?.length ? (
          <div className="tableWrap compact">
            <table className="table">
              <thead>
                <tr>
                  <th>{lruet(lang, "Дата", "Kuupaev", "Date")}</th>
                  <th>{lruet(lang, "Статус", "Staatus", "Status")}</th>
                </tr>
              </thead>
              <tbody>
                {place.sample_history.slice(0, 12).map((item, idx) => (
                  <tr
                    key={`hist-${idx}`}
                    onClick={() =>
                      openInfo(
                        lruet(
                          lang,
                          `История: ${fmtDate(item.sample_date)}`,
                          `Ajalugu: ${fmtDate(item.sample_date)}`,
                          `History: ${fmtDate(item.sample_date)}`,
                        ),
                        explainHistoryMeasurements(place, idx),
                      )
                    }
                  >
                    <td>{fmtDate(item.sample_date)}</td>
                    <td>
                      {item.official_compliant === 1 ? (
                        <span className="badge good">{officialStatusText(1)}</span>
                      ) : item.official_compliant === 0 ? (
                        <button
                          className="linkBtn badge bad clickableBadge"
                          onClick={(event) => {
                            event.stopPropagation();
                            openInfo(
                              lruet(
                                lang,
                                "Официальное нарушение (история)",
                                "Ametlik rikkumine (ajalugu)",
                                "Official violation (history)",
                              ),
                              explainViolationFromHistory(place, idx),
                            );
                          }}
                        >
                          {officialStatusText(0)}
                        </button>
                      ) : (
                        <span className="badge warn">n/a</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="hint">{historyPlaceholder}</p>
        )
      ) : null}
    </div>
  );
}
