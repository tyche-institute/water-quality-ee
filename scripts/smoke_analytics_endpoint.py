#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke-test the analytics ingestion endpoint.")
    parser.add_argument("--url", required=True, help="Analytics endpoint URL")
    parser.add_argument("--origin", default="https://h2oatlas.ee", help="Origin header to send")
    args = parser.parse_args()

    payload = json.dumps(
        {
            "event": "verify_page_open",
            "ts": "2026-05-11T12:00:00.000Z",
            "meta": {
                "lang": "ru",
                "smoke": True,
                "source": "repo_smoke",
            },
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        args.url,
        data=payload,
        method="POST",
        headers={
            "content-type": "application/json",
            "origin": args.origin,
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            body = response.read().decode("utf-8", errors="replace")
            status = response.status
            allow_origin = response.headers.get("access-control-allow-origin")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        print(json.dumps({"ok": False, "status": exc.code, "body": body}, ensure_ascii=True, indent=2))
        return 1
    except Exception as exc:  # pragma: no cover - network/runtime failure path
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=True, indent=2))
        return 2

    result = {
        "ok": status == 200 and body.strip() == "ok",
        "status": status,
        "body": body.strip(),
        "access_control_allow_origin": allow_origin,
    }
    print(json.dumps(result, ensure_ascii=True, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
