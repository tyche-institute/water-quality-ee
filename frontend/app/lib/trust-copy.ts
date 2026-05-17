export type TrustLang = "ru" | "et" | "en";

type TrustCopy = {
  footerDisclaimer: string;
  verifyIntro: string;
  dataGapTitle: string;
  dataGapBody: string;
  dataGapDismiss: string;
  dataGapMore: string;
};

export const TRUST_COPY: Record<TrustLang, TrustCopy> = {
  ru: {
    footerDisclaimer: "Поддержка решений на базе ML, не медицинская рекомендация",
    verifyIntro:
      "На этой странице можно убедиться, что опубликованный снимок карты не был изменён после подписания. " +
      "Проверка проходит полностью у вас в браузере (Web Crypto API), без запросов к серверу подписи.",
    dataGapTitle: "Как читать эту карту",
    dataGapBody:
      "Официальный вердикт Terviseamet и вероятностная оценка модели — это два разных сигнала. " +
      "В 3,1% проб (аудит 69 536 проб) модель не может воспроизвести официальный вердикт по опубликованным параметрам: " +
      "метка опирается на контекст, которого нет в открытых данных. Модель не заменяет лабораторный анализ и " +
      "не является медицинским заключением.",
    dataGapDismiss: "Понятно",
    dataGapMore: "Подробнее",
  },
  et: {
    footerDisclaimer: "ML-pohine otsustustugi, mitte meditsiiniline soovitus",
    verifyIntro:
      "Sellel lehel saab kontrollida, et avaldatud snapshot pole pärast allkirjastamist muudetud. " +
      "Kogu kontroll toimub teie brauseris (Web Crypto API), allkirjastamise serverisse päringut ei tehta.",
    dataGapTitle: "Kuidas seda kaarti lugeda",
    dataGapBody:
      "Terviseameti ametlik hinnang ja mudeli tõenäosuslik hinnang on kaks eri signaali. " +
      "3,1% juhtudel (auditi tulemus 69 536 proovist) ei suuda mudel avaandmete põhjal ametlikku hinnangut reprodutseerida: " +
      "hinnang tugineb kontekstile, mida avaandmetes pole. Mudel ei asenda laborianalüüsi ega ole meditsiiniline hinnang.",
    dataGapDismiss: "Selge",
    dataGapMore: "Loe lisaks",
  },
  en: {
    footerDisclaimer: "ML decision support, not medical advice",
    verifyIntro:
      "Use this page to confirm that the published snapshot has not been altered after signing. " +
      "The check runs entirely in your browser (Web Crypto API); no request is sent to the signing backend.",
    dataGapTitle: "How to read this map",
    dataGapBody:
      "Terviseamet's official verdict and the model's probabilistic estimate are two distinct signals. " +
      "In 3.1% of probes (audit of 69,536 samples) the model cannot reproduce the official verdict from published parameters: " +
      "the label relies on context not present in the open data. The model does not replace a lab analysis and is not a medical assessment.",
    dataGapDismiss: "Got it",
    dataGapMore: "Read more",
  },
};
