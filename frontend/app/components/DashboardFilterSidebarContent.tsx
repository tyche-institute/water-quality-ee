"use client";

import DashboardSidebarDateGroup from "./DashboardSidebarDateGroup";
import DashboardSidebarSearchPanel from "./DashboardSidebarSearchPanel";
import DashboardSidebarStatusGroup from "./DashboardSidebarStatusGroup";
import DashboardSidebarWhereGroup from "./DashboardSidebarWhereGroup";
import DashboardWatchlist from "./DashboardWatchlist";
import type { DashboardLang, DashboardOfficialFilter } from "../lib/dashboard-types";
import type { FrontendPlace } from "../lib/types";
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

export default function DashboardFilterSidebarContent({
  lang,
  t,
  isMobile,
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
    <>
      <DashboardSidebarSearchPanel
        lang={lang}
        t={t}
        isMobile={isMobile}
        nearbyOnly={nearbyOnly}
        nearbyRadiusKm={nearbyRadiusKm}
        userCoords={userCoords}
        geoError={geoError}
        query={query}
        cyrillicFont={cyrillicFont}
        onSetNearbyRadiusKm={onSetNearbyRadiusKm}
        onClearNearMe={onClearNearMe}
        onSetQuery={onSetQuery}
        onSetLang={onSetLang}
        onPushHeaderLang={onPushHeaderLang}
        onSetCyrillicFont={onSetCyrillicFont}
      />
      <DashboardSidebarWhereGroup
        lang={lang}
        countyLabel={t.county}
        segment={segment}
        county={county}
        placeKinds={placeKinds}
        counties={counties}
        onSetSegment={onSetSegment}
        onSetCounty={onSetCounty}
        placeKindLabel={placeKindLabel}
      />
      <DashboardSidebarStatusGroup
        lang={lang}
        riskLabelText={t.risk}
        officialLabelText={t.official}
        minProbLabel={t.minProb}
        risk={risk}
        official={official}
        minProb={minProb}
        minProbInput={minProbInput}
        onSetRisk={onSetRisk}
        onSetOfficial={onSetOfficial}
        onSetMinProbInput={onSetMinProbInput}
        riskLabel={riskLabel}
        officialLabel={officialLabel}
      />
      <DashboardSidebarDateGroup
        lang={lang}
        t={t}
        sampleDateFrom={sampleDateFrom}
        sampleDateTo={sampleDateTo}
        onSetSampleDateFrom={onSetSampleDateFrom}
        onSetSampleDateTo={onSetSampleDateTo}
      />
      <DashboardWatchlist lang={lang} watchlistPlaces={watchlistPlaces} onSelectPoint={onSelectPoint} />
    </>
  );
}
