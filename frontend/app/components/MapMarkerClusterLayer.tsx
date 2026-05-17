"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { DashboardLang } from "../lib/dashboard-types";
import type { FrontendPlace } from "../lib/types";
import { formatNormRule, getNormRule, isNormViolated } from "../lib/water-rules";

const markerColor = (riskLevel: FrontendPlace["risk_level"]) => {
  if (riskLevel === "high") return "#ef4444";
  if (riskLevel === "medium") return "#f59e0b";
  if (riskLevel === "low") return "#22c55e";
  return "#64748b";
};

function placeKindGlyph(kind: string) {
  if (kind === "swimming") return "🏖";
  if (kind === "pool_spa") return "🏊";
  if (kind === "drinking_water") return "🚰";
  if (kind === "drinking_source") return "💧";
  return "📍";
}

const markerBadgeHtml = (color: string, glyph: string, pulse = false) => `
  <div style="
    position:relative;
    width:44px;
    height:56px;
    filter:drop-shadow(0 4px 10px rgba(0,0,0,0.45));
  ">
    <div style="
      width:44px;height:44px;border-radius:50%;background:${color};
      border:3px solid rgba(255,255,255,0.95);display:flex;align-items:center;
      justify-content:center;font-size:22px;line-height:1;
      ${pulse ? "animation:pinPulse 1.8s ease-in-out infinite;" : ""}
    ">${glyph}</div>
    <div style="
      position:absolute;bottom:0;left:50%;transform:translateX(-50%);
      width:0;height:0;
      border-left:9px solid transparent;border-right:9px solid transparent;
      border-top:14px solid ${color};
    "></div>
  </div>
`;

function markerIcon(place: FrontendPlace) {
  const colorByRisk = markerColor(place.risk_level);
  const fallbackByOfficial =
    place.official_compliant === 1 ? "#22c55e" : place.official_compliant === 0 ? "#ef4444" : "#94a3b8";
  const color = place.model_violation_prob !== null ? colorByRisk : fallbackByOfficial;
  const glyph = placeKindGlyph(place.place_kind);
  const pulse = place.risk_level === "high" && place.model_violation_prob !== null;
  return L.divIcon({
    className: "",
    html: markerBadgeHtml(color, glyph, pulse),
    iconSize: [44, 56],
    iconAnchor: [22, 56],
    popupAnchor: [0, -58],
  });
}

const riskLabel = (riskLevel: FrontendPlace["risk_level"], locale: DashboardLang) => {
  const ru = { low: "низкий", medium: "средний", high: "высокий", unknown: "неизвестно" };
  const et = { low: "madal", medium: "keskmine", high: "kõrge", unknown: "teadmata" };
  const en = { low: "low", medium: "medium", high: "high", unknown: "unknown" };
  return locale === "ru" ? ru[riskLevel] : locale === "et" ? et[riskLevel] : en[riskLevel];
};

const placeKindLabel = (kind: string, locale: DashboardLang) => {
  const ru: Record<string, string> = {
    swimming: "Открытая вода",
    pool_spa: "Бассейн/СПА",
    drinking_water: "Питьевая вода (сеть)",
    drinking_source: "Источник питьевой воды",
  };
  const et: Record<string, string> = {
    swimming: "Avavesi",
    pool_spa: "Bassein/SPA",
    drinking_water: "Joogivesi (võrk)",
    drinking_source: "Joogiveeallikas",
  };
  const en: Record<string, string> = {
    swimming: "Open water",
    pool_spa: "Pool/SPA",
    drinking_water: "Drinking water (network)",
    drinking_source: "Drinking water source",
  };
  return (locale === "ru" ? ru : locale === "et" ? et : en)[kind] || kind;
};

