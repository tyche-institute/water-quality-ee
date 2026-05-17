import type { DashboardFreshnessLevel } from "./dashboard-types";

export type FreshnessSummary = {
  level: DashboardFreshnessLevel;
  ageDays: number | null;
};

function toMillis(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? null : ms;
}

export function summarizeFreshness(
  raw: string | null | undefined,
  thresholds: { agingDays: number; staleDays: number },
): FreshnessSummary {
  const ts = toMillis(raw);
  if (ts === null) return { level: "unknown", ageDays: null };
  const ageDays = Math.floor((Date.now() - ts) / 86400000);
  if (ageDays >= thresholds.staleDays) return { level: "stale", ageDays };
  if (ageDays >= thresholds.agingDays) return { level: "aging", ageDays };
  return { level: "fresh", ageDays };
}
