"use client";

import DashboardSidebarIcon from "./DashboardSidebarIcon";
import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";

type Props = {
  lang: DashboardLang;
  countyLabel: string;
  segment: string;
  county: string;
  placeKinds: string[];
  counties: Array<{ value: string; label: string }>;
  onSetSegment: (value: string) => void;
  onSetCounty: (value: string) => void;
  placeKindLabel: (kind: string) => string;
};

export default function DashboardSidebarWhereGroup({
  lang,
  countyLabel,
  segment,
  county,
  placeKinds,
  counties,
  onSetSegment,
  onSetCounty,
  placeKindLabel,
}: Props) {
  return (
    <div className="filterGroup">
      <div className="filterGroupHead">
        <span className="filterGroupIcon" aria-hidden="true"><DashboardSidebarIcon name="globe" /></span>
        <span>{lruet(lang, "Где", "Kus", "Where")}</span>
      </div>
      <div className="field">
        <label htmlFor="segment-select">
          <span className="fieldIcon" aria-hidden="true"><DashboardSidebarIcon name="grid" /></span>
          {lruet(lang, "Тип точки", "Punkti tuup", "Point type")}
        </label>
        <div className="selectWrap">
          <select id="segment-select" value={segment} onChange={(e) => onSetSegment(e.target.value)} aria-label="Filter by source category">
            <option value="all">{lruet(lang, "Все типы", "Koik tuubid", "All types")}</option>
            {placeKinds.map((kind) => (
              <option key={`k-${kind}`} value={kind}>
                {placeKindLabel(kind)}
              </option>
            ))}
          </select>
          <span className="selectChevron" aria-hidden="true"><DashboardSidebarIcon name="chevron-down" /></span>
        </div>
      </div>
      <div className="field">
        <label htmlFor="county-select">
          <span className="fieldIcon" aria-hidden="true"><DashboardSidebarIcon name="globe" /></span>
          {countyLabel}
        </label>
        <div className="selectWrap">
          <select id="county-select" value={county} onChange={(e) => onSetCounty(e.target.value)} aria-label="Filter by county">
            <option value="all">{lruet(lang, "Все уезды", "Koik maakonnad", "All counties")}</option>
            {counties.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <span className="selectChevron" aria-hidden="true"><DashboardSidebarIcon name="chevron-down" /></span>
        </div>
      </div>
    </div>
  );
}
