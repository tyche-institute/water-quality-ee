"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";

type Props = {
  lang: DashboardLang;
  filtersLabel: string;
  nearMeLabel: string;
  clearFiltersLabel: string;
  query: string;
  filteredCount: number;
  segment: string;
  risk: string;
  alertsOnly: boolean;
  nearbyOnly: boolean;
  userCoords: { lat: number; lon: number } | null;
  mapAlertsCount: number;
  mapNearMeCount: number | null;
  domainCounts: Record<string, number>;
  onOpenFilters: () => void;
  onSetQuery: (value: string) => void;
  onActivateNearMe: () => void;
  onOpenInfo: () => void;
  onSetSegment: (value: string) => void;
  onToggleAlertsOnly: () => void;
  onToggleNearbyOnly: () => void;
  onClearRisk: () => void;
  onClearFilters: () => void;
  onShowCountBubble: (text: string) => void;
  onClearGeoError: () => void;
};

function MobileChipIcon({ name }: { name: "grid" | "swim" | "pool" | "tap" | "drop" | "alert" | "locate" | "signal" | "filter-x" }) {
  if (name === "grid") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" fill="currentColor" /></svg>;
  if (name === "swim") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9a3 3 0 1 1 6 0c0 1.4-1 2.6-2.3 2.9l2.6 2.4c.6.6 1.5.9 2.3.8l3.4-.3v2l-3.1.3c-1.4.1-2.8-.4-3.8-1.4l-1.9-1.8-2 2H4v-2h2.4l2.2-2.2A3 3 0 0 1 6 9Zm11.8 10.1c-1.5 0-2.3-.6-3-1.1-.6-.5-1.1-.9-2.1-.9s-1.5.4-2.1.9c-.7.5-1.6 1.1-3 1.1s-2.3-.6-3-1.1c-.6-.5-1.1-.9-2.1-.9v-2c1.5 0 2.3.6 3 1.1.6.5 1.1.9 2.1.9s1.5-.4 2.1-.9c.7-.5 1.6-1.1 3-1.1s2.3.6 3 1.1c.6.5 1.1.9 2.1.9s1.5-.4 2.1-.9c.7-.5 1.6-1.1 3-1.1v2c-1 0-1.5.4-2.1.9-.7.5-1.6 1.1-3 1.1Z" fill="currentColor" /></svg>;
  if (name === "pool") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="18" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M5 13.5h14M5 16.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M6 3v6M9 3v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M6 5h3M6 7h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  if (name === "tap") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v3h-2V3Zm-3 3h8v2H8V6Zm-4 4h16v2h-5v3h-2v-3H4v-2Z" fill="currentColor" /><path d="M15 17c0 0-2 2.5-2 3.8a2 2 0 0 0 4 0c0-1.3-2-3.8-2-3.8Z" fill="currentColor" /></svg>;
  if (name === "drop") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Zm0 15.5a3.5 3.5 0 0 0 3.5-3.5c0-1.7-1.6-4.2-3.5-6.5-1.9 2.3-3.5 4.8-3.5 6.5a3.5 3.5 0 0 0 3.5 3.5Z" fill="currentColor" /></svg>;
  if (name === "alert") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.2 20h19.6L12 3Zm0 5.2c.6 0 1 .4 1 1v5.4a1 1 0 1 1-2 0V9.2c0-.6.4-1 1-1Zm0 10a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" fill="currentColor" /></svg>;
  if (name === "locate") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v3m0 14v3M2 12h3m14 0h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.35" /></svg>;
  if (name === "signal") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16h2v3H5v-3Zm4-4h2v7H9v-7Zm4-4h2v11h-2V8Zm4-4h2v15h-2V4Z" fill="currentColor" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14v2H5V7Zm-2 4h18v2H3v-2Zm3 4h12v2H6v-2Z" fill="currentColor" /></svg>;
}

