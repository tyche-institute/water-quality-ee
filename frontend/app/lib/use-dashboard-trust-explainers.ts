"use client";

import { useCallback } from "react";
import {
  explainHistoryMeasurementsText,
  explainMeasurementNormText,
  explainViolationFromMeasurementsText,
} from "./dashboard-explainers";
import type { DashboardLang } from "./dashboard-types";
import type { FrontendPlace } from "./types";
import { assessNorm, formatNormRule, getNormRule } from "./water-rules";
import { lruet } from "./dashboard-utils";

export function useDashboardTrustExplainers({
  lang,
  fmtDate,
  labelForParam,
  descForParam,
  historyMeasurements,
}: {
  lang: DashboardLang;
  fmtDate: (value: string | null) => string;
  labelForParam: (key: string) => string;
  descForParam: (key: string) => string;
  historyMeasurements: (place: FrontendPlace, idx: number) => Record<string, number>;
}) {
  const formatNum = useCallback((value: number) => Number(value.toFixed(3)).toString(), []);

  const normLabel = useCallback((rule: NonNullable<ReturnType<typeof getNormRule>>) => {
    const text = formatNormRule(rule, formatNum);
    if (typeof rule.exact === "number") return `${lruet(lang, "ровно", "täpselt", "exactly")} ${text.replace(/^= /, "")}`;
    return text;
  }, [formatNum, lang]);

  const explainMeasurementNorm = useCallback((param: string, rawValue: number | string, place: FrontendPlace) => {
    return explainMeasurementNormText({
      lang,
      param,
      rawValue,
      place,
      descForParam,
      getNormRule,
      assessNorm,
      normLabel,
      formatNum,
    });
  }, [descForParam, formatNum, lang, normLabel]);

  const explainViolationFromMeasurements = useCallback((domain: string, measurements: Record<string, number>) => {
    return explainViolationFromMeasurementsText({
      lang,
      domain,
      measurements,
      labelForParam,
      assessNorm,
      normLabel,
      formatNum,
    });
  }, [formatNum, labelForParam, lang, normLabel]);

  const explainViolation = useCallback((place: FrontendPlace) => {
    return explainViolationFromMeasurements(place.domain, place.measurements || {});
  }, [explainViolationFromMeasurements]);

  const explainHistoryMeasurements = useCallback((place: FrontendPlace, idx: number) => {
    return explainHistoryMeasurementsText({
      lang,
      place,
      idx,
      fmtDate,
      labelForParam,
      historyMeasurements,
    });
  }, [fmtDate, historyMeasurements, labelForParam, lang]);

  return {
    explainMeasurementNorm,
    explainViolationFromMeasurements,
    explainViolation,
    explainHistoryMeasurements,
  };
}
