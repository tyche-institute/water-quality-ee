"use client";

import type { ComponentProps, RefObject } from "react";
import DashboardIcon from "./DashboardIcon";
import DashboardFilterSidebar from "./DashboardFilterSidebar";
import DashboardHeaderBar from "./DashboardHeaderBar";
import DashboardMapStats from "./DashboardMapStats";
import DashboardMobileControls from "./DashboardMobileControls";
import LocalizedSubtitle from "./LocalizedSubtitle";
import type { DashboardLang } from "../lib/dashboard-types";
import type { FrontendPlace } from "../lib/types";
import type { DASHBOARD_TRANSLATIONS } from "../lib/dashboard-translations";

type DashboardText = (typeof DASHBOARD_TRANSLATIONS)[DashboardLang];
type MobileControlsProps = ComponentProps<typeof DashboardMobileControls>;
type FilterSidebarProps = ComponentProps<typeof DashboardFilterSidebar>;

type Props = {
  lang: DashboardLang;
  t: DashboardText;
  isMobile: boolean;
  drawerOpen: boolean;
  headerCompact: boolean;
  showLangDialog: boolean;
  langMenuOpen: boolean;
  langMenuRef: RefObject<HTMLDivElement | null>;
  sidebarCollapsed: boolean;
  nearbyOnly: boolean;
  nearbyRadiusKm: FilterSidebarProps["nearbyRadiusKm"];
  userCoords: FilterSidebarProps["userCoords"];
  geoError: FilterSidebarProps["geoError"];
  query: FilterSidebarProps["query"];
  cyrillicFont: FilterSidebarProps["cyrillicFont"];
  segment: string;
  alertsOnly: MobileControlsProps["alertsOnly"];
  county: string;
  risk: string;
  official: FilterSidebarProps["official"];
  minProb: FilterSidebarProps["minProb"];
  minProbInput: FilterSidebarProps["minProbInput"];
  sampleDateFrom: string;
  sampleDateTo: string;
  filteredCount: number;
  mapAlertsCount: number;
  mapNearMeCount: MobileControlsProps["mapNearMeCount"];
  highRiskCount: number;
  violationsCount: number;
  healthIndex: number;
  domainCounts: MobileControlsProps["domainCounts"];
  placeKinds: FilterSidebarProps["placeKinds"];
  counties: FilterSidebarProps["counties"];
  watchlistPlaces: FrontendPlace[];
  onCloseDrawer: () => void;
  onOpenAboutModel: () => void;
  onChooseLang: (lang: DashboardLang) => void;
  onToggleLangMenu: () => void;
  onSelectLangOption: (lang: DashboardLang) => void;
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
  onToggleSidebar: () => void;
  onSetNearbyRadiusKm: (value: number) => void;
  onClearNearMe: () => void;
  onSetLang: (lang: DashboardLang) => void;
  onPushHeaderLang: (lang: DashboardLang) => void;
  onSetCyrillicFont: FilterSidebarProps["onSetCyrillicFont"];
  onSetCounty: (value: string) => void;
  onSetRisk: (value: string) => void;
  onSetOfficial: FilterSidebarProps["onSetOfficial"];
  onSetMinProbInput: FilterSidebarProps["onSetMinProbInput"];
  onSetSampleDateFrom: (value: string) => void;
  onSetSampleDateTo: (value: string) => void;
  onSelectPoint: (id: string) => void;
  placeKindLabel: (kind: string) => string;
  riskLabel: (risk: string) => string;
  officialLabel: (status: string) => string;
};

export default function DashboardTopChrome({
  lang,
  t,
  isMobile,
  drawerOpen,
  headerCompact,
  showLangDialog,
  langMenuOpen,
  langMenuRef,
  sidebarCollapsed,
  nearbyOnly,
  nearbyRadiusKm,
  userCoords,
  geoError,
  query,
  cyrillicFont,
  segment,
  alertsOnly,
  county,
  risk,
  official,
  minProb,
  minProbInput,
  sampleDateFrom,
  sampleDateTo,
  filteredCount,
  mapAlertsCount,
  mapNearMeCount,
  highRiskCount,
  violationsCount,
  healthIndex,
  domainCounts,
  placeKinds,
  counties,
  watchlistPlaces,
  onCloseDrawer,
  onOpenAboutModel,
  onChooseLang,
  onToggleLangMenu,
  onSelectLangOption,
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
  onToggleSidebar,
  onSetNearbyRadiusKm,
  onClearNearMe,
  onSetLang,
  onPushHeaderLang,
  onSetCyrillicFont,
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
      <DashboardHeaderBar
        lang={lang}
        headerCompact={headerCompact}
        showLangDialog={showLangDialog}
        langMenuOpen={langMenuOpen}
        langMenuRef={langMenuRef}
        aboutModelLabel={t.tabs.aboutModel}
        onOpenAboutModel={onOpenAboutModel}
        onChooseLang={onChooseLang}
        onToggleLangMenu={onToggleLangMenu}
        onSelectLangOption={onSelectLangOption}
        renderInfoIcon={() => <DashboardIcon name="info" />}
        renderGlobeIcon={() => <DashboardIcon name="globe" />}
        renderChevronIcon={() => <DashboardIcon name="chevron-down" />}
        renderCheckIcon={() => <DashboardIcon name="check-circle" />}
        renderSubtitle={() => <LocalizedSubtitle />}
      />

      <DashboardMobileControls
        lang={lang}
        filtersLabel={t.filters}
        nearMeLabel={t.nearMe}
        clearFiltersLabel={t.clearFilters}
        query={query}
        filteredCount={filteredCount}
        segment={segment}
        risk={risk}
        alertsOnly={alertsOnly}
        nearbyOnly={nearbyOnly}
        userCoords={userCoords}
        mapAlertsCount={mapAlertsCount}
        mapNearMeCount={mapNearMeCount}
        domainCounts={domainCounts}
        onOpenFilters={onOpenFilters}
        onSetQuery={onSetQuery}
        onActivateNearMe={onActivateNearMe}
        onOpenInfo={onOpenInfo}
        onSetSegment={onSetSegment}
        onToggleAlertsOnly={onToggleAlertsOnly}
        onToggleNearbyOnly={onToggleNearbyOnly}
        onClearRisk={onClearRisk}
        onClearFilters={onClearFilters}
        onShowCountBubble={onShowCountBubble}
        onClearGeoError={onClearGeoError}
      />

      {isMobile && drawerOpen ? <div className="drawerBackdrop" onClick={onCloseDrawer} /> : null}

      {!isMobile ? (
        <DashboardMapStats
          lang={lang}
          visibleCount={filteredCount}
          highRiskCount={highRiskCount}
          violationsCount={violationsCount}
          healthIndex={healthIndex}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
        />
      ) : null}

      <DashboardFilterSidebar
        lang={lang}
        t={t}
        isMobile={isMobile}
        drawerOpen={drawerOpen}
        sidebarCollapsed={sidebarCollapsed}
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
        onCloseDrawer={onCloseDrawer}
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
    </>
  );
}
