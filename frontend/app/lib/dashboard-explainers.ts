import type { DashboardLang } from "./dashboard-types";
import { lruet } from "./dashboard-utils";
import type { FrontendPlace } from "./types";

export function explainMeasurementNormText({
  lang,
  param,
  rawValue,
  place,
  descForParam,
  getNormRule,
  assessNorm,
  normLabel,
  formatNum,
}: {
  lang: DashboardLang;
  param: string;
  rawValue: number | string;
  place: FrontendPlace;
  descForParam: (key: string) => string;
  getNormRule: (param: string, domain: string) => { unit: string } | null;
  assessNorm: (param: string, value: number, domain: string) => { violated: boolean | null };
  normLabel: (rule: { unit: string }) => string;
  formatNum: (value: number) => string;
}): string {
  const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue);
  const hasNumeric = Number.isFinite(numericValue);
  const base = descForParam(param);
  const rule = getNormRule(param, place.domain);
  if (!rule || !hasNumeric) {
    return `${base}\n\n${
      lruet(
        lang,
        "Для этого параметра в текущем домене в интерфейсе нет числового норматива.",
        "Selle näitaja jaoks pole antud domeenis liideses numbrilist normi.",
        "No numeric threshold is configured in the UI for this parameter in the current domain."
      )
    }`;
  }
  const verdict = assessNorm(param, numericValue, place.domain).violated;
  const verdictText =
    verdict === null
      ? lruet(lang, "Оценка по норме недоступна.", "Normi hinnang pole saadaval.", "Norm-based evaluation is unavailable.")
      : verdict
        ? lruet(lang, "Статус: ВЫХОД ЗА НОРМУ.", "Staatus: NORMIST VÄLJAS.", "Status: ABOVE THRESHOLD.")
        : lruet(lang, "Статус: в пределах нормы.", "Staatus: normi piires.", "Status: within threshold.");

  return `${base}\n\n${
    lruet(lang, "Норматив для этого домена", "Selle domeeni norm", "Norm for this domain")
  }: ${normLabel(rule)}\n${
    lruet(lang, "Фактическое значение", "Tegelik väärtus", "Actual value")
  }: ${formatNum(numericValue)} ${rule.unit}\n${verdictText}`;
}

export function explainViolationFromMeasurementsText({
  lang,
  domain,
  measurements,
  labelForParam,
  assessNorm,
  normLabel,
  formatNum,
}: {
  lang: DashboardLang;
  domain: string;
  measurements: Record<string, number>;
  labelForParam: (param: string) => string;
  assessNorm: (param: string, value: number, domain: string) => { rule: { unit: string } | null; violated: boolean | null };
  normLabel: (rule: { unit: string }) => string;
  formatNum: (value: number) => string;
}): string {
  const entries = Object.entries(measurements || {});
  const unknownNormParams: string[] = [];
  const violations = entries
    .map(([param, value]) => {
      const numericValue = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numericValue)) return null;
      const assessed = assessNorm(param, numericValue, domain);
      if (!assessed.rule) {
        unknownNormParams.push(labelForParam(param));
        return null;
      }
      if (assessed.violated !== true) return null;
      return `- ${labelForParam(param)}: ${formatNum(numericValue)} ${assessed.rule.unit} (${lruet(lang, "норма", "norm", "norm")} ${normLabel(assessed.rule)})`;
    })
    .filter((x): x is string => Boolean(x));

  if (violations.length === 0) {
    const noMeasurements = entries.length === 0;
    const unknownPart =
      unknownNormParams.length > 0
        ? `\n${lruet(lang, "Параметры без встроенной нормы", "Parameetrid ilma sisseehitatud normita", "Parameters without built-in norm")}: ${unknownNormParams.slice(0, 6).join(", ")}${unknownNormParams.length > 6 ? "..." : ""}.`
        : "";
    return lruet(
      lang,
      `${noMeasurements ? "Для этой пробы в snapshot нет измерений, поэтому конкретный нарушенный параметр не определён." : "Официально отмечено нарушение, но среди доступных измерений нет явного выхода за встроенные пороги."}\nВозможны отсутствующие показатели, другие нормативы (по типу объекта) или ручная классификация инспектором.${unknownPart}`,
      `${noMeasurements ? "Selle proovi mõõtmised puuduvad snapshotis, seega rikkunud parameetrit ei saa määrata." : "Ametlik rikkumine on märgitud, kuid saadaolevates mõõtmistes ei leitud selget ületust sisseehitatud normide järgi."}${unknownPart}`,
      `${noMeasurements ? "No measurements are exported in snapshot for this sample, so a specific violated parameter cannot be determined." : "Official violation is marked, but available measurements show no explicit exceedance against built-in thresholds."} Missing indicators, other domain-specific norms, or manual inspector classification are possible.${unknownPart}`
    );
  }

  return `${lruet(lang, "Нарушены следующие параметры", "Rikutud parameetrid", "Violated parameters")}:\n${violations.join("\n")}`;
}

export function historyMeasurementsForPlace(place: FrontendPlace, idx: number, fmtDate: (value: string | null) => string): Record<string, number> {
  const item = place.sample_history?.[idx];
  if (!item) return {};
  const direct = item.measurements || {};
  if (Object.keys(direct).length > 0) return direct;

  const itemDay = fmtDate(item.sample_date);
  const currentDay = fmtDate(place.sample_date);
  if (itemDay !== "n/a" && currentDay !== "n/a" && itemDay === currentDay) {
    const current = place.measurements || {};
    if (Object.keys(current).length > 0) return current;
  }

  const sibling = (place.sample_history || []).find(
    (historyItem) => fmtDate(historyItem.sample_date) === itemDay && historyItem.measurements && Object.keys(historyItem.measurements).length > 0
  );
  return sibling?.measurements || {};
}

export function explainHistoryMeasurementsText({
  lang,
  place,
  idx,
  fmtDate,
  labelForParam,
  historyMeasurements,
}: {
  lang: DashboardLang;
  place: FrontendPlace;
  idx: number;
  fmtDate: (value: string | null) => string;
  labelForParam: (param: string) => string;
  historyMeasurements: (place: FrontendPlace, idx: number) => Record<string, number>;
}): string {
  const item = place.sample_history?.[idx];
  if (!item) return lruet(lang, "Запись истории не найдена.", "Ajaloo kirjet ei leitud.", "History record not found.");
  const rows = Object.entries(historyMeasurements(place, idx))
    .slice(0, 30)
    .map(([key, value]) => `- ${labelForParam(key)}: ${String(value)}`)
    .join("\n");
  if (!rows) return lruet(lang, "Для этой исторической пробы нет экспортированных измерений.", "Selle ajaloolise proovi mõõtmisi pole eksporditud.", "No exported measurements for this historical sample.");
  return `${lruet(lang, "Проба", "Proov", "Sample")}: ${fmtDate(item.sample_date)}\n${lruet(lang, "Показатели воды", "Vee näitajad", "Water measurements")}:\n${rows}`;
}
