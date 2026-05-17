"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { riskLabelForLang } from "../lib/dashboard-labels";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";

type Props = {
  lang: DashboardLang;
  watchlistPlaces: FrontendPlace[];
  onSelectPoint: (id: string) => void;
};

export default function DashboardWatchlist({ lang, watchlistPlaces, onSelectPoint }: Props) {
  return (
    <div className="panel reportPanel">
      <h4>{lruet(lang, "Избранные точки", "Jälgimisnimekiri", "Your watchlist")}</h4>
      {watchlistPlaces.length === 0 ? (
        <p className="hint">
          {lruet(
            lang,
            "Сохраняйте ключевые пляжи, бассейны/SPA и питьевые точки для быстрого мониторинга.",
            "Salvesta olulised supluskohad, basseinid/SPA ja joogiveepunktid kiireks jälgimiseks.",
            "Save key beaches, pools/SPA and drinking-water points for quick monitoring.",
          )}
        </p>
      ) : (
        <ul className="alertList watchlistList">
          {watchlistPlaces.slice(0, 8).map((p) => (
            <li key={`watch-${p.id}`}>
              <div className="alertItemBody">
                <button className="linkBtn watchlistLocationBtn" type="button" onClick={() => onSelectPoint(p.id)}>
                  {p.location}
                </button>
                <span className="alertItemMeta">
                  {lruet(lang, "Риск", "Risk", "Risk")}: {riskLabelForLang(lang, p.risk_level)}
                </span>
              </div>
              <span
                className={`badge watchlistProbBadge ${p.risk_level === "high" ? "bad" : p.risk_level === "medium" ? "warn" : "good"}`}
              >
                {p.model_violation_prob !== null ? `P ${p.model_violation_prob.toFixed(2)}` : riskLabelForLang(lang, p.risk_level)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
