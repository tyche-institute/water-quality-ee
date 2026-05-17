"""
export_submission_figures.py — генерация PNG-графиков и CSV-таблицы для итоговой
сдачи (submission/figures/, submission/tables/).

Источники:
  data/processed/ml_ready.joblib       — X/y train/test (random 80/20 stratified)
  data/processed/trained_models.joblib — LR, RF, GB, RF_best (4-я модель)
  data/processed/raw_combined.csv      — исходный объединённый датасет (для EDA)

LightGBM не сохранён в joblib — обучается прямо в скрипте на X_train (быстро).

Usage:
  .venv/bin/python scripts/export_submission_figures.py
"""

from __future__ import annotations

import json
import warnings
from pathlib import Path

import joblib
import lightgbm as lgb
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
from sklearn.calibration import CalibratedClassifierCV, CalibrationDisplay
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    roc_curve,
)

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

ROOT = Path(__file__).resolve().parents[1]
PROC = ROOT / "data" / "processed"
OUT_FIG = ROOT / "submission" / "figures"
OUT_TBL = ROOT / "submission" / "tables"
OUT_FIG.mkdir(parents=True, exist_ok=True)
OUT_TBL.mkdir(parents=True, exist_ok=True)

# Brand-aligned palette (h2oatlas blue + complementary)
BLUE = "#0d6efd"
RED = "#dc3545"
GREEN = "#198754"
ORANGE = "#fd7e14"
GRAY = "#6c757d"


def cls_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> dict:
    """Метрики для класса 0 (нарушение) — приоритет проекта."""
    rep = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
    cls0 = rep["0"]
    return {
        "roc_auc": roc_auc_score(y_true, y_prob),
        "recall_violation": cls0["recall"],
        "precision_violation": cls0["precision"],
        "f1_violation": cls0["f1-score"],
        "accuracy": rep["accuracy"],
    }


