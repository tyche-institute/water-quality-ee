from __future__ import annotations

import importlib.util
import sys
import types
from pathlib import Path

import pandas as pd
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "citizen-service" / "scripts" / "build_citizen_snapshot.py"


def load_module():
    spec = importlib.util.spec_from_file_location("build_citizen_snapshot", SCRIPT_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_train_models_and_attach_probabilities_returns_bundle_and_prob_columns(monkeypatch):
    module = load_module()
    df = pd.DataFrame({"stub": [1, 2, 3]})

    X = pd.DataFrame({"f1": [0.0, 1.0, 2.0], "f2": [1.0, 1.0, 1.0]})
    y = pd.Series([0, 1, 0])
    meta = pd.DataFrame({"domain": ["veevark"] * 3, "sample_date": pd.to_datetime(["2026-05-01"] * 3)})

    class FakeEstimator:
        def __init__(self, *args, **kwargs):
            self.fit_calls = []

        def fit(self, X_fit, y_fit, sample_weight=None):
            self.fit_calls.append((len(X_fit), len(y_fit), sample_weight is not None))
            return self

        def predict_proba(self, X_pred):
            return np.array([[0.2, 0.8] for _ in range(len(X_pred))])

    class FakeImputer:
        def __init__(self, *args, **kwargs):
            pass

        def fit_transform(self, X_fit):
            return X_fit.to_numpy()

    class FakeScaler:
        def fit_transform(self, X_fit):
            return X_fit

    monkeypatch.setattr(module, "build_dataset_with_meta", lambda frame: (X, y, meta))
    monkeypatch.setattr(module, "SimpleImputer", FakeImputer)
    monkeypatch.setattr(module, "RobustScaler", lambda: FakeScaler())
    monkeypatch.setattr(module, "LogisticRegression", FakeEstimator)
    monkeypatch.setattr(module, "RandomForestClassifier", FakeEstimator)
    monkeypatch.setattr(module, "GradientBoostingClassifier", FakeEstimator)
    monkeypatch.setattr(module, "_timer_print", lambda *args, **kwargs: None)
    monkeypatch.setitem(sys.modules, "lightgbm", types.SimpleNamespace(LGBMClassifier=FakeEstimator))

    full, feature_frame, bundle = module.train_models_and_attach_probabilities(
        df,
        timer_start=0.0,
        timer_last=[0.0],
    )

    assert list(feature_frame.columns) == ["f1", "f2"]
    assert "lr_violation_prob" in full.columns
    assert "rf_violation_prob" in full.columns
    assert "gb_violation_prob" in full.columns
    assert "lgbm_violation_prob" in full.columns
    assert "model_violation_prob" in full.columns
    assert bundle["models"] == ["lr", "rf", "gb", "lgbm"]
    assert bundle["clf_lgbm"] is not None
    assert bundle["clf"] is bundle["clf_rf"]


def test_save_model_bundle_writes_artifact(monkeypatch, tmp_path):
    module = load_module()
    target = tmp_path / "artifacts"
    target.mkdir()

    monkeypatch.setattr(module, "ARTIFACTS", target)
    dumped = {}
    monkeypatch.setattr(module.joblib, "dump", lambda bundle, path: dumped.update({"bundle": bundle, "path": path}))
    monkeypatch.setattr(module, "_timer_print", lambda *args, **kwargs: None)

    bundle = {"models": ["lr", "rf"]}
    module.save_model_bundle(bundle, timer_start=0.0, timer_last=[0.0])

    assert dumped["bundle"] == bundle
    assert dumped["path"] == target / "citizen_model.joblib"
