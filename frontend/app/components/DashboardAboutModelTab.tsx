"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";

type QuickInsight = {
  key: string;
  label: string;
  value: string;
  level: "good" | "warn" | "bad";
};

type MetricGuideEntry = {
  title: string;
  precise: string;
  intuitive: string;
  reading: string;
};

type Props = {
  lang: DashboardLang;
  tabTitle: string;
  aboutModel: string;
  metricGuideTitle: string;
  metricGuide: {
    roc: MetricGuideEntry;
    pr: MetricGuideEntry;
    calibration: MetricGuideEntry;
    shap: MetricGuideEntry;
  };
  quickInsights: QuickInsight[];
  severityLabel: (level: "good" | "warn" | "bad") => string;
  onOpenExpertMode: () => void;
};

const MODEL_COMPARISON = [
  { name: "LR", auc: 0.947, recall: 0.89, precision: 0.56 },
  { name: "RF", auc: 0.981, recall: 0.929, precision: 0.791 },
  { name: "GB", auc: 0.982, recall: 0.887, precision: 0.887 },
  { name: "LGBM", auc: 0.984, recall: 0.949, precision: 0.8 },
] as const;

const TOP_SHAP_FEATURES = [
  { param: "iron", shap: 1.217, ru: "Железо", et: "Raud", en: "Iron" },
  { param: "color", shap: 0.751, ru: "Цветность", et: "Värvus", en: "Color" },
  { param: "coliforms", shap: 0.591, ru: "Колиформы", et: "Kolibakterid", en: "Coliforms" },
  { param: "manganese", shap: 0.478, ru: "Марганец", et: "Mangaan", en: "Manganese" },
  { param: "e_coli", shap: 0.312, ru: "E. coli", et: "E. coli", en: "E. coli" },
] as const;

