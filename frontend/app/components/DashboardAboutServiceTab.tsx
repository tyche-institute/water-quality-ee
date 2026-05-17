"use client";

import type { DashboardLang } from "../lib/dashboard-types";
import { lruet } from "../lib/dashboard-utils";
import type { FrontendSnapshot } from "../lib/types";
import type { ParameterCard } from "../lib/dashboard-content";

type Props = {
  lang: DashboardLang;
  snapshot: FrontendSnapshot;
  parameterCards: ParameterCard[];
};

export default function DashboardAboutServiceTab({ lang, snapshot, parameterCards }: Props) {
  return (
    <div>
      <h4>{lruet(lang, "О сервисе", "Teenusest", "About service")}</h4>

      <div className="stats" style={{ marginTop: "0.75rem" }}>
        <div className="stat">
          <div className="k">{lruet(lang, "Проб", "Proove", "Probes")}</div>
          <div className="v" style={{ fontFamily: "var(--font-latin-ui)", fontSize: "1.1rem" }}>69 536</div>
        </div>
        <div className="stat">
          <div className="k">{lruet(lang, "Доменов", "Domeene", "Domains")}</div>
          <div className="v" style={{ fontFamily: "var(--font-latin-ui)", fontSize: "1.1rem" }}>4</div>
        </div>
        <div className="stat">
          <div className="k">{lruet(lang, "Лет данных", "Aastat andmeid", "Years of data")}</div>
          <div className="v" style={{ fontFamily: "var(--font-latin-ui)", fontSize: "1.1rem" }}>2021–2026</div>
        </div>
        <div className="stat">
          <div className="k">{lruet(lang, "Точек на карте", "Punkte kaardil", "Map locations")}</div>
          <div className="v" style={{ fontFamily: "var(--font-latin-ui)", fontSize: "1.1rem" }}>{snapshot.places?.length || "2 196"}</div>
        </div>
      </div>

      <p className="hint" style={{ marginTop: "0.6rem" }}>
        {lang === "ru"
          ? "Этот сервис — публичный инструмент экологической прозрачности для жителей, муниципалитетов и госструктур. Он объединяет официальные открытые данные Terviseamet, карту, аналитику и объяснения параметров воды с аналитическим ML-слоем, чтобы вода оценивалась не только постфактум, но и через ранние риск-сигналы. Данные и модели обновляются автоматически: еженедельно (пн) и 1-го числа каждого месяца."
          : lang === "et"
            ? "See teenus on avalik keskkonnaläbipaistvuse tööriist elanikele, omavalitsustele ja riigiasutustele. See ühendab Terviseameti ametlikud avaandmed, kaardi, analüütika ja vee parameetrite selgitused ML-analüüsi kihiga. Andmed ja mudelid uuendatakse automaatselt: iganädalaselt (E) ja iga kuu 1. kuupäeval."
            : "A public environmental-transparency tool for residents, municipalities and authorities. It combines official Terviseamet open data, map, analytics and water parameter explanations with an ML analytics layer for early risk signals on top of post-fact compliance reporting. Data and models are refreshed automatically: weekly (Mon) and on the 1st of each month."}
      </p>
      <p className="hint">
        {lang === "ru"
          ? "По каждой точке доступны: дата и контекст последней пробы, официальный статус соответствия, вероятности нарушения от нескольких моделей, история наблюдений и пояснения ключевых параметров."
          : lang === "et"
            ? "Iga punkti kohta: viimase proovi kuupäev, ametlik vastavus, mitme mudeli rikkumistõenäosused, vaatlusajalugu ja võtmenäitajate selgitused."
            : "For every point: latest sample date and context, official compliance status, model violation probabilities, observation history and explanations of the main water parameters."}
      </p>
      <p className="hint">
        {lang === "ru"
          ? "Важно: модельные оценки не заменяют официальный санитарный вердикт. Они предназначены для приоритезации проверок и более раннего обнаружения потенциально проблемных зон."
          : lang === "et"
            ? "Oluline: mudelihinnangud ei asenda ametlikku sanitaarset otsust — need on mõeldud kontrollide prioritiseerimiseks."
            : "Important: model assessments do not replace the official sanitary verdict. They support inspection prioritization and earlier detection of potential problem areas."}
      </p>

      <div style={{ margin: "0.75rem 0", padding: "0.6rem 0.8rem", background: "var(--panel-soft, #eef1f5)", borderRadius: 8, borderLeft: "3px solid var(--brand, #2563eb)" }}>
        <h5 style={{ marginBottom: "0.35rem", fontSize: "0.82rem" }}>
          {lruet(lang, "Ключевые находки проекта", "Projekti peamised avastused", "Key research findings")}
        </h5>
        <ul className="hint" style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.6 }}>
          <li>{lruet(lang,
            "Обнаружена и исправлена ошибка в нормах хлора бассейнов: free_chlorine [0.2, 0.6] → [0.5, 1.5] мг/л — устранены 288 ложных срабатываний.",
            "Avastatud ja parandatud basseini kloori normide viga: free_chlorine [0.2, 0.6] → [0.5, 1.5] mg/l — 288 valepositiivset kõrvaldatud.",
            "Pool chlorine norms bug found and fixed: free_chlorine [0.2, 0.6] → [0.5, 1.5] mg/l — 288 false positives eliminated."
          )}</li>
          <li>{lruet(lang,
            "3.1% проб (2 164 из 69 536) не воспроизводимы из опубликованных параметров — запрос в Terviseamet подготовлен.",
            "3.1% proovidest (2 164 / 69 536) pole avalikustatud parameetritest reprodutseeritavad — päring Terviseametile koostatud.",
            "3.1% of probes (2,164 / 69,536) cannot be reproduced from published parameters — inquiry to Terviseamet prepared."
          )}</li>
          <li>{lruet(lang,
            "XML-парсер проверен на 160 МБ данных: ноль потерянных параметров.",
            "XML parser kontrollitud 160 MB andmetel: null kaotatud parameetrit.",
            "XML parser verified on 160 MB of data: zero measurement parameters lost."
          )}</li>
        </ul>
      </div>

      {snapshot.data_catalog_url ? (
        <p className="hint">
          {lruet(lang, "Источник:", "Allikas:", "Source:")}{" "}
          <a href={snapshot.data_catalog_url} target="_blank" rel="noreferrer" className="linkBtn">
            {snapshot.data_catalog_url}
          </a>
        </p>
      ) : null}

      <h4 style={{ marginTop: "1rem" }}>{lruet(lang, "Слои и интерпретация карты", "Kaardikihid ja tõlgendus", "Map layers")}</h4>
      <div className="tableWrap compact mobileResponsiveTable" style={{ marginTop: "0.4rem" }}>
        <table className="table">
          <thead>
            <tr>
              <th>{lruet(lang, "Элемент", "Element", "Element")}</th>
              <th>{lruet(lang, "Описание", "Kirjeldus", "Description")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{lruet(lang, "Цвет маркера", "Markeri värv", "Marker color")}</td>
              <td>{lruet(lang, "Зелёный/жёлтый/красный = низкий/средний/высокий риск", "Roheline/kollane/punane = madal/keskmine/kõrge risk", "Green/yellow/red = low/medium/high risk")}</td>
            </tr>
            <tr>
              <td>{lruet(lang, "Иконка", "Ikoon", "Icon")}</td>
              <td>{lruet(lang, "Тип: пляж, бассейн, сеть, источник", "Tüüp: rand, bassein, võrk, allikas", "Type: beach, pool, network, source")}</td>
            </tr>
            <tr>
              <td>{lruet(lang, "Кластер", "Klaster", "Cluster")}</td>
              <td>{lruet(lang, "Количество точек в группе", "Punktide arv grupis", "Number of points in group")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 style={{ marginTop: "1rem" }}>{lruet(lang, "Карточки параметров", "Parameetrikaardid", "Parameter cards")}</h4>
      <div className="infoCardGrid">
        {parameterCards.map((card) => (
          <article key={`ipc-${card.key}`} className="infoCard">
            <div className="infoCardHead">
              <span className="infoCardIcon" aria-hidden>{card.icon}</span>
              <div>
                <h5>{lruet(lang, card.ruTitle, card.etTitle, card.enTitle)}</h5>
                <span className="badge warn">{lruet(lang, card.ruImpact, card.etImpact, card.enImpact)}</span>
              </div>
            </div>
            <p className="hint">{lruet(lang, card.ruWhy, card.etWhy, card.enWhy)}</p>
          </article>
        ))}
      </div>

      <div style={{ margin: "0.75rem 0", padding: "0.6rem 0.8rem", background: "var(--panel-soft, #eef1f5)", borderRadius: 8, borderLeft: "3px solid var(--brand, #2563eb)" }}>
        <h5 style={{ marginBottom: "0.35rem", fontSize: "0.82rem" }}>
          {lruet(lang, "Об авторе и проекте", "Autor ja projekt", "Author & project")}
        </h5>
        <p className="hint" style={{ margin: 0, lineHeight: 1.6 }}>
          {lruet(lang,
            "Курсовой проект Anton Sokolov · TalTech Masinõpe (Machine Learning), весна 2026. Код, данные и модели — открыты.",
            "Kursusetöö: Anton Sokolov · TalTech Masinõpe (Machine Learning), kevad 2026. Kood, andmed ja mudelid — avatud.",
            "Course project by Anton Sokolov · TalTech Masinõpe (Machine Learning), spring 2026. Code, data, and models are open."
          )}
          {" "}
          <a href="https://github.com/tyche-institute/water-quality-ee" target="_blank" rel="noreferrer" className="linkBtn">
            {lruet(lang, "Репозиторий на GitHub", "GitHubi repositoorium", "GitHub repository")}
          </a>
        </p>
      </div>
    </div>
  );
}
