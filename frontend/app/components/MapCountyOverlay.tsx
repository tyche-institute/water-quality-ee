"use client";

import { useCallback } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { DashboardLang } from "../lib/dashboard-types";
import { countyFeatureName as geoCountyFeatureName, countyNameNorm as geoCountyNameNorm } from "../lib/geo";

type Props = {
  countyGeoJson: GeoJSON.GeoJsonObject | null;
  selectedCounty: string | null;
  countyRisk: Map<string, number>;
  countySampleCount: Map<string, number>;
  locale: DashboardLang;
  onSelectCounty?: (county: string) => void;
};

const countyFeatureName = geoCountyFeatureName;
const countyNameNorm = geoCountyNameNorm;

export default function MapCountyOverlay({
  countyGeoJson,
  selectedCounty,
  countyRisk,
  countySampleCount,
  locale,
  onSelectCounty,
}: Props) {
  const countyStyle = useCallback((feature?: GeoJSON.Feature) => {
    const countyName = countyFeatureName(feature);
    const avg = countyRisk.get(countyName);
    let fill = "#243249";
    if (typeof avg === "number") {
      if (avg >= 0.7) fill = "#ef4444";
      else if (avg >= 0.4) fill = "#f59e0b";
      else fill = "#22c55e";
    }
    const selected = selectedCounty && countyNameNorm(countyName) === selectedCounty;
    return {
      color: "#64748b",
      weight: selected ? 2.5 : 1,
      fillColor: fill,
      fillOpacity: selected ? 0.3 : 0.16,
    };
  }, [countyRisk, selectedCounty]);

  const onEachCounty = useCallback((feature: GeoJSON.Feature, layer: L.Layer) => {
    const countyName = countyFeatureName(feature);
    const avg = countyRisk.get(countyName);
    const nSamples = countySampleCount.get(countyName) ?? 0;
    const bandLabel =
      typeof avg !== "number"
        ? locale === "ru"
          ? "нет данных модели"
          : locale === "et"
            ? "mudeli andmeid pole"
            : "no model data"
        : avg >= 0.7
          ? locale === "ru"
            ? "высокий"
            : locale === "et"
              ? "kõrge"
              : "high"
          : avg >= 0.4
            ? locale === "ru"
              ? "средний"
              : locale === "et"
                ? "keskmine"
                : "medium"
            : locale === "ru"
              ? "низкий"
              : locale === "et"
                ? "madal"
                : "low";
    const riskLine = typeof avg === "number" ? `${(avg * 100).toFixed(0)}% — ${bandLabel}` : bandLabel;
    const samplesLabelText =
      locale === "ru" ? "проб с моделью" : locale === "et" ? "mudeliga proove" : "samples with model";
    const riskLabelText =
      locale === "ru" ? "Средний риск" : locale === "et" ? "Keskmine risk" : "Avg risk";
    const tooltipHtml = `
      <div style="font-size:12px;line-height:1.35">
        <div style="font-weight:700;margin-bottom:2px">${countyName}</div>
        <div style="color:#475569">${riskLabelText}: <b>${riskLine}</b></div>
        <div style="color:#64748b">${nSamples} ${samplesLabelText}</div>
      </div>
    `;
    layer.bindTooltip(tooltipHtml, {
      sticky: true,
      direction: "top",
      opacity: 0.96,
      className: "countyRiskTooltip",
    });
    layer.on("click", () => {
      if (!countyName) return;
      onSelectCounty?.(countyName);
    });
  }, [countyRisk, countySampleCount, locale, onSelectCounty]);

  if (!countyGeoJson) return null;

  return <GeoJSON data={countyGeoJson} style={countyStyle} onEachFeature={onEachCounty} />;
}
