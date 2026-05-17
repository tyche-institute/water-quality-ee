"use client";

import type { CSSProperties } from "react";
import DashboardSidebarIcon from "./DashboardSidebarIcon";
import type { DashboardLang, DashboardOfficialFilter } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";

type Props = {
  lang: DashboardLang;
  riskLabelText: string;
  officialLabelText: string;
  minProbLabel: string;
  risk: string;
  official: DashboardOfficialFilter;
  minProb: number;
  minProbInput: number;
  onSetRisk: (value: string) => void;
  onSetOfficial: (value: DashboardOfficialFilter) => void;
  onSetMinProbInput: (value: number) => void;
  riskLabel: (risk: string) => string;
  officialLabel: (status: DashboardOfficialFilter) => string;
};

export default function DashboardSidebarStatusGroup({
  lang,
  riskLabelText,
  officialLabelText,
  minProbLabel,
  risk,
  official,
  minProb,
  minProbInput,
  onSetRisk,
  onSetOfficial,
  onSetMinProbInput,
  riskLabel,
  officialLabel,
}: Props) {
  return (
    <div className="filterGroup">
      <div className="filterGroupHead">
        <span className="filterGroupIcon" aria-hidden="true"><DashboardSidebarIcon name="alert" /></span>
        <span>{lruet(lang, "Статус и риск", "Staatus ja risk", "Status & risk")}</span>
      </div>
      <div className="field">
        <label htmlFor="risk-select">
          <span className="fieldIcon" aria-hidden="true"><DashboardSidebarIcon name="signal" /></span>
          {riskLabelText}
        </label>
        <div className="selectWrap">
          <select id="risk-select" value={risk} onChange={(e) => onSetRisk(e.target.value)} aria-label="Filter by risk level">
            {["all", "low", "medium", "high", "unknown"].map((item) => (
              <option key={item} value={item}>
                {riskLabel(item)}
              </option>
            ))}
          </select>
          <span className="selectChevron" aria-hidden="true"><DashboardSidebarIcon name="chevron-down" /></span>
        </div>
      </div>
      <div className="field">
        <label htmlFor="official-select">
          <span className="fieldIcon" aria-hidden="true"><DashboardSidebarIcon name="check-circle" /></span>
          {officialLabelText}
        </label>
        <div className="selectWrap">
          <select id="official-select" value={official} onChange={(e) => onSetOfficial(e.target.value as DashboardOfficialFilter)}>
            {(["all", "compliant", "violation", "unknown"] as DashboardOfficialFilter[]).map((item) => (
              <option key={item} value={item}>
                {officialLabel(item)}
              </option>
            ))}
          </select>
          <span className="selectChevron" aria-hidden="true"><DashboardSidebarIcon name="chevron-down" /></span>
        </div>
      </div>
      <div className="field rangeField">
        <label htmlFor="min-prob">
          <span className="fieldIcon" aria-hidden="true"><DashboardSidebarIcon name="alert" /></span>
          {minProbLabel}
          <span className="rangeValue">≥ {minProb.toFixed(2)}</span>
        </label>
        <input
          id="min-prob"
          className="rangeSlider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={minProbInput}
          onInput={(e) => onSetMinProbInput(Number((e.target as HTMLInputElement).value))}
          style={{ "--range-fill": `${minProbInput * 100}%` } as CSSProperties}
        />
        <div className="rangeScale" aria-hidden="true">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>
    </div>
  );
}
