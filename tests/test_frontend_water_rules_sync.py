import json
from pathlib import Path

from features import NORMS, NORMS_POOL


def test_frontend_water_rules_match_backend_norms():
    path = Path(__file__).resolve().parents[1] / "frontend" / "app" / "lib" / "water-rules.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    rules = payload["rules"]

    assert rules["free_chlorine"]["basseinid"]["min"] == NORMS_POOL["free_chlorine_min"]
    assert rules["free_chlorine"]["basseinid"]["max"] == NORMS_POOL["free_chlorine_max"]
    assert rules["combined_chlorine"]["basseinid"]["max"] == NORMS_POOL["combined_chlorine"]
    assert rules["turbidity"]["basseinid"]["max"] == NORMS_POOL["turbidity"]
    assert rules["iron"]["default"]["max"] == NORMS["iron"]
    assert rules["manganese"]["default"]["max"] == NORMS["manganese"]
    assert rules["nitrates"]["default"]["max"] == NORMS["nitrates"]
