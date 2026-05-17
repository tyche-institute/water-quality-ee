"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";

type Props = {
  lang: DashboardLang;
  clusterPlaces: FrontendPlace[];
  onSelectPoint: (id: string) => void;
};

function placeKindEmoji(kind: string): string {
  if (kind === "swimming") return "🏖";
  if (kind === "pool_spa") return "🏊";
  if (kind === "drinking_water") return "🚰";
  return "💧";
}

export default function DashboardClusterPicker({ lang, clusterPlaces, onSelectPoint }: Props) {
  return (
    <div className="clusterPickList">
      <p className="hint" style={{ marginBottom: "0.5rem" }}>
        {lruet(
          lang,
          `${clusterPlaces.length} мест в этой точке — выберите:`,
          `${clusterPlaces.length} kohta selles punktis — vali:`,
          `${clusterPlaces.length} places at this location — pick one:`,
        )}
      </p>
      {clusterPlaces.map((cp) => (
        <button
          key={cp.id}
          type="button"
          className="btn clusterPickBtn"
          onClick={() => onSelectPoint(cp.id)}
        >
          <span>{placeKindEmoji(cp.place_kind)}</span>
          <span style={{ flex: 1, textAlign: "left" }}>{cp.location}</span>
          {cp.model_violation_prob !== null ? (
            <span className={`badge ${cp.risk_level === "high" ? "bad" : cp.risk_level === "medium" ? "warn" : "good"}`}>
              {cp.model_violation_prob.toFixed(2)}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
