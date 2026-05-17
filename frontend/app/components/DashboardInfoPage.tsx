"use client";

import type { ComponentProps } from "react";
import DashboardAboutModelTab from "./DashboardAboutModelTab";
import DashboardAboutServiceTab from "./DashboardAboutServiceTab";
import DashboardIcon from "./DashboardIcon";
import DashboardInfoAnalyticsTab from "./DashboardInfoAnalyticsTab";
import DashboardInfoPageOverlay from "./DashboardInfoPageOverlay";
import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendSnapshot } from "../lib/types";
import type { DASHBOARD_TRANSLATIONS } from "../lib/dashboard-translations";

type InfoPageTab = "analytics" | "aboutModel" | "aboutService";
type TabLabels = (typeof DASHBOARD_TRANSLATIONS)[DashboardLang]["tabs"];
type ParameterCards = ComponentProps<typeof DashboardAboutServiceTab>["parameterCards"];
type QuickInsights = ComponentProps<typeof DashboardInfoAnalyticsTab>["quickInsights"];
type AboutModelCopy = ComponentProps<typeof DashboardAboutModelTab>["aboutModel"];
type MetricGuideTitle = ComponentProps<typeof DashboardAboutModelTab>["metricGuideTitle"];
type MetricGuide = ComponentProps<typeof DashboardAboutModelTab>["metricGuide"];
type DataFreshnessLevel = ComponentProps<typeof DashboardInfoAnalyticsTab>["dataFreshnessLevel"];
type ModelFreshnessLevel = ComponentProps<typeof DashboardInfoAnalyticsTab>["modelFreshnessLevel"];
type FreshnessLabel = ComponentProps<typeof DashboardInfoAnalyticsTab>["freshnessLabel"];
type SeverityLabel = ComponentProps<typeof DashboardInfoAnalyticsTab>["severityLabel"];

type Props = {
  lang: DashboardLang;
  snapshot: FrontendSnapshot;
  isOpen: boolean;
  activeTab: InfoPageTab;
  tabLabels: TabLabels;
  closeLabel: string;
  parameterCards: ParameterCards;
  quickInsights: QuickInsights;
  aboutModel: AboutModelCopy;
  metricGuideTitle: MetricGuideTitle;
  metricGuide: MetricGuide;
  dataFetchedLabel: string | null;
  modelTrainedLabel: string | null;
  dataFreshnessLevel: DataFreshnessLevel;
  modelFreshnessLevel: ModelFreshnessLevel;
  freshnessLabel: FreshnessLabel;
  severityLabel: SeverityLabel;
  expertModeText: string;
  onClose: () => void;
  onSelectTab: (tab: InfoPageTab) => void;
  onOpenInfo: (title: string, text: string) => void;
};

export default function DashboardInfoPage({
  lang,
  snapshot,
  isOpen,
  activeTab,
  tabLabels,
  closeLabel,
  parameterCards,
  quickInsights,
  aboutModel,
  metricGuideTitle,
  metricGuide,
  dataFetchedLabel,
  modelTrainedLabel,
  dataFreshnessLevel,
  modelFreshnessLevel,
  freshnessLabel,
  severityLabel,
  expertModeText,
  onClose,
  onSelectTab,
  onOpenInfo,
}: Props) {
  return (
    <DashboardInfoPageOverlay
      isOpen={isOpen}
      activeTab={activeTab}
      closeLabel={closeLabel}
      tabLabels={tabLabels}
      onClose={onClose}
      onSelectTab={onSelectTab}
      renderCloseIcon={() => <DashboardIcon name="close" />}
      footer={(
        <p className="gmCopyright" style={{ marginTop: "1.2rem" }}>
          © {new Date().getFullYear()} H2O Atlas ·{" "}
          <a href="https://github.com/tyche-institute/water-quality-ee" target="_blank" rel="noreferrer">GitHub</a>
          {" · "}TalTech Masin&otilde;pe 2026
          <br />
          {lruet(
            lang,
            "Открытые данные Terviseamet · ML — поддержка решений, не медицинская рекомендация.",
            "Terviseameti avaandmed · ML — otsusetugi, mitte meditsiiniline soovitus.",
            "Terviseamet open data · ML — decision support, not medical advice.",
          )}
        </p>
      )}
    >
      {activeTab === "analytics" ? (
        <DashboardInfoAnalyticsTab
          lang={lang}
          tabTitle={tabLabels.analytics}
          quickInsights={quickInsights}
          snapshot={snapshot}
          dataFetchedLabel={dataFetchedLabel}
          modelTrainedLabel={modelTrainedLabel}
          dataFreshnessLevel={dataFreshnessLevel}
          modelFreshnessLevel={modelFreshnessLevel}
          freshnessLabel={freshnessLabel}
          severityLabel={severityLabel}
        />
      ) : null}

      {activeTab === "aboutModel" ? (
        <DashboardAboutModelTab
          lang={lang}
          tabTitle={tabLabels.aboutModel}
          aboutModel={aboutModel}
          metricGuideTitle={metricGuideTitle}
          metricGuide={metricGuide}
          quickInsights={quickInsights}
          severityLabel={severityLabel}
          onOpenExpertMode={() => onOpenInfo(lruet(lang, "Режим эксперта", "Eksperdireziim", "Expert mode"), expertModeText)}
        />
      ) : null}

      {activeTab === "aboutService" ? (
        <DashboardAboutServiceTab
          lang={lang}
          snapshot={snapshot}
          parameterCards={parameterCards}
        />
      ) : null}
    </DashboardInfoPageOverlay>
  );
}
