"use client";

import type { ReactNode } from "react";

type TabKey = "analytics" | "aboutModel" | "aboutService";

type Props = {
  isOpen: boolean;
  activeTab: TabKey;
  closeLabel: string;
  tabLabels: Record<TabKey, string>;
  onClose: () => void;
  onSelectTab: (tab: TabKey) => void;
  renderCloseIcon: () => ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export default function DashboardInfoPageOverlay({
  isOpen,
  activeTab,
  closeLabel,
  tabLabels,
  onClose,
  onSelectTab,
  renderCloseIcon,
  footer,
  children,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="infoPageBackdrop" onClick={onClose} role="presentation">
      <div className="infoPageOverlay" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="infoPageHeader">
          <h3 className="infoPageTitle">H2O Atlas</h3>
          <button className="btn btnSmall infoPageCloseBtn" type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel}>
            <span className="btnIcon" aria-hidden="true">{renderCloseIcon()}</span>
          </button>
        </div>
        <div className="infoPageTabRow">
          {(["analytics", "aboutModel", "aboutService"] as TabKey[]).map((tab) => (
            <button key={`ipt-${tab}`} className={`infoPageTab ${activeTab === tab ? "active" : ""}`} onClick={() => onSelectTab(tab)}>
              {tabLabels[tab]}
            </button>
          ))}
        </div>
        <div className="infoPageBody">
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
