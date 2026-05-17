"use client";

import ShareButtons from "./ShareButtons";
import type { DashboardLang } from "../lib/dashboard-types";
import { riskLabelForLang } from "../lib/dashboard-labels";
import { buildPlaceUncertaintyNotice } from "../lib/dashboard-uncertainty";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendPlace } from "../lib/types";

type Props = {
  lang: DashboardLang;
  place: FrontendPlace;
  canonicalModel: string | null | undefined;
  countyPretty: (value: string | null | undefined) => string;
  fmtDate: (value: string | null) => string;
  officialStatusText: (value: number | null) => string;
  explainViolation: (place: FrontendPlace) => string;
  openInfo: (title: string, body: string) => void;
};

export default function DashboardSelectedPlaceSummary({
  lang,
  place,
  canonicalModel,
  countyPretty,
  fmtDate,
  officialStatusText,
  explainViolation,
  openInfo,
}: Props) {
  const uncertaintyNotice = buildPlaceUncertaintyNotice(lang, place);
  const riskBadgeTone =
    place.risk_level === "high" ? "bad" : place.risk_level === "medium" ? "warn" : "good";
  const riskLabelText = lruet(lang, "Риск", "Risk", "Risk");
  const riskPct =
    place.model_violation_prob !== null
      ? `${Math.round(place.model_violation_prob * 100)}%`
      : null;
  const riskTooltip = canonicalModel
    ? `${riskLabelText} · ${canonicalModel}`
    : riskLabelText;

  return (
    <div className="panel reportPanel">
      <h4>{place.location}</h4>
      <div className="pointCardMeta">
        <span className="pointMetaTag">{place.domain} / {place.place_kind}</span>
        <span className="pointMetaTag">{countyPretty(place.county || "Unknown")}</span>
      </div>
      <div className="pointCardRow" data-trust-order="sample-date">
        <span className="pointCardLabel">{lruet(lang, "Последняя проба", "Viimane proov", "Latest sample")}</span>
        <span>{fmtDate(place.sample_date)}</span>
      </div>
      <div className="pointCardStatusStack">
        <div className="pointStatusCard" data-trust-order="official-status">
          <div className="pointStatusValue">
            {place.official_compliant === 1 ? (
              <span className="badge good">{officialStatusText(1)}</span>
            ) : place.official_compliant === 0 ? (
              <button
                className="linkBtn badge bad clickableBadge"
                onClick={() =>
                  openInfo(
                    lruet(lang, "Официальное нарушение", "Ametlik rikkumine", "Official violation"),
                    explainViolation(place),
                  )
                }
              >
                {officialStatusText(0)}
              </button>
            ) : (
              <span className="badge warn">n/a</span>
            )}
            {riskPct ? (
              <span
                className={`badge ${riskBadgeTone} pointRiskBadge`}
                title={riskTooltip}
                aria-label={riskTooltip}
              >
                {riskLabelText} {riskPct} {riskLabelForLang(lang, place.risk_level)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {uncertaintyNotice ? (
        <div className={`pointCardNotice ${uncertaintyNotice.level === "bad" ? "pointCardNoticeBad" : "pointCardNoticeWarn"}`}>
          <strong>{uncertaintyNotice.summary}</strong>
          <br />
          {uncertaintyNotice.detail}
        </div>
      ) : null}
      <ShareButtons
        placeId={place.id}
        placeName={place.location}
        county={place.county}
        lang={lang}
      />
      <div className="pointCardModels pointCardModelsBottom">
        {([
          ["LR", place.lr_violation_prob, lruet(lang, "Logistic Regression — линейная вероятностная модель", "Logistic Regression — lineaarne tõenäosusmudel", "Logistic Regression — linear probability model")],
          ["RF", place.rf_violation_prob, lruet(lang, "Random Forest — ансамбль деревьев", "Random Forest — puuansambel", "Random Forest — ensemble of decision trees")],
          ["GB", place.gb_violation_prob, lruet(lang, "Gradient Boosting — деревья последовательно исправляют ошибки", "Gradient Boosting — puud parandavad järjest vigu", "Gradient Boosting — trees sequentially correct errors")],
          ["LGBM", place.lgbm_violation_prob, lruet(lang, "LightGBM — быстрый boosting на деревьях", "LightGBM — kiire puupohine boosting", "LightGBM — fast histogram-based gradient boosting")],
        ] as [string, number | null, string][]).map(([abbr, prob, tip]) => {
          const fullName =
            abbr === "LR" ? "Logistic Regression"
            : abbr === "RF" ? "Random Forest"
            : abbr === "GB" ? "Gradient Boosting"
            : "LightGBM";
          const isCanonical = canonicalModel === fullName;
          const band =
            typeof prob === "number"
              ? prob >= 0.7 ? "bad" : prob >= 0.4 ? "warn" : "good"
              : null;
          const chipCls = [
            "modelChip",
            band ? `modelChip${band.charAt(0).toUpperCase()}${band.slice(1)}` : "",
            isCanonical ? "modelChipCanonical" : "",
          ].filter(Boolean).join(" ");
          return (
            <span
              key={abbr}
              className={chipCls}
              data-tooltip={tip}
              title={tip}
              tabIndex={0}
            >
              {abbr} <b>{typeof prob === "number" ? prob.toFixed(2) : "–"}</b>
            </span>
          );
        })}
      </div>
    </div>
  );
}
