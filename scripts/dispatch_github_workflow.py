#!/usr/bin/env python3
"""Dispatch a GitHub Actions workflow via the REST API.

This script is intended for operational use from a stable repo path,
so delayed schedulers do not depend on ephemeral files in /tmp.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True, help="owner/repo")
    parser.add_argument("--workflow", required=True, help="workflow file name, e.g. citizen-snapshot.yml")
    parser.add_argument("--ref", default="main", help="git ref to dispatch")
    parser.add_argument(
        "--input",
        action="append",
        default=[],
        metavar="KEY=VALUE",
        help="workflow input in KEY=VALUE form; may be passed multiple times",
    )
    return parser.parse_args()


def parse_inputs(items: list[str]) -> dict[str, str]:
    result: dict[str, str] = {}
    for item in items:
        if "=" not in item:
            raise SystemExit(f"invalid --input {item!r}; expected KEY=VALUE")
        key, value = item.split("=", 1)
        key = key.strip()
        if not key:
            raise SystemExit(f"invalid --input {item!r}; empty key")
        result[key] = value
    return result


def main() -> int:
    args = parse_args()
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        print("GITHUB_TOKEN or GH_TOKEN is required", file=sys.stderr)
        return 2

    payload = json.dumps(
        {
            "ref": args.ref,
            "inputs": parse_inputs(args.input),
        }
    ).encode("utf-8")
    url = f"https://api.github.com/repos/{args.repo}/actions/workflows/{args.workflow}/dispatches"
    req = Request(url, data=payload, method="POST")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    req.add_header("Content-Type", "application/json")

    try:
        with urlopen(req) as response:
            print(f"dispatch status={response.status}")
            return 0
    except HTTPError as exc:
        print(f"dispatch failed: HTTP {exc.code}", file=sys.stderr)
        return 1
    except URLError as exc:
        print(f"dispatch failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
