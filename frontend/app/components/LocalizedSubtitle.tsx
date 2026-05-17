"use client";

import { useUiLang, type UiLang } from "../lib/ui-lang-store";

const textByLang: Record<UiLang, string> = {
  et: "Eesti veekvaliteedi kaart avaandmete ja ML-hinnangutega.",
  ru: "Карта качества воды Эстонии на основе открытых данных и ML-оценок.",
  en: "Estonia water quality map powered by open data and ML assessments."
};

export default function LocalizedSubtitle() {
  const lang = useUiLang();
  return <>{textByLang[lang]}</>;
}
