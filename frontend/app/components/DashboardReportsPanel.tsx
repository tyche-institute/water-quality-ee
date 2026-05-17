"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { riskLabelForLang } from "../lib/dashboard-labels";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";

type Props = {
  lang: DashboardLang;
  isMobile: boolean;
  topAlerts: FrontendPlace[];
  domainStats: Array<[string, { total: number; violations: number; highRisk: number }]>;
  onSelectPoint: (id: string) => void;
};

export default function DashboardReportsPanel({ lang, isMobile, topAlerts, domainStats, onSelectPoint }: Props) {
  return (
    <div className="reportsGrid">
      <div className="panel reportPanel">
        <h4>{lruet(lang, "Центр алертов", "Häirekeskus", "Alert center")}</h4>
        <p className="hint">
          {lruet(
            lang,
            "Список приоритетных точек: сначала официальные нарушения и высокий ML-риск.",
            "Prioriteetsed punktid: eespool ametlikud rikkumised ja kõrge ML-risk.",
            "Priority places first: official violations and high ML risk."
          )}
        </p>
        {topAlerts.length === 0 ? (
          <p className="hint">{lruet(lang, "Нет активных алертов в текущем фильтре.", "Praeguse filtri vaates aktiivseid häireid pole.", "No active alerts in current filter scope.")}</p>
        ) : (
          <ul className="alertList">
            {topAlerts.map((place) => (
              <li key={`alert-${place.id}`}>
                <div className="alertItemBody">
                  <button className="linkBtn alertItemTitle" onClick={() => onSelectPoint(place.id)}>
                    {place.location}
                  </button>
                  <span className="alertItemMeta">
                    {place.official_compliant === 0
                      ? lruet(lang, "Официальное нарушение", "Ametlik rikkumine", "Official violation")
                      : `${lruet(lang, "ML-риск", "ML-risk", "ML risk")}: ${riskLabelForLang(lang, place.risk_level)}`}
                  </span>
                </div>
                <span className={`badge ${place.risk_level === "high" ? "bad" : "warn"}`}>
                  {place.model_violation_prob !== null ? `P ${place.model_violation_prob.toFixed(2)}` : riskLabelForLang(lang, place.risk_level)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="panel reportPanel">
        <h4>{lruet(lang, "Отчёт здоровья доменов", "Domeenide tervisearuanne", "Domain health report")}</h4>
        <div className={`tableWrap compact ${isMobile ? "mobileResponsiveTable" : ""}`}>
          <table className="table">
            <thead>
              <tr>
                <th>{lruet(lang, "Домен", "Domeen", "Domain")}</th>
                <th>{lruet(lang, "Всего", "Kokku", "Total")}</th>
                <th>{lruet(lang, "Наруш.", "Rikkum.", "Viol.")}</th>
                <th>{lruet(lang, "Высок.", "Kõrge", "High")}</th>
              </tr>
            </thead>
            <tbody>
              {domainStats.map(([domain, stats]) => (
                <tr key={`domain-${domain}`}>
                  <td>{domain}</td>
                  <td>{stats.total}</td>
                  <td>{stats.violations}</td>
                  <td>{stats.highRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
