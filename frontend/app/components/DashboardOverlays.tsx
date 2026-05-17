"use client";

import type { RefObject } from "react";
import DashboardInfoModal from "./DashboardInfoModal";
import DashboardInfoPage from "./DashboardInfoPage";
import DashboardIcon from "./DashboardIcon";
import DashboardInfoRichContent from "./DashboardInfoRichContent";
import type { DashboardFreshnessLevel, DashboardLang } from "../lib/dashboard-types";
import type { FrontendSnapshot } from "../lib/types";
import type { DASHBOARD_TRANSLATIONS } from "../lib/dashboard-translations";

type Props = {
  lang: DashboardLang;
  snapshot: FrontendSnapshot;
  t: (typeof DASHBOARD_TRANSLATIONS)[DashboardLang];
  toast: string | null;
  freshnessBubble: string | null;
  countBubble: { seq: number; text: string } | null;
  infoOpen: boolean;
  infoTitle: string;
  infoText: string;
  infoCloseBtnRef: RefObject<HTMLButtonElement | null>;
  infoPageOpen: boolean;
  infoPageTab: "analytics" | "aboutModel" | "aboutService";
  parameterCards: Parameters<typeof DashboardInfoPage>[0]["parameterCards"];
  quickInsights: Parameters<typeof DashboardInfoPage>[0]["quickInsights"];
  expertModeText: string;
  dataFetchedLabel: string | null;
  modelTrainedLabel: string | null;
  dataFreshnessLevel: DashboardFreshnessLevel;
  modelFreshnessLevel: DashboardFreshnessLevel;
  freshnessLabel: (level: DashboardFreshnessLevel) => string;
  severityLabel: (level: "good" | "warn" | "bad") => string;
  openInfo: (title: string, text: string) => void;
  onCloseInfo: () => void;
  onCloseInfoPage: () => void;
  onSelectInfoPageTab: (tab: "analytics" | "aboutModel" | "aboutService") => void;
};

export default function DashboardOverlays({
  lang,
  snapshot,
  t,
  toast,
  freshnessBubble,
  countBubble,
  infoOpen,
  infoTitle,
  infoText,
  infoCloseBtnRef,
  infoPageOpen,
  infoPageTab,
  parameterCards,
  quickInsights,
  expertModeText,
  dataFetchedLabel,
  modelTrainedLabel,
  dataFreshnessLevel,
  modelFreshnessLevel,
  freshnessLabel,
  severityLabel,
  openInfo,
  onCloseInfo,
  onCloseInfoPage,
  onSelectInfoPageTab,
}: Props) {
  return (
    <>
      {toast ? <div className="toastBanner">{toast}</div> : null}
      {freshnessBubble ? (
        <div className="freshnessBubble" aria-live="polite">
          {freshnessBubble.split("\n").map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      ) : null}
      {countBubble ? (
        <div key={countBubble.seq} className="countBubble" aria-live="polite">
          {countBubble.text}
        </div>
      ) : null}

      <DashboardInfoPage
        lang={lang}
        snapshot={snapshot}
        isOpen={infoPageOpen}
        activeTab={infoPageTab}
        tabLabels={t.tabs}
        closeLabel={t.close}
        parameterCards={parameterCards}
        quickInsights={quickInsights}
        aboutModel={t.aboutModel}
        metricGuideTitle={t.metricGuideTitle}
        metricGuide={t.metricGuide}
        dataFetchedLabel={dataFetchedLabel}
        modelTrainedLabel={modelTrainedLabel}
        dataFreshnessLevel={dataFreshnessLevel}
        modelFreshnessLevel={modelFreshnessLevel}
        freshnessLabel={freshnessLabel}
        severityLabel={severityLabel}
        expertModeText={expertModeText}
        onClose={onCloseInfoPage}
        onSelectTab={onSelectInfoPageTab}
        onOpenInfo={openInfo}
      />

      <DashboardInfoModal
        isOpen={infoOpen}
        title={infoTitle}
        closeLabel={t.close}
        closeButtonRef={infoCloseBtnRef}
        onClose={onCloseInfo}
        renderCloseIcon={() => <DashboardIcon name="close" />}
      >
        <DashboardInfoRichContent text={infoText} />
      </DashboardInfoModal>
    </>
  );
}
