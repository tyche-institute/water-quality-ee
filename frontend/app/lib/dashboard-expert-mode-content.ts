import type { DashboardContentLang } from "./dashboard-content-types";

export function buildExpertModeText(lang: DashboardContentLang): string {
  if (lang === "ru") {
    return [
      "Что такое P(violation)",
      "- Это оценка вероятности нарушения санитарных норм для конкретной пробы по её лабораторным признакам.",
      "- Это не прогноз будущего качества воды и не официальный вердикт регулятора.",
      "- При слабой калибровке используйте значение прежде всего для ранжирования приоритетов.",
      "",
      "Что означают модели",
      "- LR (Logistic Regression): линейная модель, переводит взвешенную сумму признаков в вероятность через сигмоиду.",
      "- RF (Random Forest): ансамбль многих деревьев решений; итоговая вероятность — усреднение по деревьям.",
      "- GB (Gradient Boosting): деревья строятся последовательно, каждое исправляет ошибки предыдущих.",
      "- LGBM (LightGBM): быстрый и оптимизированный вариант gradient boosting на деревьях для больших данных.",
      "",
      "Почему вероятности различаются",
      "- Модели имеют разную архитектуру и по-разному обобщают паттерны.",
      "- Разница с RF показывает, насколько модель строже или мягче относительно эталонной RF-оценки.",
      "",
      "О горизонте предсказания",
      "- Предсказание относится к текущей/исторической записи пробы в данных.",
      "- Это не ответ на вопрос 'что будет через неделю/месяц'."
    ].join("\n");
  }
  if (lang === "et") {
    return [
      "Mis on P(rikkumine)",
      "- See on konkreetse proovi rikkumise tõenäosuse hinnang laborinäitajate põhjal.",
      "- See ei ole tuleviku vee kvaliteedi prognoos ega ametlik regulatiivne otsus.",
      "",
      "Mida mudelid tähendavad",
      "- LR (Logistic Regression): lineaarne mudel, mis teisendab tunnuste summa tõenäosuseks logistilise funktsiooniga.",
      "- RF (Random Forest): paljude otsustuspuude ansambel; tõenäosus on puude hinnangute keskmine.",
      "- GB (Gradient Boosting): puud ehitatakse järjest, iga järgmine parandab eelmiste vigu.",
      "- LGBM (LightGBM): kiire ja optimeeritud gradient boosting puupõhiste mudelite jaoks.",
      "",
      "Miks tõenäosused erinevad",
      "- Mudelitel on erinev arhitektuur ja erinev üldistusviis.",
      "- RF-iga võrdlus näitab, kas mudel on RF suhtes rangem või leebem.",
      "",
      "Prognoosi ajahorisont",
      "- Hinnang käib praeguse/ajaloolise proovi kirje kohta andmestikus.",
      "- See ei vasta küsimusele, mis juhtub veekvaliteediga järgmisel nädalal või kuul."
    ].join("\n");
  }
  return [
    "What P(violation) means",
    "- It is a model-estimated probability of sanitary norm violation for this specific sample.",
    "- It is not a future forecast and not an official regulatory verdict.",
    "- If calibration is weak, use it primarily for prioritization/ranking.",
    "",
    "What models mean",
    "- LR (Logistic Regression): linear model mapping weighted features into probability via logistic function.",
    "- RF (Random Forest): ensemble of decision trees; final probability is averaged across trees.",
    "- GB (Gradient Boosting): trees are built sequentially, each correcting previous errors.",
    "- LGBM (LightGBM): fast optimized gradient boosting on trees.",
    "",
    "Why probabilities differ",
    "- Models have different inductive biases and generalization behavior.",
    "- Difference vs RF shows whether a model is stricter or softer than RF on the same sample.",
    "",
    "Prediction horizon",
    "- Prediction refers to the current/historical sample record in data.",
    "- It does not answer what will happen to water quality next week or month."
  ].join("\n");
}
