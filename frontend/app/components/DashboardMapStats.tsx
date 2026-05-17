"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";

type Props = {
  lang: DashboardLang;
  visibleCount: number;
  highRiskCount: number;
  violationsCount: number;
  healthIndex: number;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export default function DashboardMapStats({
  lang,
  visibleCount,
  highRiskCount,
  violationsCount,
  healthIndex,
  sidebarCollapsed,
  onToggleSidebar,
}: Props) {
  return (
    <div className="mapStatsRow desktopOnly">
      <button
        type="button"
        className="dashboardSidebarToggleStats"
        onClick={onToggleSidebar}
        aria-pressed={sidebarCollapsed}
        aria-label={sidebarCollapsed
          ? lruet(lang, "Развернуть фильтры", "Ava filtrid", "Expand filters")
          : lruet(lang, "Свернуть фильтры", "Sulge filtrid", "Collapse filters")}
        title={sidebarCollapsed
          ? lruet(lang, "Развернуть фильтры", "Ava filtrid", "Expand filters")
          : lruet(lang, "Свернуть фильтры", "Sulge filtrid", "Collapse filters")}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </button>
      <div className="mapStat">
        <span className="mapStatK">{lruet(lang, "Видимых", "Nähtav", "Visible")}</span>
        <span className="mapStatV">{visibleCount}</span>
      </div>
      <div className="mapStat mapStatBad">
        <span className="mapStatK">{lruet(lang, "Высокий риск", "Kõrge risk", "High risk")}</span>
        <span className="mapStatV">{highRiskCount}</span>
      </div>
      <div className="mapStat">
        <span className="mapStatK">{lruet(lang, "Нарушения", "Rikkumised", "Violations")}</span>
        <span className="mapStatV mapStatBadText">{violationsCount}</span>
      </div>
      <div className={`mapStat ${healthIndex >= 75 ? "mapStatGood" : healthIndex >= 50 ? "mapStatWarn" : "mapStatBad"}`}>
        <span className="mapStatK">{lruet(lang, "Здоровье", "Tervis", "Health")}</span>
        <span className="mapStatV">{healthIndex}/100</span>
      </div>
    </div>
  );
}
