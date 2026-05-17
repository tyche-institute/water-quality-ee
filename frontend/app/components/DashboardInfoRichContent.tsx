"use client";

type Props = {
  text: string;
};

type MiniTableLocale = "ru" | "et" | "en";

type ModelRow = {
  short: string;
  full: string;
  principle: string;
  errorSensitivity: string;
};

function detectMiniTableLocale(text: string): MiniTableLocale | null {
  if (text.includes("Что означают модели")) return "ru";
  if (text.includes("Mida mudelid tähendavad")) return "et";
  if (text.includes("What models mean")) return "en";
  return null;
}

function buildModelRows(locale: MiniTableLocale): ModelRow[] {
  return [
    {
      short: "LR",
      full: "Logistic Regression",
      principle:
        locale === "ru"
          ? "Линейная модель + логистическая функция для вероятности"
          : locale === "et"
            ? "Lineaarne mudel + logistiline funktsioon tõenäosuse leidmiseks"
            : "Linear model + logistic function for probability",
      errorSensitivity:
        locale === "ru"
          ? "Чувствительна к пропущенным и плохо масштабированным признакам; стабильна на линейных паттернах"
          : locale === "et"
            ? "Tundlik puuduvale/skaleerimata sisendile; stabiilne lineaarsete mustrite korral"
            : "Sensitive to missing/poorly scaled features; stable for linear patterns",
    },
    {
      short: "RF",
      full: "Random Forest",
      principle:
        locale === "ru"
          ? "Ансамбль решающих деревьев, усредняет оценки"
          : locale === "et"
            ? "Otsustuspuude ansambel, mis keskmistab hinnanguid"
            : "Decision-tree ensemble averaging outputs",
      errorSensitivity:
        locale === "ru"
          ? "Устойчива к шуму и выбросам, но может сглаживать редкие сигналы"
          : locale === "et"
            ? "Vastupidav mürale ja outlier'itele, kuid võib haruldasi signaale siluda"
            : "Robust to noise/outliers, may smooth rare signals",
    },
    {
      short: "GB",
      full: "Gradient Boosting",
      principle:
        locale === "ru"
          ? "Последовательные деревья исправляют ошибки предыдущих"
          : locale === "et"
            ? "Järjestikused puud parandavad eelmiste mudelite vigu"
            : "Sequential trees correct previous errors",
      errorSensitivity:
        locale === "ru"
          ? "Сильнее ловит сложные зависимости, но чувствителен к переобучению без регуляризации"
          : locale === "et"
            ? "Tabab keerukaid seoseid, kuid võib ilma regulatsioonita üle õppida"
            : "Captures complex patterns, but can overfit without regularization",
    },
    {
      short: "LGBM",
      full: "LightGBM",
      principle:
        locale === "ru"
          ? "Оптимизированный быстрый gradient boosting на деревьях"
          : locale === "et"
            ? "Optimeeritud ja kiire puupõhine gradient boosting"
            : "Fast optimized gradient boosting on trees",
      errorSensitivity:
        locale === "ru"
          ? "Очень чувствителен к гиперпараметрам; быстрый, но требует контроля overfitting"
          : locale === "et"
            ? "Väga tundlik hüperparameetritele; kiire, kuid vajab overfitting'u kontrolli"
            : "Sensitive to hyperparameters; fast but needs overfitting control",
    },
  ];
}

export default function DashboardInfoRichContent({ text }: Props) {
  const lines = String(text || "").split("\n");
  const locale = detectMiniTableLocale(text);
  const modelRows = locale ? buildModelRows(locale) : [];
  const fullLabel = locale === "ru" ? "Название" : locale === "et" ? "Täisnimi" : "Full name";
  const principleLabel = locale === "ru" ? "Принцип" : locale === "et" ? "Põhimõte" : "Principle";
  const sensitivityLabel =
    locale === "ru" ? "Чувствительность к ошибкам" : locale === "et" ? "Tundlikkus vigadele" : "Error sensitivity";

  return (
    <div className="infoRich">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={`i-${idx}`} className="infoSpacer" />;
        if (trimmed.startsWith("- ")) return <div key={`i-${idx}`} className="infoBullet">{trimmed.slice(2)}</div>;
        const isHeading = !trimmed.includes(":") && !/[.!?]$/.test(trimmed) && trimmed.length <= 60;
        if (isHeading) return <div key={`i-${idx}`} className="infoHeading">{trimmed}</div>;
        return <div key={`i-${idx}`} className="infoLine">{trimmed}</div>;
      })}
      {modelRows.length > 0 ? (
        <div className="infoTableWrap">
          <table className="table infoMiniTable">
            <thead>
              <tr>
                <th>Model</th>
                <th>{fullLabel}</th>
                <th>{principleLabel}</th>
                <th>{sensitivityLabel}</th>
              </tr>
            </thead>
            <tbody>
              {modelRows.map((row) => (
                <tr key={`mini-${row.short}`}>
                  <td>{row.short}</td>
                  <td data-label={fullLabel}>{row.full}</td>
                  <td data-label={principleLabel}>{row.principle}</td>
                  <td data-label={sensitivityLabel}>{row.errorSensitivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
