"use client";

type Props = {
  locale: "ru" | "et" | "en";
};

export default function MapCountyLegend({ locale }: Props) {
  return (
    <div
      className="countyLegend"
      role="note"
      aria-label={
        locale === "ru"
          ? "Легенда цветов уездов"
          : locale === "et"
            ? "Maakondade värvilegend"
            : "County color legend"
      }
    >
      <div className="countyLegendTitle">
        {locale === "ru"
          ? "Уезды: средний риск по модели"
          : locale === "et"
            ? "Maakonnad: keskmine mudeli risk"
            : "Counties: avg model risk"}
      </div>
      <ul className="countyLegendList">
        <li><span className="countyLegendSwatch" style={{ background: "#22c55e" }} />{locale === "ru" ? "низкий < 40%" : locale === "et" ? "madal < 40%" : "low < 40%"}</li>
        <li><span className="countyLegendSwatch" style={{ background: "#f59e0b" }} />{locale === "ru" ? "средний 40–70%" : locale === "et" ? "keskmine 40–70%" : "medium 40–70%"}</li>
        <li><span className="countyLegendSwatch" style={{ background: "#ef4444" }} />{locale === "ru" ? "высокий ≥ 70%" : locale === "et" ? "kõrge ≥ 70%" : "high ≥ 70%"}</li>
        <li><span className="countyLegendSwatch countyLegendSwatchMuted" />{locale === "ru" ? "нет данных модели" : locale === "et" ? "mudeli andmeid pole" : "no model data"}</li>
      </ul>
    </div>
  );
}
