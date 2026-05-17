from __future__ import annotations

from typing import Optional

import pandas as pd
from lxml import etree


def text(element: Optional[etree._Element], path: str) -> Optional[str]:
    if element is None:
        return None
    found = element.find(path)
    if found is not None and found.text:
        return found.text.strip()
    return None


def float_text(element: etree._Element, path: str) -> Optional[float]:
    value = text(element, path)
    if value is None:
        return None
    value = value.replace(",", ".")
    try:
        return float(value)
    except ValueError:
        return None


def proovivotukoht_nimetus(pv: etree._Element) -> str:
    pk = pv.find("proovivotukoht")
    if pk is None:
        return ""
    name = text(pk, "nimetus")
    return (name or "").strip()


def proovivotukoht_id(pv: etree._Element) -> Optional[str]:
    pk = pv.find("proovivotukoht")
    if pk is None:
        return None
    return text(pk, "id")


def legacy_compliant(uuring: etree._Element) -> Optional[int]:
    values = [value.text for value in uuring.findall(".//vastavus") if value.text]
    if not values:
        return None
    if any(value.lower() == "ei" for value in values):
        return 0
    return 1


def finalize_legacy_frame(records: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(records)
    if len(df) and "sample_date" in df.columns:
        df["sample_date"] = pd.to_datetime(df["sample_date"], errors="coerce")
    return df


def parse_supluskoha_legacy(tree: etree._Element) -> pd.DataFrame:
    records = []
    for uuring in tree.findall(".//uuring"):
        records.append(
            {
                "domain": "supluskoha",
                "sample_id": text(uuring, "id"),
                "location": text(uuring, "koht") or text(uuring, "asukoht"),
                "county": text(uuring, "maakond"),
                "sample_date": text(uuring, "kuupaev") or text(uuring, "proovivotmise_kuupaev"),
                "e_coli": float_text(uuring, ".//naiturid_e_coli/vaartus"),
                "enterococci": float_text(uuring, ".//naiturid_enterokokid/vaartus"),
                "ph": float_text(uuring, ".//naiturid_ph/vaartus"),
                "transparency": float_text(uuring, ".//naiturid_labipaistvus/vaartus"),
                "compliant": legacy_compliant(uuring),
            }
        )
    return finalize_legacy_frame(records)


def parse_veevark_legacy(tree: etree._Element) -> pd.DataFrame:
    records = []
    for uuring in tree.findall(".//uuring"):
        records.append(
            {
                "domain": "veevark",
                "sample_id": text(uuring, "id"),
                "location": text(uuring, "asukoht") or text(uuring, "koht"),
                "county": text(uuring, "maakond"),
                "sample_date": text(uuring, "kuupaev") or text(uuring, "proovivotmise_kuupaev"),
                "e_coli": float_text(uuring, ".//e_coli/vaartus"),
                "coliforms": float_text(uuring, ".//koliformid/vaartus"),
                "enterococci": float_text(uuring, ".//enterokokid/vaartus"),
                "nitrates": float_text(uuring, ".//nitraadid/vaartus"),
                "nitrites": float_text(uuring, ".//nitritid/vaartus"),
                "ammonium": float_text(uuring, ".//ammoonium/vaartus"),
                "fluoride": float_text(uuring, ".//fluoriid/vaartus"),
                "manganese": float_text(uuring, ".//mangaan/vaartus"),
                "iron": float_text(uuring, ".//raud/vaartus"),
                "chlorides": float_text(uuring, ".//kloriidid/vaartus"),
                "sulfates": float_text(uuring, ".//sulfaadid/vaartus"),
                "ph": float_text(uuring, ".//ph/vaartus"),
                "turbidity": float_text(uuring, ".//hägusus/vaartus"),
                "color": float_text(uuring, ".//varvus/vaartus"),
                "compliant": legacy_compliant(uuring),
            }
        )
    return finalize_legacy_frame(records)
