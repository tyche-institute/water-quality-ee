"use client";

import type { DashboardLang, DashboardOfficialFilter } from "../lib/dashboard-types";
import DashboardFilterSidebarContent from "./DashboardFilterSidebarContent";
import type { DashboardCyrillicFont, DashboardSidebarCopy } from "./dashboard-filter-sidebar-types";
import type { FrontendPlace } from "../lib/types";

type Props = {
  lang: DashboardLang;
  t: DashboardSidebarCopy;
  isMobile: boolean;
  drawerOpen: boolean;
  sidebarCollapsed: boolean;
  nearbyOnly: boolean;
  nearbyRadiusKm: number;
  userCoords: { lat: number; lon: number } | null;
  geoError: string | null;
  query: string;
  cyrillicFont: DashboardCyrillicFont;
  segment: string;
  county: string;
  risk: string;
  official: DashboardOfficialFilter;
  minProb: number;
  minProbInput: number;
  sampleDateFrom: string;
  sampleDateTo: string;
  placeKinds: string[];
  counties: Array<{ value: string; label: string }>;
  watchlistPlaces: FrontendPlace[];
  onCloseDrawer: () => void;
  onSetNearbyRadiusKm: (value: number) => void;
  onClearNearMe: () => void;
  onSetQuery: (value: string) => void;
  onSetLang: (lang: DashboardLang) => void;
  onPushHeaderLang: (lang: DashboardLang) => void;
  onSetCyrillicFont: (font: DashboardCyrillicFont) => void;
  onSetSegment: (value: string) => void;
  onSetCounty: (value: string) => void;
  onSetRisk: (value: string) => void;
  onSetOfficial: (value: DashboardOfficialFilter) => void;
  onSetMinProbInput: (value: number) => void;
  onSetSampleDateFrom: (value: string) => void;
  onSetSampleDateTo: (value: string) => void;
  onSelectPoint: (id: string) => void;
  placeKindLabel: (kind: string) => string;
  riskLabel: (risk: string) => string;
  officialLabel: (status: DashboardOfficialFilter) => string;
};

function Icon({ name }: { name: "filters" | "close" }) {
  if (name === "filters") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.7 5.3 12 10.6l5.3-5.3 1.4 1.4L13.4 12l5.3 5.3-1.4 1.4L12 13.4l-5.3 5.3-1.4-1.4L10.6 12 5.3 6.7l1.4-1.4Z" fill="currentColor" />
      </svg>
    );
  }
  return null;
}

export default function DashboardFilterSidebar({
  lang,
  t,
  isMobile,
  drawerOpen,
  sidebarCollapsed,
  nearbyOnly,
  nearbyRadiusKm,
  userCoords,
  geoError,
  query,
  cyrillicFont,
  segment,
  county,
  risk,
  official,
  minProb,
  minProbInput,
  sampleDateFrom,
  sampleDateTo,
  placeKinds,
  counties,
  watchlistPlaces,
  onCloseDrawer,
  onSetNearbyRadiusKm,
  onClearNearMe,
  onSetQuery,
  onSetLang,
  onPushHeaderLang,
  onSetCyrillicFont,
  onSetSegment,
  onSetCounty,
  onSetRisk,
  onSetOfficial,
  onSetMinProbInput,
  onSetSampleDateFrom,
  onSetSampleDateTo,
  onSelectPoint,
  placeKindLabel,
  riskLabel,
  officialLabel,
}: Props) {
  return (
    <aside className={
      isMobile
        ? `drawer panel ${drawerOpen ? "open" : ""}`
        : `sidebar ${sidebarCollapsed ? "sidebarCollapsed" : ""}`
    }>
      {!isMobile ? (
        <div className="sidebarHeader">
          <span className="sidebarTitle">{t.filters}</span>
        </div>
      ) : (
        <div className="drawerHeader">
          <h3 className="sectionTitle drawerSectionTitle">
            <span className="drawerTitleIcon" aria-hidden="true">
              <Icon name="filters" />
            </span>
            {t.filters}
          </h3>
          <div className="drawerHeaderActions">
            <button className="btn btnSmall drawerDoneBtn" onClick={onCloseDrawer} aria-label={t.close}>
              <span className="btnIcon" aria-hidden="true">
                <Icon name="close" />
              </span>
            </button>
          </div>
        </div>
      )}
      {(isMobile || !sidebarCollapsed) ? (
        <DashboardFilterSidebarContent
          lang={lang}
          t={t}
          isMobile={isMobile}
          nearbyOnly={nearbyOnly}
          nearbyRadiusKm={nearbyRadiusKm}
          userCoords={userCoords}
          geoError={geoError}
          query={query}
          cyrillicFont={cyrillicFont}
          segment={segment}
          county={county}
          risk={risk}
          official={official}
          minProb={minProb}
          minProbInput={minProbInput}
          sampleDateFrom={sampleDateFrom}
          sampleDateTo={sampleDateTo}
          placeKinds={placeKinds}
          counties={counties}
          watchlistPlaces={watchlistPlaces}
          onSetNearbyRadiusKm={onSetNearbyRadiusKm}
          onClearNearMe={onClearNearMe}
          onSetQuery={onSetQuery}
          onSetLang={onSetLang}
          onPushHeaderLang={onPushHeaderLang}
          onSetCyrillicFont={onSetCyrillicFont}
          onSetSegment={onSetSegment}
          onSetCounty={onSetCounty}
          onSetRisk={onSetRisk}
          onSetOfficial={onSetOfficial}
          onSetMinProbInput={onSetMinProbInput}
          onSetSampleDateFrom={onSetSampleDateFrom}
          onSetSampleDateTo={onSetSampleDateTo}
          onSelectPoint={onSelectPoint}
          placeKindLabel={placeKindLabel}
          riskLabel={riskLabel}
          officialLabel={officialLabel}
        />
      ) : null}
    </aside>
  );
}