export default function DashboardMobileControls({
  lang,
  filtersLabel,
  nearMeLabel,
  clearFiltersLabel,
  query,
  filteredCount,
  segment,
  risk,
  alertsOnly,
  nearbyOnly,
  userCoords,
  mapAlertsCount,
  mapNearMeCount,
  domainCounts,
  onOpenFilters,
  onSetQuery,
  onActivateNearMe,
  onOpenInfo,
  onSetSegment,
  onToggleAlertsOnly,
  onToggleNearbyOnly,
  onClearRisk,
  onClearFilters,
  onShowCountBubble,
  onClearGeoError,
}: Props) {
  return (
    <>
      <div className="gmSearchBar">
        <button className="gmSearchMenuBtn" onClick={onOpenFilters} aria-label={filtersLabel}>
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <svg className="gmSearchIconSvg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
        </svg>
        <input className="gmSearchInput" type="search" value={query} onChange={(e) => onSetQuery(e.target.value)} placeholder={lruet(lang, "Поиск места...", "Otsi kohta...", "Search place...")} aria-label={lruet(lang, "Поиск места", "Otsi kohta", "Search place")} inputMode="search" enterKeyHint="search" autoComplete="off" autoCorrect="off" spellCheck={false} />
        {query ? (
          <button className="gmSearchClearBtn" onClick={() => onSetQuery("")} aria-label="Clear">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        ) : null}
        <div className="gmSearchDivider" />
        <button className={`gmSearchLocateBtn ${nearbyOnly ? "active" : ""}`} onClick={onActivateNearMe} aria-label={nearMeLabel}>
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.35"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/><circle cx="12" cy="12" r="9"/>
          </svg>
        </button>
        <button className="gmSearchInfoBtn" onClick={onOpenInfo} aria-label="Info">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.18" />
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="7.6" r="1.4" fill="currentColor" />
            <rect x="10.7" y="10.4" width="2.6" height="7.2" rx="1.1" fill="currentColor" />
            <path d="M0 0z"/>
          </svg>
        </button>
      </div>
      <div className="gmChipBar" role="toolbar" aria-label={filtersLabel}>
        <button type="button" className={`gmChip gmChipIcon ${segment === "all" ? "gmChipActive" : ""}`} onClick={() => { onSetSegment("all"); onShowCountBubble(lruet(lang, `Все точки: ${filteredCount}`, `Kõik punktid: ${filteredCount}`, `All points: ${filteredCount}`)); }} aria-label={lruet(lang, "Все", "Kõik", "All")} aria-pressed={segment === "all"} title={lruet(lang, "Все", "Kõik", "All")} data-tooltip={lruet(lang, "Все", "Kõik", "All")}>
          <MobileChipIcon name="grid" />
        </button>
        {(["swimming", "pool_spa", "drinking_water", "drinking_source"] as const).map((key) => {
          const iconName = key === "swimming" ? "swim" : key === "pool_spa" ? "pool" : key === "drinking_water" ? "tap" : "drop";
          const label = key === "swimming" ? lruet(lang, "Купальные", "Suplusvesi", "Swimming") : key === "pool_spa" ? lruet(lang, "Бассейны", "Basseinid", "Pools") : key === "drinking_water" ? lruet(lang, "Питьевая", "Joogivesi", "Drinking") : lruet(lang, "Источники", "Allikad", "Sources");
          return (
            <button key={`chip-${key}`} type="button" className={`gmChip gmChipIcon ${segment === key ? "gmChipActive" : ""}`} onClick={() => { const next = segment === key ? "all" : key; onSetSegment(next); onShowCountBubble(`${label}: ${domainCounts[key] ?? 0}`); }} aria-label={label} aria-pressed={segment === key} title={label} data-tooltip={label}>
              <MobileChipIcon name={iconName} />
            </button>
          );
        })}
        <button type="button" className={`gmChip gmChipIcon gmChipAlert ${alertsOnly ? "gmChipActive" : ""}`} onClick={() => { onToggleAlertsOnly(); onShowCountBubble(lruet(lang, `Тревог на карте: ${mapAlertsCount}`, `Häireid kaardil: ${mapAlertsCount}`, `Alerts on map: ${mapAlertsCount}`)); }} aria-label={alertsOnly ? lruet(lang, "Снять фильтр тревог", "Eemalda häirete filter", "Clear alerts filter") : lruet(lang, "Только тревоги", "Ainult häired", "Alerts only")} aria-pressed={alertsOnly} title={alertsOnly ? lruet(lang, "Снять фильтр тревог", "Eemalda häirete filter", "Clear alerts filter") : lruet(lang, "Только тревоги", "Ainult häired", "Alerts only")} data-tooltip={alertsOnly ? lruet(lang, "Снять фильтр тревог", "Eemalda häirete filter", "Clear alerts filter") : lruet(lang, "Только тревоги", "Ainult häired", "Alerts only")}>
          <MobileChipIcon name="alert" />
        </button>
        <button type="button" className={`gmChip gmChipIcon ${nearbyOnly ? "gmChipActive" : ""}`} onClick={() => { if (!nearbyOnly && !userCoords) { onActivateNearMe(); onShowCountBubble(lruet(lang, "Определяем местоположение…", "Määrame asukohta…", "Finding your location…")); return; } onToggleNearbyOnly(); onClearGeoError(); const count = mapNearMeCount ?? 0; onShowCountBubble(lruet(lang, `Рядом на карте: ${count}`, `Läheduses kaardil: ${count}`, `Near me on map: ${count}`)); }} aria-label={nearbyOnly ? lruet(lang, "Снять фильтр «рядом»", "Eemalda läheduse filter", "Clear near-me filter") : lruet(lang, "Рядом со мной", "Minu lähedal", "Near me")} aria-pressed={nearbyOnly} title={nearbyOnly ? lruet(lang, "Снять фильтр «рядом»", "Eemalda läheduse filter", "Clear near-me filter") : lruet(lang, "Рядом со мной", "Minu lähedal", "Near me")} data-tooltip={nearbyOnly ? lruet(lang, "Снять фильтр «рядом»", "Eemalda läheduse filter", "Clear near-me filter") : lruet(lang, "Рядом со мной", "Minu lähedal", "Near me")}>
          <MobileChipIcon name="locate" />
        </button>
        {risk !== "all" ? (
          <button type="button" className="gmChip gmChipIcon gmChipActive" onClick={onClearRisk} aria-label={lruet(lang, "Сбросить риск", "Lähtesta risk", "Clear risk filter")} title={lruet(lang, "Сбросить риск", "Lähtesta risk", "Clear risk filter")} data-tooltip={lruet(lang, "Сбросить риск", "Lähtesta risk", "Clear risk filter")}>
            <MobileChipIcon name="signal" />
          </button>
        ) : null}
        <button type="button" className="gmChip gmChipIcon gmChipClear" onClick={onClearFilters} aria-label={clearFiltersLabel} title={clearFiltersLabel} data-tooltip={clearFiltersLabel}>
          <MobileChipIcon name="filter-x" />
        </button>
      </div>
    </>
  );
}
