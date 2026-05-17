#!/usr/bin/env node
/**
 * Render a monthly digest post body from snapshot.frontend.json.
 *
 * Aggregates the month's signal into one human-readable post:
 *   - new samples in last 30 days
 *   - currently-violating count (split by domain)
 *   - top 3 high-risk swimming spots (most relevant to citizens)
 *   - top 3 drinking-water network violations
 *
 * No external API calls. Output is plain text suitable for FB / LinkedIn.
 *
 * Usage:
 *   node scripts/social/render-monthly-digest.mjs [--lang LANG]
 *
 * Stdout: post body. Stderr: optional debug.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const SNAPSHOT = resolve(ROOT, "frontend/public/data/snapshot.frontend.json");

const SITE = "https://h2oatlas.ee";

function parseArgs(argv) {
  const out = { lang: "en" };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--lang") out.lang = argv[++i] || "en";
  }
  return out;
}

const MONTH_NAME = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  et: ["jaanuar","veebruar","märts","aprill","mai","juuni","juuli","august","september","oktoober","november","detsember"],
  ru: ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"],
};

const T = {
  en: {
    title: (m, y) => `🌊 H2O Atlas — ${m} ${y} digest`,
    intro: "This month on the map of Estonian water quality:",
    new_samples: (n) => `• ${n.toLocaleString("en")} new samples added`,
    violations: (n) => `• ${n} sites currently flagged as non-compliant`,
    by_domain: (parts) => `  (${parts.join(", ")})`,
    swim_count: (n) => `${n} swimming spots`,
    drink_count: (n) => `${n} drinking-water sites`,
    pool_count: (n) => `${n} pools`,
    source_count: (n) => `${n} drinking-water sources`,
    high_risk_h: "🏊 Swimming spots flagged this month:",
    drink_h: "🚰 Drinking-water network violations:",
    explore: (url) => `Explore the interactive map: ${url}`,
    cta: "Open data from Terviseamet · ML risk assessment · Decision support, not medical advice.",
    hashtags: "#waterquality #Estonia #opendata #Terviseamet",
    pcounty: (county) => county ?? "—",
    place_line: (name, county, url) => `• ${name} (${county}) → ${url}`,
  },
  et: {
    title: (m, y) => `🌊 H2O Atlas — ${m} ${y} kuukokkuvõte`,
    intro: "Sel kuul Eesti veekvaliteedi kaardil:",
    new_samples: (n) => `• ${n.toLocaleString("et")} uut proovi lisatud`,
    violations: (n) => `• ${n} objekti hetkel mittevastavad normile`,
    by_domain: (parts) => `  (${parts.join(", ")})`,
    swim_count: (n) => `${n} supluskohta`,
    drink_count: (n) => `${n} ühisveevärki`,
    pool_count: (n) => `${n} basseini`,
    source_count: (n) => `${n} joogiveeallikat`,
    high_risk_h: "🏊 Supluskohad, mis sel kuul norme ei täida:",
    drink_h: "🚰 Joogiveevärgi rikkumised:",
    explore: (url) => `Vaata interaktiivselt kaardilt: ${url}`,
    cta: "Avatud andmed Terviseametist · ML riskihinnang · Otsustustugi, mitte meditsiiniline nõuanne.",
    hashtags: "#veekvaliteet #Eesti #avaandmed #Terviseamet",
    pcounty: (county) => county ?? "—",
    place_line: (name, county, url) => `• ${name} (${county}) → ${url}`,
  },
  ru: {
    title: (m, y) => `🌊 H2O Atlas — дайджест ${m} ${y}`,
    intro: "В этом месяце на карте качества воды Эстонии:",
    new_samples: (n) => `• ${n.toLocaleString("ru")} новых проб`,
    violations: (n) => `• ${n} объектов с нарушением нормы прямо сейчас`,
    by_domain: (parts) => `  (${parts.join(", ")})`,
    swim_count: (n) => `${n} пляжей`,
    drink_count: (n) => `${n} водопроводных сетей`,
    pool_count: (n) => `${n} бассейнов`,
    source_count: (n) => `${n} источников`,
    high_risk_h: "🏊 Пляжи с нарушениями этого месяца:",
    drink_h: "🚰 Нарушения в водопроводных сетях:",
    explore: (url) => `Посмотреть на интерактивной карте: ${url}`,
    cta: "Открытые данные Terviseamet · ML-оценка риска · Decision support, не медицинская рекомендация.",
    hashtags: "#качествоводы #Эстония #открытыеданные #Terviseamet",
    pcounty: (county) => county ?? "—",
    place_line: (name, county, url) => `• ${name} (${county}) → ${url}`,
  },
};

function daysSince(iso) {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

function placeUrl(id) {
  return `${SITE}/?place=${encodeURIComponent(id)}`;
}

function pickTopByDomain(places, domain, n) {
  return places
    .filter((p) => p.domain === domain && p.official_compliant === 0)
    .sort((a, b) => {
      // Most recent sample first, then highest risk.
      const da = a.sample_date ? Date.parse(a.sample_date) : 0;
      const db = b.sample_date ? Date.parse(b.sample_date) : 0;
      if (db !== da) return db - da;
      const ra = typeof a.model_violation_prob === "number" ? a.model_violation_prob : 0;
      const rb = typeof b.model_violation_prob === "number" ? b.model_violation_prob : 0;
      return rb - ra;
    })
    .slice(0, n);
}

function main() {
  const args = parseArgs(process.argv);
  const t = T[args.lang] ?? T.en;
  const month_names = MONTH_NAME[args.lang] ?? MONTH_NAME.en;

  const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
  const places = snapshot.places ?? [];

  const now = new Date();
  // Use the *previous* full month (digest is published on day 1 of next month).
  const month = (now.getMonth() === 0) ? 11 : now.getMonth() - 1;
  const year = (now.getMonth() === 0) ? now.getFullYear() - 1 : now.getFullYear();
  const monthName = month_names[month];

  const newSamples30d = places.filter((p) => p.sample_date && daysSince(p.sample_date) <= 30).length;

  const violating = places.filter((p) => p.official_compliant === 0);
  const byDomain = {
    supluskoha: violating.filter((p) => p.domain === "supluskoha").length,
    veevark: violating.filter((p) => p.domain === "veevark").length,
    basseinid: violating.filter((p) => p.domain === "basseinid").length,
    joogivesi: violating.filter((p) => p.domain === "joogivesi").length,
  };
  const domainParts = [];
  if (byDomain.supluskoha) domainParts.push(t.swim_count(byDomain.supluskoha));
  if (byDomain.veevark) domainParts.push(t.drink_count(byDomain.veevark));
  if (byDomain.basseinid) domainParts.push(t.pool_count(byDomain.basseinid));
  if (byDomain.joogivesi) domainParts.push(t.source_count(byDomain.joogivesi));

  const swimTop = pickTopByDomain(places, "supluskoha", 3);
  const drinkTop = pickTopByDomain(places, "veevark", 3);

  const lines = [];
  lines.push(t.title(monthName, year));
  lines.push("");
  lines.push(t.intro);
  lines.push(t.new_samples(newSamples30d));
  lines.push(t.violations(violating.length));
  if (domainParts.length) lines.push(t.by_domain(domainParts));
  lines.push("");

  if (swimTop.length) {
    lines.push(t.high_risk_h);
    for (const p of swimTop) {
      lines.push(t.place_line(p.location, t.pcounty(p.county), placeUrl(p.id)));
    }
    lines.push("");
  }

  if (drinkTop.length) {
    lines.push(t.drink_h);
    for (const p of drinkTop) {
      lines.push(t.place_line(p.location, t.pcounty(p.county), placeUrl(p.id)));
    }
    lines.push("");
  }

  lines.push(t.explore(SITE));
  lines.push(t.cta);
  lines.push("");
  lines.push(t.hashtags);

  process.stdout.write(lines.join("\n") + "\n");
}

main();
