from __future__ import annotations

import json
import logging
import re
from pathlib import Path

import pandas as pd
import requests
from lxml import html as lxml_html


def load_geocode_cache(geocode_path: Path) -> dict:
    if geocode_path.is_file():
        with open(geocode_path, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_geocode_cache(geocode_path: Path, cache: dict) -> None:
    geocode_path.parent.mkdir(parents=True, exist_ok=True)
    with open(geocode_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=0)


def text_norm(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def last_page_from_html(page_html: str, tab_id: str) -> int:
    pattern = re.compile(
        rf"page=(\d+)&active(?:%5[fF]|_)tab(?:%5[fF]|_)id={re.escape(tab_id)}",
        re.I,
    )
    nums = [int(match.group(1)) for match in pattern.finditer(page_html)]
    return max(nums) if nums else 1


def fetch_tab_rows(session: requests.Session, tab_id: str) -> list[dict]:
    base = "https://vtiav.sm.ee"
    first_url = f"{base}/index.php/?active_tab_id={tab_id}"
    first_html = session.get(first_url, timeout=45).text
    last_page = last_page_from_html(first_html, tab_id)
    rows: list[dict] = []

    for page_num in range(1, last_page + 1):
        url = f"{base}/index.php/?page={page_num}&active_tab_id={tab_id}"
        page_html = session.get(url, timeout=45).text
        doc = lxml_html.fromstring(page_html)
        tr_nodes = doc.xpath('//tr[.//a[contains(@href,"/frontpage/show?id=")]]')
        for tr in tr_nodes:
            a_nodes = tr.xpath('.//a[contains(@href,"/frontpage/show?id=")]')
            if not a_nodes:
                continue
            href = a_nodes[0].get("href") or ""
            match = re.search(r"id=(\d+)", href)
            if not match:
                continue
            cells = [text_norm(cell.text_content()) for cell in tr.xpath("./td")]
            rows.append({"id": match.group(1), "cells": cells})
    return rows


def build_paged_address_index(
    session: requests.Session,
    *,
    use_cache: bool,
    paged_addr_cache_path: Path,
    normalize_location_key,
    log: logging.Logger,
) -> dict[str, str]:
    if use_cache and paged_addr_cache_path.is_file():
        try:
            with open(paged_addr_cache_path, encoding="utf-8") as f:
                payload = json.load(f)
            if isinstance(payload, dict) and isinstance(payload.get("index"), dict):
                return payload["index"]
        except (OSError, json.JSONDecodeError):
            pass

    index: dict[str, str] = {}

    try:
        for row in fetch_tab_rows(session, "U"):
            cells = row["cells"]
            if len(cells) < 5:
                continue
            bassein_name = cells[4]
            asukoht = cells[1]
            if bassein_name and asukoht:
                index[normalize_location_key(bassein_name, "basseinid")] = asukoht
    except requests.RequestException as exc:
        log.warning("Не удалось собрать адреса с active_tab_id=U: %s", exc)

    try:
        for row in fetch_tab_rows(session, "JV"):
            cells = row["cells"]
            if len(cells) < 3:
                continue
            veevark_name = cells[1]
            area_addr = cells[2]
            if veevark_name and area_addr:
                index[normalize_location_key(veevark_name, "veevark")] = area_addr
    except requests.RequestException as exc:
        log.warning("Не удалось собрать адреса с active_tab_id=JV: %s", exc)

    paged_addr_cache_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": pd.Timestamp.now("UTC").isoformat(),
        "index_size": len(index),
        "index": index,
    }
    with open(paged_addr_cache_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    return index


def load_coordinate_overrides(
    coord_overrides_path: Path,
    *,
    normalize_location_key,
    log: logging.Logger,
) -> dict[str, dict]:
    if not coord_overrides_path.is_file():
        return {}
    try:
        with open(coord_overrides_path, encoding="utf-8") as f:
            payload = json.load(f)
    except (OSError, json.JSONDecodeError) as exc:
        log.warning("Не удалось прочитать coordinate_overrides.json: %s", exc)
        return {}

    items = payload.get("items") if isinstance(payload, dict) else None
    if not isinstance(items, list):
        return {}

    out: dict[str, dict] = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        domain = str(item.get("domain") or "").strip()
        location = str(item.get("location") or "").strip()
        if not domain or not location:
            continue
        out[normalize_location_key(location, domain)] = item
    return out
