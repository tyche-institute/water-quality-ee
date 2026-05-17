from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests


def download_xml(
    domain_key: str,
    *,
    domains: dict[str, str],
    base_url: str,
    data_dir: Path,
    save: bool = True,
) -> bytes:
    """Скачать ответ по старым параметрам area=… (часто это HTML, не данные)."""
    if domain_key not in domains:
        raise ValueError(f"Неизвестный домен: {domain_key}. Доступные: {list(domains.keys())}")

    params = {
        "active_tab_id": "A",
        "lang": "et",
        "type": "xml",
        "area": domains[domain_key],
    }

    print(f"[data_loader] Скачиваю {domain_key} (legacy URL)...")
    response = requests.get(base_url, params=params, timeout=60)
    response.raise_for_status()

    if save:
        data_dir.mkdir(parents=True, exist_ok=True)
        out_path = data_dir / f"{domain_key}.xml"
        out_path.write_bytes(response.content)
        print(f"[data_loader] Сохранено: {out_path}")

    return response.content


def looks_like_data_xml(content: bytes) -> bool:
    head = content[:500].lstrip().lower()
    if head.startswith(b"<!doctype html") or head.startswith(b"<html"):
        return False
    return b"<proovivott" in content or b"<uuring" in content


def download_opendata_year(
    domain_key: str,
    year: int,
    *,
    opendata_base: str,
    opendata_prefix: dict[str, str],
) -> bytes:
    """Скачать один годовой файл opendata XML."""
    if domain_key not in opendata_prefix:
        raise ValueError(f"Нет opendata-префикса для: {domain_key}")
    url = f"{opendata_base}{opendata_prefix[domain_key]}_{year}.xml"
    response = requests.get(url, timeout=90)
    response.raise_for_status()
    if not looks_like_data_xml(response.content):
        raise ValueError(f"Не похоже на XML проб: {url}")
    return response.content


def default_years() -> list[int]:
    year = datetime.now().year
    return [year - i for i in range(6)]


def load_domain_xml_blobs(
    domain_key: str,
    *,
    data_dir: Path,
    opendata_base: str,
    opendata_prefix: dict[str, str],
    years: Optional[list[int]] = None,
    use_cache: bool = True,
) -> list[bytes]:
    """Загрузить XML по годам (кэш: data/raw/{domain}_{year}.xml)."""
    if years is None:
        years = default_years()

    data_dir.mkdir(parents=True, exist_ok=True)
    blobs: list[bytes] = []

    for year in years:
        path = data_dir / f"{domain_key}_{year}.xml"
        data: Optional[bytes] = None
        if use_cache and path.exists():
            cached = path.read_bytes()
            if looks_like_data_xml(cached):
                data = cached
                print(f"[data_loader] Кэш: {path.name}")
        if data is None:
            try:
                print(f"[data_loader] Скачиваю {domain_key} за {year}…")
                data = download_opendata_year(
                    domain_key,
                    year,
                    opendata_base=opendata_base,
                    opendata_prefix=opendata_prefix,
                )
                path.write_bytes(data)
                print(f"[data_loader] Сохранено: {path}")
            except Exception as exc:
                print(f"[data_loader] Год {year} недоступен: {exc}")
                continue
        blobs.append(data)

    if not blobs:
        raise RuntimeError(
            f"Не удалось загрузить opendata XML для '{domain_key}'. "
            "Проверьте сеть и наличие файлов на vtiav.sm.ee."
        )
    return blobs


def normalize_location(name: str) -> str:
    """Нормализовать название места для межгодовой дедупликации."""
    normalized = name.strip().lower()
    normalized = re.sub(r"\bsupluskoht\b", "", normalized)
    normalized = re.sub(r"\bsupluskoha\b", "", normalized)
    normalized = re.sub(r"\brand\b", "", normalized)
    normalized = re.sub(r"\bsuplusala\b", "", normalized)
    normalized = re.sub(r"\bühistveevärk\b", "", normalized)
    normalized = re.sub(r"\bühisveevärk\b", "", normalized)
    normalized = re.sub(r"\bveevärk\b", "", normalized)
    normalized = re.sub(r"\bveevõrk\b", "", normalized)
    normalized = re.sub(r"\bveevork\b", "", normalized)
    normalized = re.sub(r"[-–—]+", " ", normalized)
    normalized = re.sub(r"[,;]+", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized
