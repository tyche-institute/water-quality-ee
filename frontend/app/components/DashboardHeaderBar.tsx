"use client";

import Image from "next/image";
import type { RefObject, ReactNode } from "react";
import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";

type Props = {
  lang: DashboardLang;
  headerCompact: boolean;
  showLangDialog: boolean;
  langMenuOpen: boolean;
  langMenuRef: RefObject<HTMLDivElement | null>;
  aboutModelLabel: string;
  onOpenAboutModel: () => void;
  onChooseLang: (lang: DashboardLang) => void;
  onToggleLangMenu: () => void;
  onSelectLangOption: (lang: DashboardLang) => void;
  renderInfoIcon: () => ReactNode;
  renderGlobeIcon: () => ReactNode;
  renderChevronIcon: () => ReactNode;
  renderCheckIcon: () => ReactNode;
  renderSubtitle: () => ReactNode;
};

export default function DashboardHeaderBar({
  lang,
  headerCompact,
  showLangDialog,
  langMenuOpen,
  langMenuRef,
  aboutModelLabel,
  onOpenAboutModel,
  onChooseLang,
  onToggleLangMenu,
  onSelectLangOption,
  renderInfoIcon,
  renderGlobeIcon,
  renderChevronIcon,
  renderCheckIcon,
  renderSubtitle,
}: Props) {
  return (
    <>
      {showLangDialog ? (
        <div className="langDialogBackdrop">
          <div className="langDialogCard">
            <div className="langDialogAccent" aria-hidden="true">
              <span className="langDialogIcon">💧</span>
            </div>
            <div className="langDialogWelcome mobileOnly">
              <p className="langDialogBrand">H2O Atlas</p>
              <p className="langDialogGreeting">Tere tulemast · Добро пожаловать · Welcome</p>
            </div>
            <p className="langDialogTitle">Choose language</p>
            <p className="langDialogSubtitle">Выберите язык</p>
            <p className="langDialogHint">Keel / Language / Язык</p>
            <div className="langDialogButtons">
              <button className="langBtn" onClick={() => onChooseLang("et")}>
                <span className="langBtnFlag">🇪🇪</span>
                <span className="langBtnLabel">Eesti</span>
              </button>
              <button className="langBtn" onClick={() => onChooseLang("ru")}>
                <span className="langBtnFlag">🇷🇺</span>
                <span className="langBtnLabel">Русский</span>
              </button>
              <button className="langBtn" onClick={() => onChooseLang("en")}>
                <span className="langBtnFlag">🇬🇧</span>
                <span className="langBtnLabel">English</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`topBar unifiedTopBar desktopOnly ${headerCompact ? "compact" : ""}`}>
        <div className="brandBlock unifiedBrandBlock" style={{ display: "flex" }}>
          <Image src="/logo.svg" alt="H2O Atlas logo" className="brandLogo unifiedBrandLogo" width={36} height={36} priority />
          <div className="unifiedBrandText">
            <div className="unifiedBrandTitle">H2O Atlas</div>
            <p className="subtitle unifiedBrandSubtitle">{renderSubtitle()}</p>
          </div>
        </div>
        <div className="topBarControls">
          <button className="btn headerInfoNav headerInfoNavPrimary" onClick={onOpenAboutModel}>
            <span className="headerInfoNavIcon" aria-hidden="true">{renderInfoIcon()}</span>
            {aboutModelLabel}
          </button>
          <div className="headerDivider" aria-hidden="true" />
          <div className="langDropdown" ref={langMenuRef}>
            <button
              type="button"
              className={`btn langDropdownBtn ${langMenuOpen ? "langDropdownBtnOpen" : ""}`}
              onClick={onToggleLangMenu}
              aria-haspopup="listbox"
              aria-expanded={langMenuOpen}
              aria-label={lruet(lang, "Выбрать язык", "Vali keel", "Select language")}
              title={lruet(lang, "Выбрать язык", "Vali keel", "Select language")}
            >
              <span className="langDropdownGlobe" aria-hidden="true">{renderGlobeIcon()}</span>
              <span className="langDropdownCurrent">{lang.toUpperCase()}</span>
              <span className={`langDropdownChevron ${langMenuOpen ? "open" : ""}`} aria-hidden="true">{renderChevronIcon()}</span>
            </button>
            {langMenuOpen ? (
              <div className="langDropdownMenu" role="listbox">
                {(
                  [
                    { code: "et", label: "Eesti", short: "ET" },
                    { code: "en", label: "English", short: "EN" },
                    { code: "ru", label: "Русский", short: "RU" },
                  ] as const
                ).map((option) => (
                  <button
                    key={`lang-opt-${option.code}`}
                    type="button"
                    className={`langDropdownItem ${lang === option.code ? "active" : ""}`}
                    role="option"
                    aria-selected={lang === option.code}
                    onClick={() => onSelectLangOption(option.code)}
                  >
                    <span className="langDropdownItemShort">{option.short}</span>
                    <span className="langDropdownItemLabel">{option.label}</span>
                    {lang === option.code ? <span className="langDropdownItemTick" aria-hidden="true">{renderCheckIcon()}</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
