#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import socket
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone


DEFAULT_BASE_URL = "https://h2oatlas.ee"
CHECKS = (
    "/",
    "/verify",
    "/data/snapshot.frontend.json",
    "/data/snapshot.history.json",
    "/data/snapshot.details.json",
    "/data/og-index.json",
    "/data/snapshot.aep",
    "/data/snapshot.sig.json",
)


def parse_timestamp(value: str, *, field_name: str) -> datetime:
    normalized = value.strip()
    if normalized.endswith("Z"):
        normalized = f"{normalized[:-1]}+00:00"
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        raise ValueError(f"{field_name} must be timezone-aware: {value!r}")
    return parsed.astimezone(timezone.utc)


def fetch(url: str, timeout: float) -> tuple[int, str, bytes]:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "h2oatlas-smoke-check/1.0",
            "Cache-Control": "no-cache",
        },
    )
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                status = response.getcode()
                content_type = response.headers.get("content-type", "")
                body = response.read()
                return status, content_type, body
        except (TimeoutError, socket.timeout, urllib.error.URLError) as exc:
            last_error = exc
            if attempt == 2:
                raise
            time.sleep(1.0)
    raise RuntimeError(f"unreachable fetch state for {url}: {last_error}")


def validate_json_payload(path: str, body: bytes) -> None:
    data = json.loads(body)

    if path == "/data/snapshot.frontend.json":
        required = {"generated_at", "places_count", "places", "has_model_predictions"}
        missing = required - set(data)
        if missing:
            raise ValueError(f"frontend snapshot missing keys: {sorted(missing)}")
        if not isinstance(data["places"], list) or not data["places"]:
            raise ValueError("frontend snapshot has empty places list")
        if not isinstance(data["places_count"], int) or data["places_count"] <= 0:
            raise ValueError("frontend snapshot has invalid places_count")
        if not isinstance(data["generated_at"], str) or not data["generated_at"].strip():
            raise ValueError("frontend snapshot missing generated_at timestamp")
        if data["has_model_predictions"] and not data.get("canonical_model"):
            raise ValueError("frontend snapshot claims model predictions without canonical_model")
        return

    if path == "/data/snapshot.history.json":
        if not isinstance(data, dict) or not data:
            raise ValueError("history snapshot is empty")
        return

    if path == "/data/snapshot.details.json":
        if not isinstance(data, dict) or not data:
            raise ValueError("details snapshot is empty")
        return

    if path == "/data/og-index.json":
        if not isinstance(data, dict) or "places" not in data or not data["places"]:
            raise ValueError("OG index is empty or malformed")
        return

    if path == "/data/snapshot.sig.json":
        required = {"algorithm", "mode", "signed_at", "bundle_filename"}
        missing = required - set(data)
        if missing:
            raise ValueError(f"signature metadata missing keys: {sorted(missing)}")
        return


def validate_snapshot_freshness(
    snapshot: dict,
    *,
    require_generated_after: datetime | None,
    max_generated_age_hours: float | None,
    now: datetime | None = None,
) -> None:
    generated_at = parse_timestamp(str(snapshot.get("generated_at") or ""), field_name="generated_at")
    if require_generated_after is not None and generated_at < require_generated_after:
        floor = require_generated_after.isoformat().replace("+00:00", "Z")
        actual = generated_at.isoformat().replace("+00:00", "Z")
        raise ValueError(
            f"frontend snapshot generated_at {actual} is older than required floor {floor}"
        )
    if max_generated_age_hours is None:
        return
    now_utc = now or datetime.now(timezone.utc)
    age_hours = (now_utc - generated_at).total_seconds() / 3600.0
    if age_hours > max_generated_age_hours:
        actual = generated_at.isoformat().replace("+00:00", "Z")
        raise ValueError(
            f"frontend snapshot generated_at {actual} is {age_hours:.2f}h old; "
            f"allowed max is {max_generated_age_hours:.2f}h"
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke-test the live h2oatlas frontend surface.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Base URL to check.")
    parser.add_argument("--timeout", type=float, default=15.0, help="Per-request timeout in seconds.")
    parser.add_argument(
        "--require-generated-after",
        help="Require /data/snapshot.frontend.json generated_at to be at or after this ISO-8601 timestamp.",
    )
    parser.add_argument(
        "--max-generated-age-hours",
        type=float,
        help="Require /data/snapshot.frontend.json generated_at to be no older than this many hours.",
    )
    args = parser.parse_args()

    failed = False
    base_url = args.base_url.rstrip("/")
    frontend_snapshot: dict | None = None
    require_generated_after = None
    if args.require_generated_after:
        try:
            require_generated_after = parse_timestamp(
                args.require_generated_after,
                field_name="--require-generated-after",
            )
        except ValueError as exc:
            print(f"FAIL cfg {args.require_generated_after} [{exc}]")
            return 2

    for path in CHECKS:
        url = f"{base_url}{path}"
        try:
            status, content_type, body = fetch(url, timeout=args.timeout)
            print(f"OK   {status} {url} [{content_type}]")
            if status != 200:
                failed = True
                continue
            if path.endswith(".json"):
                validate_json_payload(path, body)
                if path == "/data/snapshot.frontend.json":
                    frontend_snapshot = json.loads(body)
            elif path == "/data/snapshot.aep" and not body:
                raise ValueError("signed bundle is empty")
        except urllib.error.HTTPError as exc:
            print(f"FAIL {exc.code} {url} [{exc.reason}]")
            failed = True
        except urllib.error.URLError as exc:
            print(f"FAIL --- {url} [{exc.reason}]")
            failed = True
        except (json.JSONDecodeError, ValueError) as exc:
            print(f"FAIL sem {url} [{exc}]")
            failed = True

    if frontend_snapshot is not None and not failed:
        try:
            validate_snapshot_freshness(
                frontend_snapshot,
                require_generated_after=require_generated_after,
                max_generated_age_hours=args.max_generated_age_hours,
            )
        except ValueError as exc:
            print(f"FAIL fresh {base_url}/data/snapshot.frontend.json [{exc}]")
            failed = True

    if failed:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
