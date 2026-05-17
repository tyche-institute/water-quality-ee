#!/usr/bin/env python3
"""Generate a lightweight operational review from Cloudflare KV analytics counters."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Any, NamedTuple
from urllib import error, parse, request

import tomllib


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WRANGLER_CONFIG = ROOT / "analytics-worker" / "wrangler.toml"
NODE20_BIN = "/tmp/node20/node-v20.20.2-linux-x64/bin"
DEFAULT_XDG_CONFIG_HOME = "/home/anton/.config"
DEFAULT_ACCOUNT_ID = "0ebf237b8b0470f2beea23f911712f01"
EVENT_NAMES = [
    "dashboard_open",
    "filters_changed",
    "place_selected",
    "watchlist_toggled",
    "history_toggled",
    "measurements_toggled",
    "info_opened",
    "share_click",
    "verify_page_open",
    "verify_attempt",
    "verify_result",
    "data_gap_notice_impression",
    "data_gap_notice_dismissed",
    "signed_badge_click",
    "web_vital",
]
KPI_THRESHOLDS = {
    "min_dashboard_opens": 25,
    "min_place_select_rate_pct": 20.0,
    "min_verify_attempt_rate_pct": 25.0,
    "min_share_rate_pct": 3.0,
    "min_history_open_rate_pct": 10.0,
    "min_measurements_open_rate_pct": 10.0,
}


class DailyAnalytics(NamedTuple):
    day: str
    counts: dict[str, int]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=7, help="Number of trailing UTC days to review.")
    parser.add_argument(
        "--namespace-id",
        help="Explicit Cloudflare KV namespace id. Defaults to analytics-worker/wrangler.toml.",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_WRANGLER_CONFIG,
        help="Path to wrangler.toml used to resolve the namespace id.",
    )
    parser.add_argument(
        "--account-id",
        default=os.environ.get("CLOUDFLARE_ACCOUNT_ID", DEFAULT_ACCOUNT_ID),
        help="Cloudflare account id used for direct KV API reads.",
    )
    parser.add_argument("--preview", action="store_true", help="Use preview_id from wrangler.toml.")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON instead of text.")
    parser.add_argument("--markdown", action="store_true", help="Emit a markdown weekly-review format.")
    return parser.parse_args()


def load_namespace_id(config_path: Path, preview: bool) -> str:
    data = tomllib.loads(config_path.read_text(encoding="utf-8"))
    namespaces = data.get("kv_namespaces") or []
    if not namespaces:
        raise ValueError(f"No kv_namespaces found in {config_path}")
    namespace = namespaces[0]
    key = "preview_id" if preview else "id"
    value = namespace.get(key)
    if not value or not isinstance(value, str):
        raise ValueError(f"Missing {key} in {config_path}")
    return value


def load_oauth_token() -> str | None:
    xdg_config_home = Path(os.environ.get("XDG_CONFIG_HOME", DEFAULT_XDG_CONFIG_HOME))
    config_path = xdg_config_home / ".wrangler" / "config" / "default.toml"
    if not config_path.is_file():
        return None
    data = tomllib.loads(config_path.read_text(encoding="utf-8"))
    token = data.get("oauth_token")
    if isinstance(token, str) and token:
        return token
    return None


def api_fetch_kv_text(key: str, namespace_id: str, account_id: str, token: str) -> str | None:
    if not token:
        return None

    encoded_key = parse.quote(key, safe="")
    url = (
        "https://api.cloudflare.com/client/v4/accounts/"
        f"{account_id}/storage/kv/namespaces/{namespace_id}/values/{encoded_key}"
    )
    req = request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        with request.urlopen(req, timeout=30) as response:
            body = response.read().decode("utf-8").strip()
            return body or None
    except error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise RuntimeError(f"Cloudflare KV API read failed for {key!r}: {exc.code}") from exc


def _wrangler_candidates() -> list[list[str]]:
    candidates: list[list[str]] = []
    discovered = [
        ["wrangler"],
        ["npx", "wrangler"],
        ["/tmp/node20/node-v20.20.2-linux-x64/bin/wrangler"],
        ["/tmp/node20/node-v20.20.2-linux-x64/bin/npx", "wrangler"],
    ]
    for base in discovered:
        if Path(base[0]).is_file() or shutil.which(base[0]):
            candidates.append(base)
    return candidates


def fetch_kv_text(key: str, namespace_id: str, account_id: str) -> str | None:
    oauth_token = load_oauth_token()
    if oauth_token:
        return api_fetch_kv_text(key, namespace_id, account_id, oauth_token)

    last_error = ""
    env = dict(os.environ)
    env["PATH"] = f"{NODE20_BIN}:{env.get('PATH', '')}"
    env.setdefault("XDG_CONFIG_HOME", DEFAULT_XDG_CONFIG_HOME)
    for base in _wrangler_candidates():
        cmd = [
            *base,
            "kv",
            "key",
            "get",
            key,
            "--namespace-id",
            namespace_id,
            "--remote",
            "--text",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=False, env=env)
        if result.returncode == 0:
            value = result.stdout.strip()
            return value or None
        stderr = result.stderr.strip()
        lowered = stderr.lower()
        if "not found" in lowered or "does not exist" in lowered or "404" in lowered:
            return None
        last_error = stderr or result.stdout.strip()
    raise RuntimeError(f"Unable to read KV key {key!r}: {last_error or 'wrangler unavailable'}")


def fetch_count(day: str, metric: str, namespace_id: str, account_id: str) -> int:
    raw = fetch_kv_text(f"events:{day}:{metric}", namespace_id, account_id)
    if raw is None:
        return 0
    return int(raw)


def build_daily_analytics(
    days: int,
    namespace_id: str,
    account_id: str,
    today: date | None = None,
) -> list[DailyAnalytics]:
    anchor = today or datetime.now(UTC).date()
    series: list[DailyAnalytics] = []
    for offset in range(days - 1, -1, -1):
        day = anchor - timedelta(days=offset)
        day_key = day.isoformat()
        counts = {"total": fetch_count(day_key, "total", namespace_id, account_id)}
        for event_name in EVENT_NAMES:
            counts[event_name] = fetch_count(day_key, event_name, namespace_id, account_id)
        series.append(DailyAnalytics(day=day_key, counts=counts))
    return series


def _safe_rate(numerator: int, denominator: int) -> float | None:
    if denominator <= 0:
        return None
    return round((numerator / denominator) * 100, 2)


def summarize(series: list[DailyAnalytics]) -> dict[str, Any]:
    totals = {"total": 0}
    for event_name in EVENT_NAMES:
        totals[event_name] = 0
    for day in series:
        for key, value in day.counts.items():
            totals[key] = totals.get(key, 0) + value

    derived = {
        "place_select_rate_pct": _safe_rate(totals["place_selected"], totals["dashboard_open"]),
        "verify_attempt_rate_pct": _safe_rate(totals["verify_attempt"], totals["verify_page_open"]),
        "share_rate_pct": _safe_rate(totals["share_click"], totals["place_selected"]),
        "history_open_rate_pct": _safe_rate(totals["history_toggled"], totals["place_selected"]),
        "measurements_open_rate_pct": _safe_rate(totals["measurements_toggled"], totals["place_selected"]),
        "signed_badge_click_rate_pct": _safe_rate(totals["signed_badge_click"], totals["place_selected"]),
        "data_gap_dismiss_rate_pct": _safe_rate(
            totals["data_gap_notice_dismissed"], totals["data_gap_notice_impression"]
        ),
    }

    findings = build_findings(totals, derived)
    recommendations = build_recommendations(findings)

    return {
        "window_days": len(series),
        "start_day": series[0].day if series else None,
        "end_day": series[-1].day if series else None,
        "totals": totals,
        "derived": derived,
        "findings": findings,
        "recommendations": recommendations,
        "daily": [{"day": entry.day, "counts": entry.counts} for entry in series],
    }


def format_text(summary: dict[str, Any]) -> str:
    totals = summary["totals"]
    derived = summary["derived"]
    lines = [
        f"Analytics review window: {summary['start_day']} -> {summary['end_day']} ({summary['window_days']} days)",
        "",
        "Core counters:",
        f"- total events: {totals['total']}",
        f"- dashboard opens: {totals['dashboard_open']}",
        f"- place selected: {totals['place_selected']}",
        f"- verify page opens: {totals['verify_page_open']}",
        f"- verify attempts: {totals['verify_attempt']}",
        f"- verify results: {totals['verify_result']}",
        f"- signed badge clicks: {totals['signed_badge_click']}",
        f"- history opens: {totals['history_toggled']}",
        f"- measurements opens: {totals['measurements_toggled']}",
        f"- share clicks: {totals['share_click']}",
        "",
        "Derived rates:",
        f"- place selection after dashboard open: {format_rate(derived['place_select_rate_pct'])}",
        f"- verify attempts after verify page open: {format_rate(derived['verify_attempt_rate_pct'])}",
        f"- share clicks after place selection: {format_rate(derived['share_rate_pct'])}",
        f"- history opens after place selection: {format_rate(derived['history_open_rate_pct'])}",
        f"- measurements opens after place selection: {format_rate(derived['measurements_open_rate_pct'])}",
        f"- signed badge clicks after place selection: {format_rate(derived['signed_badge_click_rate_pct'])}",
        f"- data-gap dismissals after impression: {format_rate(derived['data_gap_dismiss_rate_pct'])}",
        "",
        "Findings:",
    ]
    for finding in summary["findings"]:
        lines.append(f"- [{finding['severity'].upper()}] {finding['message']}")
    lines.extend(
        [
            "",
            "Recommended actions:",
        ]
    )
    for recommendation in summary["recommendations"]:
        lines.append(f"- {recommendation}")
    lines.extend(
        [
            "",
        "Daily totals:",
        ]
    )
    for day in summary["daily"]:
        counts = day["counts"]
        lines.append(
            f"- {day['day']}: total={counts['total']}, dashboard={counts['dashboard_open']}, "
            f"place={counts['place_selected']}, verify_open={counts['verify_page_open']}, "
            f"verify_attempt={counts['verify_attempt']}, share={counts['share_click']}"
        )
    return "\n".join(lines)


def format_rate(value: float | None) -> str:
    return "n/a" if value is None else f"{value:.2f}%"


def build_findings(totals: dict[str, int], derived: dict[str, float | None]) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []

    if totals["dashboard_open"] < KPI_THRESHOLDS["min_dashboard_opens"]:
        findings.append(
            {
                "severity": "info",
                "message": "Traffic volume is still too low for confident product conclusions.",
            }
        )

    place_rate = derived["place_select_rate_pct"]
    if place_rate is None:
        findings.append(
            {"severity": "warning", "message": "No dashboard-to-place funnel yet; selection behavior is absent."}
        )
    elif place_rate < KPI_THRESHOLDS["min_place_select_rate_pct"]:
        findings.append(
            {
                "severity": "warning",
                "message": "Place-selection rate is below the current product target; search or map entry may be unclear.",
            }
        )

    verify_rate = derived["verify_attempt_rate_pct"]
    if totals["verify_page_open"] > 0 and (verify_rate is None or verify_rate < KPI_THRESHOLDS["min_verify_attempt_rate_pct"]):
        findings.append(
            {
                "severity": "warning",
                "message": "Users reach /verify but rarely complete a verification attempt.",
            }
        )

    history_rate = derived["history_open_rate_pct"]
    if history_rate is not None and history_rate < KPI_THRESHOLDS["min_history_open_rate_pct"]:
        findings.append(
            {
                "severity": "info",
                "message": "History engagement is low relative to place views.",
            }
        )

    measurements_rate = derived["measurements_open_rate_pct"]
    if measurements_rate is not None and measurements_rate < KPI_THRESHOLDS["min_measurements_open_rate_pct"]:
        findings.append(
            {
                "severity": "info",
                "message": "Measurement-detail engagement is low relative to place views.",
            }
        )

    share_rate = derived["share_rate_pct"]
    if share_rate is not None and share_rate < KPI_THRESHOLDS["min_share_rate_pct"]:
        findings.append(
            {
                "severity": "info",
                "message": "Share behavior is weak, suggesting place pages may not yet feel link-worthy.",
            }
        )

    if totals["data_gap_notice_impression"] > 0 and totals["data_gap_notice_dismissed"] == 0:
        findings.append(
            {
                "severity": "info",
                "message": "Data-gap notices are being shown but not dismissed; copy may be read or ignored.",
            }
        )

    if not findings:
        findings.append({"severity": "ok", "message": "No immediate KPI anomalies detected for this review window."})
    return findings


def build_recommendations(findings: list[dict[str, str]]) -> list[str]:
    recommendations: list[str] = []
    finding_text = " ".join(item["message"] for item in findings)

    if "Traffic volume is still too low" in finding_text:
        recommendations.append("Wait for a fuller traffic window before making structural UX decisions.")
    if "Place-selection rate is below" in finding_text or "selection behavior is absent" in finding_text:
        recommendations.append("Review search prominence, first map viewport, and empty-state guidance on the dashboard.")
    if "rarely complete a verification attempt" in finding_text:
        recommendations.append("Audit /verify CTA clarity and ensure the dropzone/result copy explains the action path immediately.")
    if "History engagement is low" in finding_text or "Measurement-detail engagement is low" in finding_text:
        recommendations.append("Re-check detail-panel information hierarchy on mobile; history and measurements may be too buried.")
    if "Share behavior is weak" in finding_text:
        recommendations.append("Inspect whether the current share entrypoint is visible enough after place selection.")
    if "Data-gap notices are being shown" in finding_text:
        recommendations.append("Sample real sessions to determine whether the data-gap notice is understood or merely skipped.")
    if not recommendations:
        recommendations.append("Continue the weekly cadence and compare this window against the next 7-day baseline.")
    return recommendations


def format_markdown(summary: dict[str, Any]) -> str:
    totals = summary["totals"]
    derived = summary["derived"]
    lines = [
        f"# Weekly Analytics Review: {summary['start_day']} -> {summary['end_day']}",
        "",
        "## KPI Snapshot",
        f"- Total events: **{totals['total']}**",
        f"- Dashboard opens: **{totals['dashboard_open']}**",
        f"- Place selections: **{totals['place_selected']}**",
        f"- Verify page opens: **{totals['verify_page_open']}**",
        f"- Verify attempts: **{totals['verify_attempt']}**",
        f"- Share clicks: **{totals['share_click']}**",
        "",
        "## Derived Rates",
        f"- Place selection after dashboard open: **{format_rate(derived['place_select_rate_pct'])}**",
        f"- Verify attempts after verify page open: **{format_rate(derived['verify_attempt_rate_pct'])}**",
        f"- Share clicks after place selection: **{format_rate(derived['share_rate_pct'])}**",
        f"- History opens after place selection: **{format_rate(derived['history_open_rate_pct'])}**",
        f"- Measurements opens after place selection: **{format_rate(derived['measurements_open_rate_pct'])}**",
        "",
        "## Findings",
    ]
    for finding in summary["findings"]:
        lines.append(f"- **{finding['severity'].upper()}**: {finding['message']}")
    lines.extend(["", "## Recommended Actions"])
    for recommendation in summary["recommendations"]:
        lines.append(f"- {recommendation}")
    lines.extend(["", "## Daily Totals"])
    for day in summary["daily"]:
        counts = day["counts"]
        lines.append(
            f"- `{day['day']}`: total={counts['total']}, dashboard={counts['dashboard_open']}, "
            f"place={counts['place_selected']}, verify_open={counts['verify_page_open']}, "
            f"verify_attempt={counts['verify_attempt']}, share={counts['share_click']}"
        )
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    if args.days <= 0:
        raise SystemExit("--days must be positive")

    namespace_id = args.namespace_id or load_namespace_id(args.config, args.preview)
    series = build_daily_analytics(args.days, namespace_id, args.account_id)
    summary = summarize(series)

    if args.json:
        print(json.dumps(summary, ensure_ascii=True, indent=2))
    elif args.markdown:
        print(format_markdown(summary))
    else:
        print(format_text(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
