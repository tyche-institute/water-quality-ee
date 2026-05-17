"use client";

import type { ComponentProps } from "react";
import DashboardIcon, { type DashboardIconName } from "./DashboardIcon";
import DashboardPlacesTable from "./DashboardPlacesTable";
import DashboardReportsPanel from "./DashboardReportsPanel";

type PlacesTableProps = ComponentProps<typeof DashboardPlacesTable>;
type ReportsPanelProps = ComponentProps<typeof DashboardReportsPanel>;

type Props = {
  lang: PlacesTableProps["lang"];
  isMobile: boolean;
  filteredCount: number;
  placesTableRows: PlacesTableProps["rows"];
  selectedId: string | null;
  watchlist: string[];
  placesTableSort: PlacesTableProps["placesTableSort"];
  topAlerts: ReportsPanelProps["topAlerts"];
  domainStats: ReportsPanelProps["domainStats"];
  openInfo: PlacesTableProps["openInfo"];
  explainViolation: PlacesTableProps["explainViolation"];
  officialStatusText: PlacesTableProps["officialStatusText"];
  countyPretty: PlacesTableProps["countyPretty"];
  fmtDate: PlacesTableProps["fmtDate"];
  onSelectPoint: (id: string) => void;
  onToggleWatch: (id: string) => void;
  onCycleSort: PlacesTableProps["onCycleSort"];
};

export default function DashboardInsightsSection({
  lang,
  isMobile,
  filteredCount,
  placesTableRows,
  selectedId,
  watchlist,
  placesTableSort,
  topAlerts,
  domainStats,
  openInfo,
  explainViolation,
  officialStatusText,
  countyPretty,
  fmtDate,
  onSelectPoint,
  onToggleWatch,
  onCycleSort,
}: Props) {
  return (
    <section className="panel">
      <DashboardReportsPanel
        lang={lang}
        isMobile={isMobile}
        topAlerts={topAlerts}
        domainStats={domainStats}
        onSelectPoint={onSelectPoint}
      />

      <DashboardPlacesTable
        lang={lang}
        isMobile={isMobile}
        filteredCount={filteredCount}
        rows={placesTableRows}
        selectedId={selectedId}
        watchlist={watchlist}
        placesTableSort={placesTableSort}
        onCycleSort={onCycleSort}
        onSelectPoint={onSelectPoint}
        onToggleWatch={onToggleWatch}
        openInfo={openInfo}
        explainViolation={explainViolation}
        officialStatusText={officialStatusText}
        countyPretty={countyPretty}
        fmtDate={fmtDate}
        renderIcon={(name) => <DashboardIcon name={name as DashboardIconName} />}
      />
    </section>
  );
}
