"use client";

import type { ReactNode } from "react";
import type {
  DashboardLang,
  DashboardOfficialFilter,
  DashboardTheme,
} from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";

type Props = {
  lang: DashboardLang;
  nearRadiusLabel: string;
  clearNearMeLabel: string;
  countyLabel: string;
  riskLabel: string;
  officialLabel: string;
  minProbLabel: string;
  latestSampleDateLabel: string;
  dateFromLabel: string;
  dateToLabel: string;
  resetDateLabel: string;
  latestSampleDateHint: string;
  themeLightLabel: string;
  themeDarkLabel: string;
  visibleCount: number;
  highCount: number;
  lowCount: number;
  violationsCount: number;
  riskOrder: string[];
  officialOrder: ReadonlyArray<"all" | "compliant" | "violation" | "unknown">;
  county: string;
  risk: string;
  official: DashboardOfficialFilter;
  minProb: number;
  minProbInput: number;
  sampleDateFrom: string;
  sampleDateTo: string;
  nearbyOnly: boolean;
  nearbyRadiusKm: number;
  userCoords: { lat: number; lon: number } | null;
  geoError: string | null;
  counties: Array<{ value: string; label: string }>;
  theme: DashboardTheme;
  onSetCounty: (value: string) => void;
  onSetRisk: (value: string) => void;
  onSetOfficial: (value: DashboardOfficialFilter) => void;
  onSetMinProbInput: (value: number) => void;
  onSetSampleDateFrom: (value: string) => void;
  onSetSampleDateTo: (value: string) => void;
  onClearSampleDates: () => void;
  onSetNearbyRadiusKm: (value: number) => void;
  onClearNearMe: () => void;
  onSetTheme: (value: DashboardTheme) => void;
  onSetLang: (value: DashboardLang) => void;
  renderIcon: (name: string) => ReactNode;
};

export default function DashboardMobileSheetFilterContent({
  lang,
  nearRadiusLabel,
  clearNearMeLabel,
  countyLabel,
  riskLabel,
  officialLabel,
  minProbLabel,
  latestSampleDateLabel,
  dateFromLabel,
  dateToLabel,
  resetDateLabel,
  latestSampleDateHint,
  themeLightLabel,
  themeDarkLabel,
  visibleCount,
  highCount,
  lowCount,
  violationsCount,
  riskOrder,
  officialOrder,
  county,
  risk,
  official,
  minProb,
  minProbInput,
  sampleDateFrom,
  sampleDateTo,
  nearbyOnly,
  nearbyRadiusKm,
  userCoords,
  geoError,
  counties,
  theme,
  onSetCounty,
  onSetRisk,
  onSetOfficial,
  onSetMinProbInput,
  onSetSampleDateFrom,
  onSetSampleDateTo,
  onClearSampleDates,
  onSetNearbyRadiusKm,
  onClearNearMe,
  onSetTheme,
  onSetLang,
  renderIcon,
}: Props) {
  return (
    <div className="gmSheetFilterContent">
      {nearbyOnly && userCoords ? (
        <div className="nearbyPanel">
          <label htmlFor="gm-nearby-radius">{nearRadiusLabel}: <b>{nearbyRadiusKm} km</b></label>
          <input id="gm-nearby-radius" type="range" min={1} max={50} step={1} value={nearbyRadiusKm} onChange={(e) => onSetNearbyRadiusKm(Number(e.target.value))} />
          <button type="button" className="btn btnSmall" onClick={onClearNearMe}>{clearNearMeLabel}</button>
        </div>
      ) : null}
      {geoError ? <p className="hint">{geoError}</p> : null}

      <div className="field">
        <label htmlFor="gm-county-select">{countyLabel}</label>
        <select id="gm-county-select" value={county} onChange={(e) => onSetCounty(e.target.value)}>
          <option value="all">{lruet(lang, "Все", "Kõik", "All")}</option>
          {counties.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="gm-risk-select">{riskLabel}</label>
        <select id="gm-risk-select" value={risk} onChange={(e) => onSetRisk(e.target.value)}>
          {riskOrder.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? lruet(lang, "Все", "Kõik", "All")
                : item === "low" ? lruet(lang, "Низкий", "Madal", "Low")
                  : item === "medium" ? lruet(lang, "Средний", "Keskmine", "Medium")
                    : item === "high" ? lruet(lang, "Высокий", "Kõrge", "High")
                      : lruet(lang, "Неизвестно", "Teadmata", "Unknown")}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="gm-official-select">{officialLabel}</label>
        <select id="gm-official-select" value={official} onChange={(e) => onSetOfficial(e.target.value as DashboardOfficialFilter)}>
          {officialOrder.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? lruet(lang, "Все", "Kõik", "All")
                : item === "compliant" ? lruet(lang, "Соответствует", "Vastab", "Compliant")
                  : item === "violation" ? lruet(lang, "Нарушение", "Rikkumine", "Violation")
                    : lruet(lang, "Неизвестно", "Teadmata", "Unknown")}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="gm-min-prob">{minProbLabel}: <b>≥ {minProb.toFixed(2)}</b></label>
        <input id="gm-min-prob" type="range" min={0} max={1} step={0.01} value={minProbInput} onInput={(e) => onSetMinProbInput(Number((e.target as HTMLInputElement).value))} />
      </div>
      <div className="field">
        <label>{latestSampleDateLabel}</label>
        <div className="gmDateRangeWrap">
          <div className="gmDateRange">
            <div>
              <span className="gmDateLabel">{dateFromLabel}</span>
              <div className="gmDateField">
                {renderIcon("calendar")}
                <input type="date" value={sampleDateFrom} onChange={(e) => onSetSampleDateFrom(e.target.value)} aria-label={dateFromLabel} />
              </div>
            </div>
            <div>
              <span className="gmDateLabel">{dateToLabel}</span>
              <div className="gmDateField">
                {renderIcon("calendar")}
                <input type="date" value={sampleDateTo} onChange={(e) => onSetSampleDateTo(e.target.value)} aria-label={dateToLabel} />
              </div>
            </div>
          </div>
          <button type="button" className="gmDateClear" onClick={onClearSampleDates} aria-label={resetDateLabel} title={resetDateLabel}>
            {renderIcon("reset")}
          </button>
        </div>
        <p className="hint">{latestSampleDateHint}</p>
      </div>
      <div className="stats">
        <div className="stat"><div className="k">{lruet(lang, "Видимых", "Nähtav", "Visible")}</div><div className="v">{visibleCount}</div></div>
        <div className="stat"><div className="k">{lruet(lang, "Высокий риск", "Kõrge risk", "High risk")}</div><div className="v">{highCount}</div></div>
        <div className="stat"><div className="k">{lruet(lang, "Низкий риск", "Madal risk", "Low risk")}</div><div className="v">{lowCount}</div></div>
        <div className="stat"><div className="k">{lruet(lang, "Офиц. нарушения", "Ametlik rikkumine", "Official violations")}</div><div className="v">{violationsCount}</div></div>
      </div>

      <div className="gmBurgerPanel">
        <div className="gmBurgerRow">
          <b>{lruet(lang, "Тема", "Teema", "Theme")}</b>
          <div className="gmThemeToggle" role="group" aria-label="Theme">
            <button type="button" className={`gmThemeBtn ${theme === "light" ? "active" : ""}`} onClick={() => onSetTheme("light")} aria-pressed={theme === "light"}>
              <span className="btnIcon" aria-hidden="true">{renderIcon("sun")}</span>
              {themeLightLabel}
            </button>
            <button type="button" className={`gmThemeBtn ${theme === "dark" ? "active" : ""}`} onClick={() => onSetTheme("dark")} aria-pressed={theme === "dark"}>
              <span className="btnIcon" aria-hidden="true">{renderIcon("moon")}</span>
              {themeDarkLabel}
            </button>
          </div>
        </div>
        <div className="gmBurgerRow">
          <b>{lruet(lang, "Язык", "Keel", "Language")}</b>
          <div className="drawerLangRow" style={{ padding: 0 }}>
            <button className={`btn btnSmall ${lang === "ru" ? "btnActive" : ""}`} onClick={() => onSetLang("ru")}>RU</button>
            <button className={`btn btnSmall ${lang === "et" ? "btnActive" : ""}`} onClick={() => onSetLang("et")}>ET</button>
            <button className={`btn btnSmall ${lang === "en" ? "btnActive" : ""}`} onClick={() => onSetLang("en")}>EN</button>
          </div>
        </div>
        <p className="gmCopyright">
          © {new Date().getFullYear()} H2O Atlas ·{" "}
          <a href="https://github.com/tyche-institute/water-quality-ee" target="_blank" rel="noreferrer">GitHub</a>
          {" · "}TalTech Masin&otilde;pe 2026
          <br />
          {lruet(lang, "Открытые данные Terviseamet + ML", "Terviseameti avaandmed + ML", "Terviseamet open data + ML")}
        </p>
      </div>
    </div>
  );
}