def main() -> None:
    print("Loading ml_ready + trained_models …")
    ml = joblib.load(PROC / "ml_ready.joblib")
    tm = joblib.load(PROC / "trained_models.joblib")
    X_train, X_test = ml["X_train"], ml["X_test"]
    y_train, y_test = ml["y_train"].to_numpy(), ml["y_test"].to_numpy()
    feature_names = ml["feature_names"]
    print(f"  X_train {X_train.shape}, X_test {X_test.shape}, "
          f"violation rate train={1 - y_train.mean():.3f}, test={1 - y_test.mean():.3f}")

    print("Training LightGBM (not cached in joblib) …")
    lgbm = lgb.LGBMClassifier(
        n_estimators=400,
        learning_rate=0.05,
        max_depth=-1,
        num_leaves=63,
        class_weight="balanced",
        random_state=42,
        n_jobs=4,
        verbose=-1,
    )
    lgbm.fit(X_train, y_train)

    models = {
        "Logistic Regression": tm["lr"],
        "Random Forest":       tm["rf"],
        "Gradient Boosting":   tm["gb"],
        "LightGBM":            lgbm,
    }

    rows = []
    proba_cache: dict[str, np.ndarray] = {}
    for name, mdl in models.items():
        y_prob = mdl.predict_proba(X_test)[:, 1]   # P(class=1 = compliant)
        y_pred = mdl.predict(X_test)
        m = cls_metrics(y_test, y_pred, y_prob)
        proba_cache[name] = y_prob
        rows.append({"model": name, **m})
        print(f"  {name:<22s}  AUC={m['roc_auc']:.4f}  "
              f"Recall(0)={m['recall_violation']:.4f}  "
              f"Precision(0)={m['precision_violation']:.4f}  "
              f"F1(0)={m['f1_violation']:.4f}")

    df_metrics = pd.DataFrame(rows).round(4)
    csv_path = OUT_TBL / "model_comparison.csv"
    df_metrics.to_csv(csv_path, index=False)
    print(f"  → {csv_path.relative_to(ROOT)}")

    # ── 1. Class balance ────────────────────────────────────────────────────
    print("Plot: class_balance.png")
    y_full = np.concatenate([y_train, y_test])
    n_viol = int((y_full == 0).sum())
    n_ok   = int((y_full == 1).sum())
    fig, ax = plt.subplots(figsize=(5.5, 4.0))
    bars = ax.bar(["Violation (0)", "Compliant (1)"], [n_viol, n_ok],
                  color=[RED, BLUE], edgecolor="white")
    for b, v in zip(bars, [n_viol, n_ok]):
        pct = v / len(y_full) * 100
        ax.text(b.get_x() + b.get_width() / 2, b.get_height() + len(y_full) * 0.005,
                f"{v:,}\n({pct:.1f}%)", ha="center", va="bottom", fontsize=10)
    ax.set_ylabel("Number of probes")
    ax.set_title(f"Class balance — total {len(y_full):,} probes")
    ax.grid(axis="y", alpha=0.25)
    plt.tight_layout()
    fig.savefig(OUT_FIG / "class_balance.png", dpi=160)
    plt.close(fig)

    # ── 2. ROC curves for 4 models ──────────────────────────────────────────
    print("Plot: roc_curves_4_models.png")
    fig, ax = plt.subplots(figsize=(6.5, 5.0))
    palette = {"Logistic Regression": GRAY, "Random Forest": GREEN,
               "Gradient Boosting": ORANGE, "LightGBM": BLUE}
    for name, prob in proba_cache.items():
        fpr, tpr, _ = roc_curve(y_test, prob)
        auc = roc_auc_score(y_test, prob)
        ax.plot(fpr, tpr, label=f"{name} (AUC={auc:.3f})",
                color=palette[name], linewidth=2 if name == "LightGBM" else 1.4)
    ax.plot([0, 1], [0, 1], "k--", alpha=0.5, label="Random baseline")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC curves — 4 models on hold-out test")
    ax.legend(loc="lower right", fontsize=9)
    ax.grid(alpha=0.25)
    plt.tight_layout()
    fig.savefig(OUT_FIG / "roc_curves_4_models.png", dpi=160)
    plt.close(fig)

    # ── 3. Model comparison bar chart ───────────────────────────────────────
    print("Plot: model_comparison_temporal.png")
    metrics_to_plot = ["roc_auc", "recall_violation", "precision_violation", "f1_violation"]
    labels = ["ROC-AUC", "Recall (viol.)", "Precision (viol.)", "F1 (viol.)"]
    fig, ax = plt.subplots(figsize=(8.5, 4.5))
    bar_w = 0.2
    x = np.arange(len(metrics_to_plot))
    for i, (name, color) in enumerate(palette.items()):
        vals = [df_metrics.loc[df_metrics.model == name, m].iloc[0] for m in metrics_to_plot]
        ax.bar(x + i * bar_w - 1.5 * bar_w, vals, bar_w, label=name, color=color, edgecolor="white")
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_ylabel("Score")
    ax.set_ylim(0, 1.05)
    ax.set_title("Model comparison — class-0 (violation) priority metrics")
    ax.legend(fontsize=9, loc="lower right")
    ax.grid(axis="y", alpha=0.25)
    plt.tight_layout()
    fig.savefig(OUT_FIG / "model_comparison_temporal.png", dpi=160)
    plt.close(fig)

    # ── 4. Confusion matrix for best model (LightGBM) ───────────────────────
    print("Plot: confusion_matrix_lightgbm.png")
    y_pred_lgb = lgbm.predict(X_test)
    cm = confusion_matrix(y_test, y_pred_lgb)
    fig, ax = plt.subplots(figsize=(5.0, 4.5))
    im = ax.imshow(cm, cmap="Blues")
    for i in range(2):
        for j in range(2):
            ax.text(j, i, f"{cm[i, j]:,}", ha="center", va="center",
                    color="white" if cm[i, j] > cm.max() / 2 else "black",
                    fontsize=12, fontweight="bold")
    ax.set_xticks([0, 1]); ax.set_yticks([0, 1])
    ax.set_xticklabels(["Pred Violation", "Pred Compliant"])
    ax.set_yticklabels(["True Violation", "True Compliant"])
    ax.set_title("Confusion matrix — LightGBM\n(red box = missed violations / FN)")
    # FN is at row=0 (true viol), col=1 (pred compliant)
    ax.add_patch(plt.Rectangle((0.5, -0.5), 1, 1, fill=False,
                                edgecolor=RED, linewidth=3))
    plt.colorbar(im, ax=ax, fraction=0.045)
    plt.tight_layout()
    fig.savefig(OUT_FIG / "confusion_matrix_lightgbm.png", dpi=160)
    plt.close(fig)

    # ── 5. Calibration curve ────────────────────────────────────────────────
    # NB: skip CalibratedClassifierCV (it deadlocks with LightGBM n_jobs=-1).
    # We show raw calibration of all four models on the test set instead.
    print("Plot: calibration_curve.png")
    from sklearn.calibration import calibration_curve
    fig, ax = plt.subplots(figsize=(6.5, 5.0))
    for name, prob in proba_cache.items():
        frac_pos, mean_pred = calibration_curve(y_test, prob, n_bins=10, strategy="quantile")
        ax.plot(mean_pred, frac_pos, marker="o", linewidth=1.6,
                color=palette[name], label=name)
    ax.plot([0, 1], [0, 1], "k--", alpha=0.5, label="Perfectly calibrated")
    ax.set_xlabel("Predicted P(compliant)")
    ax.set_ylabel("Observed fraction compliant")
    ax.set_title("Calibration curve (10 quantile bins)")
    ax.legend(fontsize=9, loc="upper left")
    ax.grid(alpha=0.25)
    plt.tight_layout()
    fig.savefig(OUT_FIG / "calibration_curve.png", dpi=160)
    plt.close(fig)

    # ── 6. SHAP top-10 ──────────────────────────────────────────────────────
    print("Plot: shap_top10.png  (this may take ~20 s)")
    sample = X_test.sample(n=min(800, len(X_test)), random_state=42)
    explainer = shap.TreeExplainer(lgbm)
    sv = explainer.shap_values(sample)
    if isinstance(sv, list):  # binary may return list of two arrays
        sv = sv[1]
    mean_abs = np.abs(sv).mean(axis=0)
    order = np.argsort(mean_abs)[::-1][:10]
    top_features = [feature_names[i] for i in order][::-1]
    top_values = mean_abs[order][::-1]
    fig, ax = plt.subplots(figsize=(7.0, 5.5))
    ax.barh(top_features, top_values, color=BLUE, edgecolor="white")
    ax.set_xlabel("mean(|SHAP value|)")
    ax.set_title("SHAP feature importance — top 10 (LightGBM)")
    ax.grid(axis="x", alpha=0.25)
    plt.tight_layout()
    fig.savefig(OUT_FIG / "shap_top10.png", dpi=160)
    plt.close(fig)
    # Save underlying values too
    pd.DataFrame({"feature": top_features[::-1], "mean_abs_shap": top_values[::-1]}) \
        .to_csv(OUT_TBL / "shap_top10.csv", index=False)

    # ── 7. Seasonal violations (from raw_combined.csv if available) ─────────
    print("Plot: seasonal_violations.png")
    raw_path = PROC / "raw_combined.csv"
    if raw_path.exists():
        raw = pd.read_csv(raw_path, parse_dates=["sample_date"], low_memory=False)
        raw = raw.dropna(subset=["compliant", "sample_date"])
        raw["month"] = raw["sample_date"].dt.month
        raw["season"] = pd.cut(
            raw["month"],
            bins=[0, 2, 5, 8, 11, 12],
            labels=["Winter", "Spring", "Summer", "Autumn", "Winter "],
            include_lowest=True,
        ).astype(str).str.strip()
        seasonal = raw.groupby(["domain", "season"])["compliant"].apply(
            lambda s: (s == 0).mean() * 100
        ).unstack(fill_value=0)
        order = ["Winter", "Spring", "Summer", "Autumn"]
        seasonal = seasonal.reindex(columns=[c for c in order if c in seasonal.columns])
        fig, ax = plt.subplots(figsize=(7.5, 4.5))
        seasonal.T.plot(kind="bar", ax=ax,
                        color=[BLUE, GREEN, ORANGE, GRAY][:len(seasonal.index)],
                        edgecolor="white")
        ax.set_ylabel("Violation rate, %")
        ax.set_xlabel("Season")
        ax.set_title("Violation rate by season and domain")
        ax.legend(title="Domain", fontsize=8)
        ax.grid(axis="y", alpha=0.25)
        plt.xticks(rotation=0)
        plt.tight_layout()
        fig.savefig(OUT_FIG / "seasonal_violations.png", dpi=160)
        plt.close(fig)
    else:
        print("  raw_combined.csv missing — skipped")

    # Dump aggregate counts for use in report
    summary = {
        "n_total":        int(len(y_full)),
        "n_violations":   n_viol,
        "n_compliant":    n_ok,
        "violation_pct":  round(n_viol / len(y_full) * 100, 2),
        "n_train":        int(len(y_train)),
        "n_test":         int(len(y_test)),
        "n_features":     int(X_train.shape[1]),
        "best_model":     "LightGBM",
        "best_metrics":   {k: float(v) for k, v in
                           df_metrics.loc[df_metrics.model == "LightGBM"].iloc[0].drop("model").items()},
    }
    (OUT_TBL / "summary.json").write_text(json.dumps(summary, indent=2))
    print(f"  → {(OUT_TBL / 'summary.json').relative_to(ROOT)}")
    print("\nAll figures and tables exported to submission/figures and submission/tables.")


if __name__ == "__main__":
    main()
