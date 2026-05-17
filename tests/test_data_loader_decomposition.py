import pandas as pd

from data_loader import _build_opendata_record, _finalize_opendata_frame
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_data_loader_entrypoint_keeps_shrinking() -> None:
    lines = (ROOT / "src" / "data_loader.py").read_text(encoding="utf-8").splitlines()
    assert len(lines) <= 880


def test_build_opendata_record_bootstraps_shared_fields():
    class DummyPv:
        pass

    pv = DummyPv()

    import data_loader as dl

    original_text = dl._text
    original_pt_id = dl._proovivotukoht_id
    try:
        dl._text = lambda element, path: {
            "id": "42",
            "maakond": "Harju maakond",
            "proovivotu_aeg": "11.05.2026",
        }.get(path)
        dl._proovivotukoht_id = lambda element: "pt-99"

        record = _build_opendata_record(
            pv,
            domain="veevark",
            location="Example",
            facility="Facility",
            site="Site",
            extra_fields={"veevark_id": "vv-1"},
        )
    finally:
        dl._text = original_text
        dl._proovivotukoht_id = original_pt_id

    assert record["domain"] == "veevark"
    assert record["sample_id"] == "42"
    assert record["proovivotukoht_id"] == "pt-99"
    assert record["county"] == "Harju maakond"
    assert record["sample_date"] == "11.05.2026"
    assert record["veevark_id"] == "vv-1"


def test_finalize_opendata_frame_normalizes_dates_and_numeric_columns():
    df = pd.DataFrame(
        [
            {"sample_date": "11.05.2026", "iron": "0,18", "ph": "7,2", "other": "x"},
        ]
    )
    out = _finalize_opendata_frame(df, ("iron", "ph"))

    assert pd.api.types.is_datetime64_any_dtype(out["sample_date"])
    assert out.iloc[0]["iron"] == 0.18
    assert out.iloc[0]["ph"] == 7.2
    assert out.iloc[0]["other"] == "x"


def test_data_loader_uses_support_module_for_download_and_normalization_helpers():
    loader = (ROOT / "src" / "data_loader.py").read_text(encoding="utf-8")
    support = (ROOT / "src" / "data_loader_support.py").read_text(encoding="utf-8")

    assert "from data_loader_support import (" in loader
    assert "def download_xml(" in support
    assert "def load_domain_xml_blobs(" in support
    assert "def normalize_location(" in support


def test_data_loader_uses_legacy_module_for_legacy_xml_helpers():
    loader = (ROOT / "src" / "data_loader.py").read_text(encoding="utf-8")
    legacy = (ROOT / "src" / "data_loader_legacy.py").read_text(encoding="utf-8")

    assert "from data_loader_legacy import (" in loader
    assert "def parse_supluskoha_legacy(" in legacy
    assert "def parse_veevark_legacy(" in legacy
    assert "def proovivotukoht_id(" in legacy
