"""
data_loader.py — Загрузка и парсинг данных о качестве воды из vtiav.sm.ee

Источник: Terviseamet (Департамент здоровья Эстонии)
Формат: XML (каталог opendata: * _veeproovid_YYYY.xml)
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import List, Optional

import pandas as pd
from lxml import etree
from data_loader_legacy import (
    float_text as _float_impl,
    parse_supluskoha_legacy as _parse_supluskoha_legacy_impl,
    parse_veevark_legacy as _parse_veevark_legacy_impl,
    proovivotukoht_id as _proovivotukoht_id_impl,
    proovivotukoht_nimetus as _proovivotukoht_nimetus_impl,
    text as _text_impl,
)
from data_loader_support import (
    default_years as _default_years,
    download_opendata_year as _download_opendata_year,
    download_xml as _download_xml,
    load_domain_xml_blobs as _load_domain_xml_blobs,
    looks_like_data_xml as _looks_like_data_xml_impl,
    normalize_location as _normalize_location_support,
)

# ── Конфигурация ──────────────────────────────────────────────────────────────

BASE_URL = "https://vtiav.sm.ee/index.php/"

# Старые query-параметры (сайт часто отдаёт HTML-страницу каталога, не сырой XML)
DOMAINS = {
    "supluskoha": "supluskoha_uuringud",
    "veevark": "veevargi_uuringud",
    "basseinid": "basseini_uuringud",
    "joogivesi": "joogiveeallikas_uuringud",
    "mineraalvesi": "mineraalvee_uuringud",
}

# Актуальные полные XML: https://vtiav.sm.ee/index.php/opendata/…
OPENDATA_BASE = "https://vtiav.sm.ee/index.php/opendata/"
OPENDATA_PREFIX = {
    "supluskoha": "supluskoha_veeproovid",
    "veevark": "veevargi_veeproovid",
    "basseinid": "basseini_veeproovid",
    "joogivesi": "joogiveeallika_veeproovid",
    "mineraalvesi": "mineraalvee_veeproovid",
}

DATA_DIR = Path(__file__).parent.parent / "data" / "raw"


# ── Загрузка (legacy + opendata) ─────────────────────────────────────────────

def download_xml(domain_key: str, save: bool = True) -> bytes:
    return _download_xml(
        domain_key,
        domains=DOMAINS,
        base_url=BASE_URL,
        data_dir=DATA_DIR,
        save=save,
    )


def _looks_like_data_xml(content: bytes) -> bool:
    return _looks_like_data_xml_impl(content)


def download_opendata_year(domain_key: str, year: int) -> bytes:
    return _download_opendata_year(
        domain_key,
        year,
        opendata_base=OPENDATA_BASE,
        opendata_prefix=OPENDATA_PREFIX,
    )


def default_years() -> List[int]:
    return _default_years()


def load_domain_xml_blobs(
    domain_key: str,
    years: Optional[List[int]] = None,
    use_cache: bool = True,
) -> List[bytes]:
    return _load_domain_xml_blobs(
        domain_key,
        data_dir=DATA_DIR,
        opendata_base=OPENDATA_BASE,
        opendata_prefix=OPENDATA_PREFIX,
        years=years,
        use_cache=use_cache,
    )


def load_xml(domain_key: str) -> bytes:
    """Один сырой XML (первый доступный год из default_years). Для отладки."""
    return load_domain_xml_blobs(domain_key, years=default_years()[:1], use_cache=True)[0]


# ── Нормализация названий мест ───────────────────────────────────────────────

def normalize_location(name: str, domain: str = "") -> str:
    """
    Нормализовать название места отбора пробы.

    ПРОБЛЕМА (обнаружена при анализе данных апреля 2026):
    Terviseamet переименовывал объекты между годовыми XML файлами. Одно и то же
    физическое место получало разные строки в поле location:

        'Harku järve supluskoht'  (2021) → 'Harku järve rand'  (2025)
        'Haaslava küla veevärk'   (2022) → 'Haaslava küla ühisveevärk'  (2026)
        'Tootsi Ujumisbassein'    (2021) → 'Tootsi ujumisbassein'  (2026, регистр)
        'Abja-Paluoja  veevärk'   (2022) → 'Abja-Paluoja veevärk'  (2026, двойной пробел)

    Без нормализации любая агрегация по location (группировка, дедупликация,
    подсчёт проб на место) даёт ложные дубли: место выглядит как два разных объекта,
    одному из которых годами не берут проб.

    РЕШЕНИЕ: убираем суффиксы типа объекта и нормализуем пунктуацию/регистр.
    Нормализованный ключ используется только для группировки; в DataFrame сохраняется
    оригинальное актуальное название (из последней по дате пробы).

    Применяется:
        - В load_domain() / load_all() — добавляется столбец `location_key`
        - В build_citizen_snapshot.py — для дедупликации последней пробы на место
        - В анализе ноутбуков — для корректного подсчёта уникальных мест

    Args:
        name:   сырое название из XML (поле location в DataFrame)
        domain: домен ('supluskoha', 'veevark', 'basseinid', 'joogivesi') —
                позволяет убирать суффиксы, специфичные для домена

    Returns:
        Нормализованная строка в нижнем регистре без суффиксов типа объекта.
    """
    return _normalize_location_support(name)


# ── Парсинг: opendata proovivott ────────────────────────────────────────────

def _parse_float_text(val: Optional[str]) -> Optional[float]:
    if val is None:
        return None
    s = val.strip().replace(",", ".")
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _compliant_from_hinnang(elem: etree._Element) -> Optional[int]:
    """Любой hinnang с «ei vasta» → нарушение (0)."""
    seen = False
    for h in elem.findall(".//hinnang"):
        if not h.text:
            continue
        seen = True
        t = h.text.strip().lower()
        if "ei vasta" in t:
            return 0
    if not seen:
        return None
    return 1


def _compliant_joogiveeallika(elem: etree._Element) -> Optional[int]:
    """
    Источники питьевой воды (joogiveeallika): протокол даёт «Kvaliteediklass I/II/…»
    или «vastab» / «ei vasta» на показателях.
    """
    for h in elem.findall(".//hinnang"):
        if not h.text:
            continue
        t = h.text.strip().lower()
        if "ei vasta" in t:
            return 0

    seen_klass = False
    worst = 1
    for h in elem.findall(".//katseprotokoll/hinnang"):
        if not h.text:
            continue
        tl = h.text.strip().lower()
        if "kvaliteediklass" not in tl:
            continue
        seen_klass = True
        if re.search(r"kvaliteediklass\s+iii\b", tl):
            worst = 0
        elif re.search(r"kvaliteediklass\s+ii\b", tl):
            worst = min(worst, 0)
        elif re.search(r"kvaliteediklass\s+i\b", tl):
            worst = min(worst, 1)
        else:
            worst = min(worst, 0)

    if seen_klass:
        return worst

    return _compliant_from_hinnang(elem)


def _build_opendata_record(
    pv: etree._Element,
    *,
    domain: str,
    location: str,
    facility: str = "",
    site: str = "",
    extra_fields: Optional[dict] = None,
) -> dict:
    """Shared bootstrap for one `proovivott` opendata record."""
    record = {
        "domain": domain,
        "sample_id": _text(pv, "id"),
        "proovivotukoht_id": _proovivotukoht_id(pv),
        "location": location,
        "geocode_facility": facility,
        "geocode_site": site,
        "county": _text(pv, "maakond"),
        "sample_date": _text(pv, "proovivotu_aeg"),
    }
    if extra_fields:
        record.update(extra_fields)
    return record


def _init_measurement_slots(record: dict, keys: tuple[str, ...]) -> None:
    """Initialize measurement columns to None in-place."""
    for key in keys:
        record[key] = None


def _finalize_opendata_frame(df: pd.DataFrame, numeric_cols: tuple[str, ...]) -> pd.DataFrame:
    """Normalize common opendata parser output types."""
    if len(df) == 0:
        return df
    if "sample_date" in df.columns:
        df["sample_date"] = pd.to_datetime(df["sample_date"], dayfirst=True, errors="coerce")
    for col in numeric_cols:
        if col in df.columns:
            series = df[col].map(
                lambda value: value.replace(",", ".") if isinstance(value, str) else value
            )
            df[col] = pd.to_numeric(series, errors="coerce")
    return df


# Параметры, для которых берётся последнее измерение (не максимум):
# pH, свободный/связанный хлор, прозрачность — диапазонные нормы, max не отражает нарушение.
# Для всех остальных (микробиология, химия) — max: safety-first (худший случай важнее).
_MERGE_LAST_WINS = frozenset({"ph", "free_chlorine", "combined_chlorine", "transparency"})


def _merge_num(
    prev: Optional[float], new: Optional[float], col: Optional[str] = None
) -> Optional[float]:
    """Объединить два измерения одного параметра в одной пробе.

    col in _MERGE_LAST_WINS  → последнее значение (range-параметры: pH, хлор, прозрачность).
    Остальные               → max (safety-first: хуже = важнее для микробиологии/химии).
    """
    if new is None:
        return prev
    if prev is None:
        return new
    if col in _MERGE_LAST_WINS:
        return new
    return max(prev, new)


def _ugl_to_mgl(yhik: Optional[str]) -> bool:
    if not yhik:
        return False
    y = yhik.lower().replace("µ", "u").replace("μ", "u")
    return "ug/l" in y or "µg/l" in y or "μg/l" in y


def _supluskoha_naitaja_col(nimetus: str) -> Optional[str]:
    n = nimetus.lower()
    if "escherichia coli" in n:
        return "e_coli"
    if "coli-laadsed" in n:
        return None
    # "Soole enterokokid" / "Enterokokid" / "Enterokokkid" / "intestinal enterococci"
    if "enterokoki" in n or "enterokokk" in n or "enterococc" in n or "enterokokid" in n:
        return "enterococci"
    if re.match(r"^ph\b", n) or n.startswith("ph "):
        return "ph"
    if "läbipaistvus" in n or "labipaistvus" in n:
        return "transparency"
    return None


def _parse_supluskoha_opendata(tree: etree._Element) -> pd.DataFrame:
    numeric_cols = ("e_coli", "enterococci", "ph", "transparency")
    records = []
    for pv in tree.findall(".//proovivott"):
        facility = (_text(pv, "supluskoht") or "").strip()
        site = _proovivotukoht_nimetus(pv)
        loc = facility or site
        rec = _build_opendata_record(
            pv,
            domain="supluskoha",
            location=loc,
            facility=facility,
            site=site,
            extra_fields={"supluskoht_id": _text(pv, "supluskoht_id")},
        )
        _init_measurement_slots(rec, numeric_cols)

        for n_el in pv.findall(".//naitaja"):
            nm = _text(n_el, "nimetus")
            if not nm:
                continue
            col = _supluskoha_naitaja_col(nm)
            if not col:
                continue
            val = _parse_float_text(_text(n_el, "sisaldus"))
            rec[col] = _merge_num(rec[col], val, col)

        rec["compliant"] = _compliant_from_hinnang(pv)
        records.append(rec)

    return _finalize_opendata_frame(pd.DataFrame(records), numeric_cols)


def _veevark_naitaja_col(nimetus: str) -> Optional[str]:
    n = nimetus.lower()
    if "escherichia coli" in n:
        return "e_coli"
    if "coli-laadsed" in n:
        return "coliforms"
    # "Soole enterokokid" / "Enterokokid" / "Enterokokkid"
    if "enterokoki" in n or "enterokokk" in n or "enterococc" in n or "enterokokid" in n:
        return "enterococci"
    if "nitraat" in n and "nitrit" not in n:
        return "nitrates"
    if "nitrit" in n:
        return "nitrites"
    if "ammoonium" in n or "amiin" in n:
        return "ammonium"
    if "fluoriid" in n:
        return "fluoride"
    if "mangaan" in n:
        return "manganese"
    # "Raud" / "Üldraud" — exclude "kloriid" to avoid "raudkloriid" false match
    if "raud" in n and "kloriid" not in n:
        return "iron"
    if "hägusus" in n or "hagusus" in n:
        return "turbidity"
    if "värvus" in n and ("pt" in n or "kraadid" in n):
        return "color"
    if "kloriid" in n and "sulfaat" not in n:
        return "chlorides"
    if "sulfaat" in n:
        return "sulfates"
    if re.match(r"^ph\b", n) or n.startswith("ph "):
        return "ph"
    return None


def _parse_veevark_opendata(tree: etree._Element) -> pd.DataFrame:
    numeric_cols = (
        "e_coli", "coliforms", "enterococci", "nitrates", "nitrites",
        "ammonium", "fluoride", "manganese", "iron", "chlorides",
        "sulfates", "ph", "turbidity", "color",
    )
    records = []
    for pv in tree.findall(".//proovivott"):
        facility = (_text(pv, "veevark") or "").strip()
        site = _proovivotukoht_nimetus(pv)
        loc = facility or site or ""
        rec = _build_opendata_record(
            pv,
            domain="veevark",
            location=loc,
            facility=facility,
            site=site,
            extra_fields={"veevark_id": _text(pv, "veevark_id")},
        )
        _init_measurement_slots(rec, numeric_cols)

        for n_el in pv.findall(".//naitaja"):
            nm = _text(n_el, "nimetus")
            if not nm:
                continue
            col = _veevark_naitaja_col(nm)
            if not col:
                continue
            val = _parse_float_text(_text(n_el, "sisaldus"))
            yhik = _text(n_el, "yhik")
            if col in ("iron", "manganese") and _ugl_to_mgl(yhik):
                val = val / 1000.0 if val is not None else None
            rec[col] = _merge_num(rec[col], val, col)

        rec["compliant"] = _compliant_from_hinnang(pv)
        records.append(rec)

    return _finalize_opendata_frame(pd.DataFrame(records), numeric_cols)


def _parse_mineraalvesi_opendata(tree: etree._Element) -> pd.DataFrame:
    """
    Opendata: корень mineraalvee_veeproovid (если доступен), структура близка к veevärk.
    Поддерживаем несколько вариантов названий полей объекта.
    """
    numeric_cols = (
        "e_coli", "coliforms", "enterococci", "nitrates", "nitrites",
        "ammonium", "fluoride", "manganese", "iron", "chlorides",
        "sulfates", "ph", "turbidity", "color",
    )
    records = []
    for pv in tree.findall(".//proovivott"):
        facility = (
            _text(pv, "mineraalvesi")
            or _text(pv, "mineraalvesi_asutus")
            or _text(pv, "veevark")
            or _text(pv, "veeallikas")
            or ""
        ).strip()
        site = _proovivotukoht_nimetus(pv)
        loc = facility or site or ""
        rec = _build_opendata_record(
            pv,
            domain="mineraalvesi",
            location=loc,
            facility=facility,
            site=site,
            extra_fields={"mineraalvesi_id": _text(pv, "mineraalvesi_id") or _text(pv, "veevark_id")},
        )
        _init_measurement_slots(rec, numeric_cols)

        for n_el in pv.findall(".//naitaja"):
            nm = _text(n_el, "nimetus")
            if not nm:
                continue
            col = _veevark_naitaja_col(nm)
            if not col:
                continue
            val = _parse_float_text(_text(n_el, "sisaldus"))
            yhik = _text(n_el, "yhik")
            if col in ("iron", "manganese") and _ugl_to_mgl(yhik):
                val = val / 1000.0 if val is not None else None
            rec[col] = _merge_num(rec[col], val, col)

        rec["compliant"] = _compliant_from_hinnang(pv)
        records.append(rec)

    return _finalize_opendata_frame(pd.DataFrame(records), numeric_cols)


def _basseinid_naitaja_col(nimetus: str) -> Optional[str]:
    """Маппинг эстонских названий показателей бассейна → колонки DataFrame."""
    n = nimetus.strip().lower()
    if "escherichia coli" in n:
        return "e_coli"
    if "coli-laadsed" in n:
        return "coliforms"
    if "enterokok" in n:
        return "enterococci"
    if "pseudomonas" in n:
        return "pseudomonas"
    if "stafül" in n or "staphylococcus" in n:
        return "staphylococci"
    if "kolooniate arv" in n:
        return "colonies_37c"
    if "nitraatioon" in n:
        return "nitrates"
    if "oksüdeeritavus" in n or "oksudeeritavus" in n:
        return "oxidizability"
    if "vaba kloor" in n:
        return "free_chlorine"
    if "seotud kloor" in n:
        return "combined_chlorine"
    if "hägusus" in n or "hagusus" in n:
        return "turbidity"
    if "värvus" in n:
        return "color"
    if "ammoonium" in n:
        return "ammonium"
    if re.match(r"^ph\b", n) or n.startswith("ph "):
        return "ph"
    return None


def _parse_basseinid_opendata(tree: etree._Element) -> pd.DataFrame:
    """Opendata: корень basseini_veeproovid, записи proovivott (бассейны, SPA)."""
    numeric_cols = (
        "e_coli", "coliforms", "enterococci", "ph", "turbidity", "color",
        "ammonium", "nitrates", "pseudomonas", "staphylococci",
        "free_chlorine", "combined_chlorine", "oxidizability", "colonies_37c",
    )
    records = []
    for pv in tree.findall(".//proovivott"):
        facility = (_text(pv, "bassein") or "").strip()
        site = _proovivotukoht_nimetus(pv)
        loc = facility or site or _text(pv.find("proovivotukoht"), "nimetus")
        rec = _build_opendata_record(
            pv,
            domain="basseinid",
            location=loc,
            facility=facility,
            site=site,
            extra_fields={"bassein_id": _text(pv, "bassein_id")},
        )
        _init_measurement_slots(rec, numeric_cols)

        for n_el in pv.findall(".//naitaja"):
            nm = _text(n_el, "nimetus")
            if not nm:
                continue
            col = _basseinid_naitaja_col(nm)
            if not col:
                continue
            val = _parse_float_text(_text(n_el, "sisaldus"))
            yhik = _text(n_el, "yhik")
            if col in ("iron", "manganese") and _ugl_to_mgl(yhik):
                val = val / 1000.0 if val is not None else None
            rec[col] = _merge_num(rec[col], val, col)

        rec["compliant"] = _compliant_from_hinnang(pv)
        records.append(rec)

    return _finalize_opendata_frame(pd.DataFrame(records), numeric_cols)


def _parse_joogiveeallika_opendata(tree: etree._Element) -> pd.DataFrame:
    """Opendata: корень joogiveeallika_veeproovid — структура как у veevärk (proovivott + naitaja)."""
    numeric_cols = (
        "e_coli", "coliforms", "enterococci", "nitrates", "nitrites",
        "ammonium", "fluoride", "manganese", "iron", "chlorides",
        "sulfates", "ph", "turbidity", "color",
    )
    records = []
    for pv in tree.findall(".//proovivott"):
        src = (_text(pv, "veeallikas") or "").strip()
        spot = _proovivotukoht_nimetus(pv)
        if src and spot:
            loc = f"{src} — {spot}"
        else:
            loc = src or spot or ""
        rec = _build_opendata_record(
            pv,
            domain="joogivesi",
            location=loc,
            facility=src,
            site=spot,
            extra_fields={"veeallikas_id": _text(pv, "veeallikas_id")},
        )
        _init_measurement_slots(rec, numeric_cols)

        for n_el in pv.findall(".//naitaja"):
            nm = _text(n_el, "nimetus")
            if not nm:
                continue
            col = _veevark_naitaja_col(nm)
            if not col:
                continue
            val = _parse_float_text(_text(n_el, "sisaldus"))
            yhik = _text(n_el, "yhik")
            if col in ("iron", "manganese") and _ugl_to_mgl(yhik):
                val = val / 1000.0 if val is not None else None
            rec[col] = _merge_num(rec[col], val, col)

        rec["compliant"] = _compliant_joogiveeallika(pv)
        records.append(rec)

    return _finalize_opendata_frame(pd.DataFrame(records), numeric_cols)


def parse_basseinid(xml_bytes: bytes) -> pd.DataFrame:
    tree = etree.fromstring(xml_bytes)
    root_tag = etree.QName(tree).localname
    if root_tag == "basseini_veeproovid":
        return _parse_basseinid_opendata(tree)
    return pd.DataFrame()


# ── Парсинг: старый формат (uuring) ─────────────────────────────────────────

def _parse_supluskoha_legacy(tree: etree._Element) -> pd.DataFrame:
    return _parse_supluskoha_legacy_impl(tree)


def _parse_veevark_legacy(tree: etree._Element) -> pd.DataFrame:
    return _parse_veevark_legacy_impl(tree)


# ── Публичные parse_* (автоопределение схемы) ─────────────────────────────────

def parse_supluskoha(xml_bytes: bytes) -> pd.DataFrame:
    tree = etree.fromstring(xml_bytes)
    root_tag = etree.QName(tree).localname
    if root_tag == "supluskoha_veeproovid":
        return _parse_supluskoha_opendata(tree)
    if tree.findall(".//uuring"):
        return _parse_supluskoha_legacy(tree)
    return pd.DataFrame()


def parse_veevark(xml_bytes: bytes) -> pd.DataFrame:
    tree = etree.fromstring(xml_bytes)
    root_tag = etree.QName(tree).localname
    if root_tag == "veevargi_veeproovid":
        return _parse_veevark_opendata(tree)
    if tree.findall(".//uuring"):
        return _parse_veevark_legacy(tree)
    return pd.DataFrame()


def parse_joogivesi(xml_bytes: bytes) -> pd.DataFrame:
    tree = etree.fromstring(xml_bytes)
    root_tag = etree.QName(tree).localname
    if root_tag == "joogiveeallika_veeproovid":
        return _parse_joogiveeallika_opendata(tree)
    return pd.DataFrame()


def parse_mineraalvesi(xml_bytes: bytes) -> pd.DataFrame:
    tree = etree.fromstring(xml_bytes)
    root_tag = etree.QName(tree).localname
    if root_tag == "mineraalvee_veeproovid":
        return _parse_mineraalvesi_opendata(tree)
    if tree.findall(".//uuring"):
        df = _parse_veevark_legacy(tree)
        if len(df):
            df["domain"] = "mineraalvesi"
        return df
    return pd.DataFrame()


# ── Универсальная загрузка ───────────────────────────────────────────────────

PARSERS = {
    "supluskoha": parse_supluskoha,
    "veevark": parse_veevark,
    "basseinid": parse_basseinid,
    "joogivesi": parse_joogivesi,
    "mineraalvesi": parse_mineraalvesi,
}


def load_domain(
    domain_key: str,
    use_cache: bool = True,
    years: Optional[List[int]] = None,
    infer_county: bool = True,
    geocode_county: bool = False,
    geocode_limit: Optional[int] = None,
) -> pd.DataFrame:
    """
    Загрузить домен: несколько годов opendata, объединить в один DataFrame.

    Параметры:
        domain_key: supluskoha | veevark | basseinid | joogivesi | mineraalvesi
        use_cache: читать data/raw/{domain}_{year}.xml
        years: список лет (по умолчанию текущий и 5 предыдущих)
        infer_county: заполнить пустой maakond из overrides + кэша (+ опционально Google Geocoding)
        geocode_county: HTTP к Google Geocoding (медленно; см. geocode_limit; ключ GOOGLE_MAPS_GEOCODING_API_KEY из env)
        geocode_limit: макс. новых геозапросов за вызов (None по умолчанию = все отсутствующие в кэше; для лимита укажите число)
    """
    if domain_key not in PARSERS:
        raise NotImplementedError(
            f"Парсер для '{domain_key}' ещё не реализован. "
            f"Реализовано: {list(PARSERS.keys())}"
        )

    blobs = load_domain_xml_blobs(domain_key, years=years, use_cache=use_cache)
    parts = [PARSERS[domain_key](b) for b in blobs]
    parts = [p for p in parts if len(p) > 0]
    if not parts:
        df = pd.DataFrame()
    else:
        df = pd.concat(parts, ignore_index=True)

    # Нормализованный ключ места: убирает суффиксы типа объекта и нормализует
    # пунктуацию/регистр, чтобы 'Harku järve supluskoht' и 'Harku järve rand'
    # считались одним местом при агрегации. Подробности: normalize_location().
    if len(df) > 0 and "location" in df.columns:
        df["location_key"] = df["location"].fillna("").apply(
            lambda s: normalize_location(s, domain_key)
        )

    if len(df) > 0 and domain_key in ("supluskoha", "veevark", "basseinid", "joogivesi", "mineraalvesi"):
        from terviseamet_reference_coords import attach_official_coords_to_df

        df = attach_official_coords_to_df(df, domain_key, use_cache=use_cache)

    print(
        f"[data_loader] {domain_key}: {len(df)} проб, "
        f"{df['compliant'].notna().sum() if len(df) else 0} с известным статусом"
    )
    if infer_county and len(df) > 0:
        from county_infer import enrich_county_column

        df = enrich_county_column(
            df,
            geocode=geocode_county,
            geocode_limit=geocode_limit,
        )
    return df


def load_all(
    domains: Optional[list] = None,
    use_cache: bool = True,
    infer_county: bool = True,
    geocode_county: bool = False,
    geocode_limit: Optional[int] = None,
) -> pd.DataFrame:
    """
    Загрузить несколько доменов и объединить в один DataFrame.

    infer_county выполняется один раз по объединённой таблице. При geocode_county=True и
    geocode_limit=None (по умолчанию) к Google Geocoding идут все уникальные локации без county в кэше.
    """
    if domains is None:
        domains = ["supluskoha", "veevark", "basseinid", "joogivesi"]

    dfs = []
    for domain_key in domains:
        try:
            df = load_domain(
                domain_key,
                use_cache=use_cache,
                infer_county=False,
            )
            dfs.append(df)
        except Exception as e:
            print(f"[data_loader] ОШИБКА при загрузке {domain_key}: {e}")

    if not dfs:
        raise RuntimeError("Не удалось загрузить ни один домен.")

    combined = pd.concat(dfs, ignore_index=True)
    print(f"[data_loader] Итого: {len(combined)} проб из {len(dfs)} доменов")
    if infer_county and len(combined) > 0:
        from county_infer import enrich_county_column

        combined = enrich_county_column(
            combined,
            geocode=geocode_county,
            geocode_limit=geocode_limit,
        )
    return combined


def save_combined_csv(df: pd.DataFrame, filename: str = "raw_combined.csv") -> Path:
    """Сохранить объединённый DataFrame в data/processed/."""
    out_dir = Path(__file__).parent.parent / "data" / "processed"
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / filename
    df.to_csv(path, index=False)
    print(f"[data_loader] Сохранено: {path}")
    return path


# ── Вспомогательные функции ───────────────────────────────────────────────────

def _text(element: Optional[etree._Element], path: str) -> Optional[str]:
    return _text_impl(element, path)


def _float(element: etree._Element, path: str) -> Optional[float]:
    return _float_impl(element, path)


def _proovivotukoht_nimetus(pv: etree._Element) -> str:
    """Название места отбора пробы (proovivotukoht/nimetus), если есть в XML."""
    return _proovivotukoht_nimetus_impl(pv)


def _proovivotukoht_id(pv: etree._Element) -> Optional[str]:
    """Идентификатор proovivotukoht (для джойна со справочником координат Terviseamet)."""
    return _proovivotukoht_id_impl(pv)


# ── Быстрая проверка ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Тест загрузки: supluskoha")
    df = load_domain("supluskoha")
    print(df.head())
    print(f"\nФормат: {df.shape}")
    print(f"\nРаспределение compliant:\n{df['compliant'].value_counts()}")
