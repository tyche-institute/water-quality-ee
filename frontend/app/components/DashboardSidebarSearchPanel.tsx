"use client";

import DashboardSidebarIcon from "./DashboardSidebarIcon";
import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";
import type { DashboardCyrillicFont, DashboardSidebarCopy } from "./dashboard-filter-sidebar-types";

type Props = {
  lang: DashboardLang;
  t: DashboardSidebarCopy;
  isMobile: boolean;
  nearbyOnly: boolean;
  nearbyRadiusKm: number;
  userCoords: { lat: number; lon: number } | null;
  geoError: string | null;
  query: string;
  cyrillicFont: DashboardCyrillicFont;
  onSetNearbyRadiusKm: (value: number) => void;
  onClearNearMe: () => void;
  onSetQuery: (value: string) => void;
  onSetLang: (lang: DashboardLang) => void;
  onPushHeaderLang: (lang: DashboardLang) => void;
  onSetCyrillicFont: (font: DashboardCyrillicFont) => void;
};

export default function DashboardSidebarSearchPanel({
  lang,
  t,
  isMobile,
  nearbyOnly,
  nearbyRadiusKm,
  userCoords,
  geoError,
  query,
  cyrillicFont,
  onSetNearbyRadiusKm,
  onClearNearMe,
  onSetQuery,
  onSetLang,
  onPushHeaderLang,
  onSetCyrillicFont,
}: Props) {
  return (
    <>
      {nearbyOnly && userCoords ? (
        <div className="nearbyPanel">
          <label htmlFor="nearby-radius">
            {t.nearRadius}: <b>{nearbyRadiusKm} km</b>
          </label>
          <input
            id="nearby-radius"
            type="range"
            min={1}
            max={50}
            step={1}
            value={nearbyRadiusKm}
            onChange={(e) => onSetNearbyRadiusKm(Number(e.target.value))}
          />
          <button type="button" className="btn btnSmall" onClick={onClearNearMe}>
            {t.clearNearMe}
          </button>
        </div>
      ) : null}
      {geoError ? <p className="hint">{geoError}</p> : null}
      <div className="field drawerSearchField">
        <label htmlFor="search-input">{t.search}</label>
        <div className="drawerSearchWrap">
          <span className="drawerSearchIcon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="9" cy="9" r="6" />
              <path d="m13.5 13.5 4 4" />
            </svg>
          </span>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => onSetQuery(e.target.value)}
            placeholder={lruet(lang, "например: Tallinn, Harku, rand", "nt Tallinn, Harku, rand", "e.g. Tallinn, Harku, beach")}
            aria-label={lruet(lang, "Поиск мест по названию или уезду", "Otsi kohti nime või maakonna järgi", "Search places by location or county")}
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              className="drawerSearchClear"
              onClick={() => onSetQuery("")}
              aria-label={lruet(lang, "Очистить", "Tuhjenda", "Clear")}
              title={lruet(lang, "Очистить", "Tuhjenda", "Clear")}
            >
              <DashboardSidebarIcon name="close" />
            </button>
          ) : null}
        </div>
      </div>
      {isMobile ? (
        <>
          <div className="drawerLangRow">
            <span className="drawerLangLabel">{lruet(lang, "Язык", "Keel", "Language")}</span>
            <button className={`btn btnSmall ${lang === "ru" ? "btnActive" : ""}`} onClick={() => { onSetLang("ru"); onPushHeaderLang("ru"); }}>RU</button>
            <button className={`btn btnSmall ${lang === "et" ? "btnActive" : ""}`} onClick={() => { onSetLang("et"); onPushHeaderLang("et"); }}>ET</button>
            <button className={`btn btnSmall ${lang === "en" ? "btnActive" : ""}`} onClick={() => { onSetLang("en"); onPushHeaderLang("en"); }}>EN</button>
          </div>
          <div className="drawerLangRow">
            <span className="drawerLangLabel">{lruet(lang, "Шрифт", "Font", "Font")}</span>
            <div className="fontToggle" role="group" aria-label="Cyrillic font switch">
              <button className={`btn btnSmall ${cyrillicFont === "ibm" ? "btnActive" : ""}`} onClick={() => onSetCyrillicFont("ibm")}>IBM</button>
              <button className={`btn btnSmall ${cyrillicFont === "manrope" ? "btnActive" : ""}`} onClick={() => onSetCyrillicFont("manrope")}>MAN</button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
