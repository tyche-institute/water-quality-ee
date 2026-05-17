"use client";

import DashboardSidebarIcon from "./DashboardSidebarIcon";
import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";
import type { DashboardSidebarCopy } from "./dashboard-filter-sidebar-types";

type Props = {
  lang: DashboardLang;
  t: DashboardSidebarCopy;
  sampleDateFrom: string;
  sampleDateTo: string;
  onSetSampleDateFrom: (value: string) => void;
  onSetSampleDateTo: (value: string) => void;
};

export default function DashboardSidebarDateGroup({
  lang,
  t,
  sampleDateFrom,
  sampleDateTo,
  onSetSampleDateFrom,
  onSetSampleDateTo,
}: Props) {
  return (
    <div className="filterGroup">
      <div className="filterGroupHead">
        <span className="filterGroupIcon" aria-hidden="true"><DashboardSidebarIcon name="calendar" /></span>
        <span>{lruet(lang, "Дата пробы", "Proovi kuupaev", "Sample date")}</span>
      </div>
      <div className="field">
        <label>{t.latestSampleDate}</label>
        <div className="dateRangeRow">
          <div className="dateRangeField">
            <span className="dateRangeLabel">
              <span className="dateRangeLabelIcon" aria-hidden="true"><DashboardSidebarIcon name="calendar" /></span>
              {t.dateFrom}
            </span>
            <div className="dateRangeInputWrap">
              <span className="dateRangeIcon" aria-hidden="true">
                <DashboardSidebarIcon name="calendar" />
              </span>
              <input type="date" value={sampleDateFrom} onChange={(e) => onSetSampleDateFrom(e.target.value)} aria-label={t.dateFrom} title={t.dateFrom} />
            </div>
          </div>
          <span className="dateRangeSep" aria-hidden="true">-</span>
          <div className="dateRangeField">
            <span className="dateRangeLabel">
              <span className="dateRangeLabelIcon" aria-hidden="true"><DashboardSidebarIcon name="calendar" /></span>
              {t.dateTo}
            </span>
            <div className="dateRangeInputWrap">
              <span className="dateRangeIcon" aria-hidden="true">
                <DashboardSidebarIcon name="calendar" />
              </span>
              <input type="date" value={sampleDateTo} onChange={(e) => onSetSampleDateTo(e.target.value)} aria-label={t.dateTo} title={t.dateTo} />
            </div>
          </div>
          {sampleDateFrom || sampleDateTo ? (
            <button className="btn dateRangeClearBtn" type="button" onClick={() => { onSetSampleDateFrom(""); onSetSampleDateTo(""); }} title={t.resetDate} aria-label={t.resetDate}>
              <span aria-hidden="true"><DashboardSidebarIcon name="close" /></span>
            </button>
          ) : null}
        </div>
        <p className="hint">{t.latestSampleDateHint}</p>
      </div>
    </div>
  );
}