function popupHtml(place: FrontendPlace, locale: DashboardLang) {
  const status =
    place.official_compliant === 1
      ? locale === "ru"
        ? "соответствует"
        : "vastab"
      : place.official_compliant === 0
        ? locale === "ru"
          ? "нарушение"
          : "rikkumine"
        : "n/a";

  const probPct = place.model_violation_prob !== null ? `${(place.model_violation_prob * 100).toFixed(0)}%` : "n/a";
  const measurementRows = Object.entries(place.measurements || {})
    .slice(0, 8)
    .map(([key, value]) => {
      const numericValue = typeof value === "number" ? value : Number(value);
      const rule = getNormRule(key, place.domain);
      const normText = rule ? formatNormRule(rule) : (locale === "ru" ? "нет нормы" : locale === "et" ? "norm puudub" : "no norm");
      const violated = Number.isFinite(numericValue) && rule ? isNormViolated(numericValue, rule) : false;
      return `<tr><td style="padding-right:8px">${key}</td><td><b>${String(value)}</b></td><td style="padding-left:8px;color:${violated ? "#ef4444" : "#64748b"}">${normText}</td></tr>`;
    })
    .join("");
  const violatedRows = Object.entries(place.measurements || {})
    .map(([key, value]) => {
      const numericValue = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numericValue)) return "";
      const rule = getNormRule(key, place.domain);
      if (!rule || !isNormViolated(numericValue, rule)) return "";
      return `<li>${key}: <b>${numericValue}</b> (${locale === "ru" ? "норма" : locale === "et" ? "norm" : "norm"} ${formatNormRule(rule)})</li>`;
    })
    .filter(Boolean)
    .join("");

  return `
    <div style="font-size:13px;line-height:1.35;min-width:250px">
      <div style="font-weight:700;margin-bottom:4px">${place.location}</div>
      <div style="color:#475569">${placeKindLabel(place.place_kind, locale)} · ${place.domain}</div>
      <div style="margin-top:6px">${locale === "ru" ? "Официально" : locale === "et" ? "Ametlik" : "Official"}: <b>${status}</b></div>
      <div>${locale === "ru" ? "Риск" : locale === "et" ? "Risk" : "Risk"}: <b>${riskLabel(place.risk_level, locale)}</b></div>
      <div>${locale === "ru" ? "Вероятность нарушения" : locale === "et" ? "Rikkumise tõenäosus" : "Violation probability"}: <b>${probPct}</b></div>
      <div style="margin-top:4px;color:#475569">${locale === "ru" ? `Это значит: примерно ${probPct} риск нарушения для этой пробы по модели (это не прогноз будущего).` : locale === "et" ? `See tähendab: umbes ${probPct} rikkumisrisk selle proovi jaoks mudeli järgi (see ei ole tuleviku prognoos).` : `This means: about ${probPct} violation risk for this sample according to the model (not a future forecast).`}</div>
      <div style="margin-top:6px;color:#475569">${locale === "ru" ? "Последняя проба" : locale === "et" ? "Viimane proov" : "Latest sample"}: ${place.sample_date || "n/a"}</div>
      ${
        measurementRows
          ? `<div style="margin-top:6px"><div style="font-weight:600;margin-bottom:2px">${locale === "ru" ? "Показатели (со справкой по нормам)" : locale === "et" ? "Näitajad (normi viitega)" : "Measurements (with norm reference)"}</div><table>${measurementRows}</table></div>`
          : ""
      }
      ${
        place.official_compliant === 0
          ? `<div style="margin-top:6px"><div style="font-weight:600;margin-bottom:2px;color:#ef4444">${locale === "ru" ? "Причина нарушения" : locale === "et" ? "Rikkumise põhjus" : "Violation reason"}</div>${
              violatedRows
                ? `<ul style="margin:0;padding-left:16px">${violatedRows}</ul>`
                : `<div style="color:#64748b">${locale === "ru" ? "По текущим экспортированным показателям явное превышение не найдено." : locale === "et" ? "Praeguste eksporditud näitajate põhjal selget ületust ei leitud." : "No explicit exceedance found in currently exported measurements."}</div>`
            }</div>`
          : ""
      }
    </div>
  `;
}

function clusterColor(avg: number | null) {
  if (avg === null) return "#94a3b8";
  if (avg >= 0.7) return "#ef4444";
  if (avg >= 0.4) return "#f59e0b";
  return "#22c55e";
}

type ClusterLike = {
  getAllChildMarkers: () => Array<L.Marker & { options: L.MarkerOptions & { place?: FrontendPlace } }>;
  getChildCount: () => number;
  spiderfy: () => void;
};