export default function DashboardAboutModelTab({
  lang,
  tabTitle,
  aboutModel,
  metricGuideTitle,
  metricGuide,
  quickInsights,
  severityLabel,
  onOpenExpertMode,
}: Props) {
  return (
    <div>
      <h4>{tabTitle}</h4>
      <p className="hint">{aboutModel}</p>

      <div style={{ margin: "1rem 0 0.5rem" }}>
        <h5 style={{ marginBottom: "0.5rem" }}>
          {lruet(lang, "Сравнение 4 моделей", "4 mudeli võrdlus", "4-model comparison")}
          <span className="hint" style={{ fontWeight: 400, marginLeft: "0.5rem" }}>
            {lruet(lang, "(темпоральный split, тест 2025+)", "(temporal split, test 2025+)", "(temporal split, test 2025+)")}
          </span>
        </h5>
        {MODEL_COMPARISON.map((model) => (
          <div key={`mc-${model.name}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span style={{ width: "3.2rem", fontWeight: 600, fontSize: "0.82rem", fontFamily: "var(--font-latin-ui)" }}>{model.name}</span>
            <div style={{ flex: 1, display: "flex", gap: "3px", height: "18px" }}>
              <div title={`AUC ${model.auc}`} style={{ width: `${model.auc * 100}%`, background: "var(--brand, #2563eb)", borderRadius: "3px 0 0 3px", minWidth: "2px", opacity: 0.85 }} />
              <div title={`Recall ${model.recall}`} style={{ width: `${model.recall * 100}%`, background: "var(--good, #139b55)", minWidth: "2px", opacity: 0.8 }} />
              <div title={`Precision ${model.precision}`} style={{ width: `${model.precision * 100}%`, background: "var(--warn, #e38f00)", borderRadius: "0 3px 3px 0", minWidth: "2px", opacity: 0.75 }} />
            </div>
            <span className="hint" style={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>AUC {model.auc.toFixed(3)}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem", fontSize: "0.72rem" }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--brand, #2563eb)", borderRadius: 2, marginRight: 3, verticalAlign: "middle", opacity: 0.85 }} />AUC</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--good, #139b55)", borderRadius: 2, marginRight: 3, verticalAlign: "middle", opacity: 0.8 }} />Recall</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--warn, #e38f00)", borderRadius: 2, marginRight: 3, verticalAlign: "middle", opacity: 0.75 }} />Precision</span>
        </div>
      </div>

      <div className="stats" style={{ marginTop: "0.75rem" }}>
        <div className="stat">
          <div className="k">{lruet(lang, "Проб в корпусе", "Proove korpuses", "Corpus probes")}</div>
          <div className="v" style={{ fontFamily: "var(--font-latin-ui)" }}>69 536</div>
        </div>
        <div className="stat">
          <div className="k">{lruet(lang, "Фичей модели", "Tunnuseid", "Features")}</div>
          <div className="v" style={{ fontFamily: "var(--font-latin-ui)" }}>72</div>
        </div>
        <div className="stat">
          <div className="k">{lruet(lang, "Лучшая модель", "Parim mudel", "Best model")}</div>
          <div className="v">LightGBM <span className="badge good">AUC 0.984</span></div>
        </div>
      </div>

      <div className="stats" style={{ marginTop: "0.5rem" }}>
        {quickInsights.map((item) => (
          <div className="stat" key={`ip-qim-${item.key}`}>
            <div className="k">{item.label}</div>
            <div className="v">{item.value} <span className={`badge ${item.level}`}>{severityLabel(item.level)}</span></div>
          </div>
        ))}
      </div>

      <div style={{ margin: "0.75rem 0 0.5rem" }}>
        <h5 style={{ marginBottom: "0.4rem" }}>
          {lruet(lang, "Топ-5 предикторов (SHAP)", "Top-5 ennustajat (SHAP)", "Top-5 predictors (SHAP)")}
        </h5>
        {TOP_SHAP_FEATURES.map((feature) => (
          <div key={`shap-${feature.param}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span style={{ width: "5.5rem", fontSize: "0.78rem", color: "var(--muted)" }}>{lruet(lang, feature.ru, feature.et, feature.en)}</span>
            <div style={{ flex: 1, height: "12px", background: "var(--panel-soft, #eef1f5)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ width: `${Math.min((feature.shap / 1.3) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, var(--bad, #dc3545), #ff6b6b)", borderRadius: 6, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ width: "2.8rem", textAlign: "right", fontSize: "0.72rem", fontFamily: "var(--font-latin-ui)", fontWeight: 600 }}>{feature.shap.toFixed(3)}</span>
          </div>
        ))}
        <p className="hint" style={{ fontSize: "0.7rem", marginTop: "0.2rem" }}>
          {lruet(
            lang,
            "SHAP: средний абсолютный вклад в предсказание. Чем длиннее полоска, тем сильнее параметр влияет на риск.",
            "SHAP: keskmine absoluutne panus ennustusse. Pikem riba = suurem mõju riskile.",
            "SHAP: mean absolute contribution to prediction. Longer bar = stronger impact on risk."
          )}
        </p>
      </div>

      <p className="hint" style={{ marginTop: "0.75rem" }}>
        {lang === "ru"
          ? "4 уровня оценки качества: ROC-AUC (разделение классов), Precision/Recall (баланс ошибок), калибровка (доверие к вероятности) и SHAP (пояснение причин прогноза)."
          : lang === "et"
            ? "4 hindamistaset: ROC-AUC, Precision/Recall, kalibreeritus ja SHAP selgitused."
            : "Four levels of model assessment: ROC-AUC (class separation), Precision/Recall (error trade-off), Calibration (probability trust) and SHAP (per-prediction explanation)."}
      </p>

      <div className="tableWrap compact mobileResponsiveTable" style={{ marginTop: "0.75rem" }}>
        <table className="table">
          <thead>
            <tr>
              <th>{lruet(lang, "Уровень", "Tase", "Level")}</th>
              <th>{lruet(lang, "Вопрос", "Küsimus", "Question")}</th>
              <th>{lruet(lang, "Метрика", "Mõõdik", "Metric")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{lruet(lang, "Разделяет ли модель классы?", "Kas mudel eristab klasse?", "Does the model separate classes?")}</td>
              <td>ROC-AUC</td>
            </tr>
            <tr>
              <td>2</td>
              <td>{lruet(lang, "Какие ошибки?", "Milliseid vigu?", "What errors?")}</td>
              <td>Precision / Recall</td>
            </tr>
            <tr>
              <td>3</td>
              <td>{lruet(lang, "Калиброваны ли вероятности?", "Kui hästi kalibreeritud?", "Calibrated?")}</td>
              <td>Calibration</td>
            </tr>
            <tr>
              <td>4</td>
              <td>{lruet(lang, "Почему этот риск?", "Miks just see risk?", "Why this risk?")}</td>
              <td>SHAP</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 style={{ marginTop: "1rem" }}>{metricGuideTitle}</h4>
      <div className="infoCardGrid">
        {(["roc", "pr", "calibration", "shap"] as const).map((key) => (
          <article key={`ipg-${key}`} className="infoCard">
            <div className="infoCardHead">
              <span className="infoCardIcon" aria-hidden>
                {key === "roc" ? "📈" : key === "pr" ? "🎯" : key === "calibration" ? "⚖️" : "🧠"}
              </span>
              <div>
                <h5>{metricGuide[key].title}</h5>
              </div>
            </div>
            <p className="hint"><b>{lruet(lang, "Точно:", "Täpselt:", "Precise:")}</b> {metricGuide[key].precise}</p>
            <p className="hint"><b>{lruet(lang, "Интуиция:", "Intuitsioon:", "Intuition:")}</b> {metricGuide[key].intuitive}</p>
            <p className="hint"><b>{lruet(lang, "Как читать:", "Kuidas lugeda:", "How to read:")}</b> {metricGuide[key].reading}</p>
          </article>
        ))}
      </div>

      <button className="btn btnSmall" style={{ marginTop: "0.6rem" }} onClick={onOpenExpertMode}>
        {lruet(lang, "Подробнее (режим эксперта)", "Rohkem (eksperdireziim)", "More (expert mode)")}
      </button>
    </div>
  );
}
