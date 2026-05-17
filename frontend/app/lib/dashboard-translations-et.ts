import type { DashboardTranslationEntry } from "./dashboard-translation-types";

export const DASHBOARD_TRANSLATIONS_ET: DashboardTranslationEntry = {
  filters: "Filtrid",
  pin: "Kinnita",
  unpin: "Vabasta",
  openFilters: "Ava filtrid",
  close: "Sulge",
  search: "Otsi koha/maakonna järgi",
  domain: "Domeen",
  locationType: "Asukoha tüüp",
  county: "Maakond",
  risk: "Risk",
  official: "Ametlik staatus",
  minProb: "Tõenäosuse lävi",
  alertsOnly: "Ainult häired",
  nearMe: "Minu lähedal",
  nearRadius: "Raadius",
  clearNearMe: "Tühjenda geopositsioon",
  geoDenied: "Asukohaluba on keelatud. Luba brauseris asukohale ligipääs.",
  geoUnsupported: "Geolokatsioon ei ole selles brauseris toetatud.",
  latestSampleDate: "Viimane proov kuupäev",
  dateFrom: "Alates",
  dateTo: "Kuni",
  resetDate: "Lähtesta",
  latestSampleDateHint: "Kui kuupäevavahemik on aktiivne, peidetakse punktid ilma viimase proovi kuupäevata.",
  clearFilters: "Tühjenda filtrid",
  mapTitle: "Interaktiivne veekvaliteedi kaart",
  selectedPoint: "Valitud punkt",
  noSelectedPoint: "Klõpsa markeril või tabeli real, et näha detailset infot.",
  measurements: "Vee näitajad",
  history: "Ajalugu",
  historyPlaceholder: "Selle punkti ajalugu pole eksporditud andmestikus saadaval.",
  tabs: {
    alerts: "Häired",
    domain: "Domeenid",
    analytics: "Diagnostika",
    aboutModel: "Mudelist",
    aboutService: "Teenusest",
  },
  aboutModel:
    "ML-mudelid (LR, RF, GB, LightGBM) hindavad rikkumise tõenäosust laborinäitajate põhjal. See on otsusetugi, mitte meditsiiniline soovitus.",
  metricGuideTitle: "Mõõdikud: täpselt + intuitiivselt",
  metricGuide: {
    roc: {
      title: "1) ROC-AUC — klasside eristusvõime",
      precise:
        "ROC-kõver võrdleb TPR-i ja FPR-i kõigi lävede korral. AUC on pindala kõvera all: tõenäosus, et juhuslik rikkumine saab kõrgema riski kui juhuslik norm. 0.5 = juhuslik, 1.0 = ideaalne järjestus.",
      intuitive:
        "Kui võtta üks halb ja üks hea proov, ROC-AUC näitab, kui tihti mudel annab halvale proovile kõrgema riski.",
      reading:
        "0.5 = juhuslik; 0.7-0.8 = rahuldav; 0.8-0.9 = hea; >0.9 = väga hea. Kõrge AUC ei määra automaatselt head otsustusläve.",
    },
    pr: {
      title: "2) Precision / Recall — vigade hind",
      precise:
        "Recall = TP/(TP+FN): kui palju päris rikkumistest leitakse. Precision = TP/(TP+FP): kui suur osa häiretest osutub päris rikkumiseks. FN on ohtlikud möödalaskmised, FP on lisakontroll.",
      intuitive:
        "Recall: 'mida me üles leidsime?'. Precision: 'kui usaldusväärsed on häired?'. Tavaliselt ühe kasv vähendab teist.",
      reading:
        "Veeohutuses eelistatakse tihti kõrgemat Recalli. Kõrge Recall + madal Precision = rohkem valehäireid; vastupidi = rohkem möödalaske.",
    },
    calibration: {
      title: "3) Calibration — tõenäosuse usaldatavus",
      precise:
        "Kalibreeritus võrdleb mudeli tõenäosusi tegelike sagedustega. Kui mudel annab grupile P=0.70, peaks umbes 70% neist olema rikkumised. Hinnatakse reliability-kõvera ja Brier score'iga.",
      intuitive:
        "Kas mudeli protsendid on 'ausad': 20% tähendab päriselt umbes 20%, 80% tähendab umbes 80%.",
      reading:
        "Halva kalibreerituse korral ei maksa protsente võtta otsese tõenäosusena; neid tasub kasutada pigem järjestamiseks.",
    },
    shap: {
      title: "4) SHAP — riski põhjendamine",
      precise:
        "SHAP jaotab üksikprognoosi tunnuste panusteks võrreldes baastasemega. Positiivne panus tõstab riski, negatiivne langetab. Panuste summa + baseline annab lõppscore'i.",
      intuitive:
        "SHAP on prognoosi 'lahtivõtt': mis näitajad riski tõstsid ja mis seda vähendasid. See pole põhjuslik tõestus.",
      reading:
        "Suur positiivne SHAP-panuse väärtus tõstab rikkumisriski, negatiivne vähendab. Tõlgenda mudeli selgitusena, mitte põhjusliku tõendusena.",
    },
  },
};