type Props = {
  places: FrontendPlace[];
  locale: DashboardLang;
  onSelectPoint?: (id: string) => void;
  onSelectCluster?: (ids: string[]) => void;
  disableHoverPopups?: boolean;
  isFullscreen?: boolean;
  isMobile?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function MapMarkerClusterLayer({
  places,
  locale,
  onSelectPoint,
  onSelectCluster,
  disableHoverPopups = false,
  isFullscreen = false,
  isMobile = false,
}: Props) {
  const map = useMap();
  const [clusterReady, setClusterReady] = useState(false);

  useEffect(() => {
    let alive = true;
    import("leaflet.markercluster")
      .then(() => {
        if (alive) setClusterReady(true);
      })
      .catch(() => {
        if (alive) setClusterReady(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!clusterReady) return;
    const markerClusterFactory = (L as unknown as { markerClusterGroup: (opts: unknown) => L.LayerGroup }).markerClusterGroup;
    const group = markerClusterFactory({
      chunkedLoading: true,
      spiderfyOnMaxZoom: false,
      spiderfyDistanceMultiplier: 1.35,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: unknown) => {
        const currentCluster = cluster as ClusterLike;
        const children = currentCluster.getAllChildMarkers();
        const probs = children
          .map((marker) => marker.options?.place?.model_violation_prob)
          .filter((value: unknown): value is number => typeof value === "number");
        const avg = probs.length ? probs.reduce((a, b) => a + b, 0) / probs.length : null;
        const color = clusterColor(avg);
        const count = currentCluster.getChildCount();
        const size = count > 99 ? 52 : count > 9 ? 48 : 44;
        return L.divIcon({
          html: `<div style="background:${color};color:#fff;border-radius:999px;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,0.95);font-weight:700;font-size:${count > 99 ? 13 : 15}px;box-shadow:0 3px 12px rgba(0,0,0,0.35)">${count}</div>`,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    (group as L.LayerGroup & { on: (event: string, fn: (event: unknown) => void) => void }).on("clusterclick", (event: unknown) => {
      const currentZoom = map.getZoom();
      const maxZoom = map.getMaxZoom() || 15;
      const clusterEvent = event as { layer: ClusterLike };
      const children = clusterEvent.layer.getAllChildMarkers();
      const allSameCoord = children.length > 1 && children.every((marker) => {
        const latLng = marker.getLatLng();
        const first = children[0].getLatLng();
        return latLng.lat === first.lat && latLng.lng === first.lng;
      });

      if (currentZoom >= maxZoom || allSameCoord) {
        if (isFullscreen) {
          clusterEvent.layer.spiderfy();
        } else if (onSelectCluster) {
          const ids = children
            .map((marker) => marker.options?.place?.id)
            .filter((id): id is string => Boolean(id));
          onSelectCluster(ids);
          const at = children[0].getLatLng();
          const hint =
            locale === "ru"
              ? `${ids.length} точек здесь — выберите на панели →`
              : locale === "et"
                ? `${ids.length} punkti siin — vali paneelilt →`
                : `${ids.length} points here — pick one on the panel →`;
          L.popup({
            autoClose: true,
            closeOnClick: true,
            closeButton: false,
            className: "clusterHintPopup",
            offset: L.point(0, -8),
          })
            .setLatLng(at)
            .setContent(`<div class="clusterHintPopupInner">${hint}</div>`)
            .openOn(map);
        }
      }
    });

    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lon], {
        icon: markerIcon(place),
        place,
      } as L.MarkerOptions & { place: FrontendPlace });

      if (disableHoverPopups && !isMobile) {
        marker.bindPopup(
          `<div class="placePinMiniPopup">${escapeHtml(place.location)}</div>`,
          {
            maxWidth: 280,
            minWidth: 80,
            autoPan: true,
            closeButton: false,
            autoClose: true,
            closeOnClick: true,
            offset: L.point(0, -4),
            className: "placePinMiniPopupWrapper",
            autoPanPaddingTopLeft: L.point(20, 110),
            autoPanPaddingBottomRight: L.point(20, 80),
          }
        );
      }

      if (!disableHoverPopups) {
        marker.bindPopup(popupHtml(place, locale), {
          maxWidth: 360,
          autoPan: true,
          autoPanPaddingTopLeft: L.point(20, 220),
          autoPanPaddingBottomRight: L.point(90, 110),
        });

        let closeTimer: ReturnType<typeof setTimeout> | null = null;
        const cancelClose = () => {
          if (closeTimer !== null) {
            clearTimeout(closeTimer);
            closeTimer = null;
          }
        };
        const scheduleClose = () => {
          cancelClose();
          closeTimer = setTimeout(() => {
            marker.closePopup();
          }, 150);
        };

        marker.on("mouseover", () => {
          cancelClose();
          marker.openPopup();
        });
        marker.on("mouseout", scheduleClose);
        marker.on("popupopen", () => {
          const element = marker.getPopup()?.getElement();
          if (!element) return;
          element.removeEventListener("mouseenter", cancelClose);
          element.removeEventListener("mouseleave", scheduleClose);
          element.addEventListener("mouseenter", cancelClose);
          element.addEventListener("mouseleave", scheduleClose);
        });
      }

      marker.on("click", () => {
        onSelectPoint?.(place.id);
        marker.openPopup();
      });
      (group as L.LayerGroup).addLayer(marker);
    });

    map.addLayer(group as L.Layer);
    return () => {
      map.removeLayer(group as L.Layer);
    };
  }, [clusterReady, disableHoverPopups, isFullscreen, isMobile, locale, map, onSelectCluster, onSelectPoint, places]);

  return null;
}
