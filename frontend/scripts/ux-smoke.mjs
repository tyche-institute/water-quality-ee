import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.H2O_UX_BASE_URL || "http://127.0.0.1:3000";
const OUT_DIR = process.env.H2O_UX_OUT_DIR || "/tmp/h2oatlas-ux-smoke";
const PLACE_ID = process.env.H2O_UX_PLACE_ID || "385153";
const PLACE_NAME = "Vihula mõisa külmaveebassein";

function fail(message) {
  throw new Error(`[ux-smoke] ${message}`);
}

function collectClientErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

function assertNoClientErrors(label, errors) {
  if (!errors.length) return;
  fail(`${label} emitted browser errors:\n${errors.slice(0, 5).join("\n\n")}`);
}

async function newContext(browser, viewport) {
  const context = await browser.newContext({
    viewport,
    locale: "ru-RU",
    colorScheme: "light",
  });
  await context.addInitScript(() => {
    window.localStorage.setItem("water.ui.lang", "ru");
    window.localStorage.setItem("water.ui.dataGapNoticeDismissed", "1");
  });
  return context;
}

async function desktopRoot(browser) {
  const context = await newContext(browser, { width: 1440, height: 1000 });
  const page = await context.newPage();
  const errors = collectClientErrors(page);
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".leaflet-container", { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.getByText("ВИДИМЫХ").waitFor({ timeout: 10000 });
  await page.screenshot({ path: join(OUT_DIR, "desktop-root.png") });
  assertNoClientErrors("desktop root", errors);
  await context.close();
}

async function desktopPlace(browser) {
  const context = await newContext(browser, { width: 1440, height: 1000 });
  const page = await context.newPage();
  const errors = collectClientErrors(page);
  await page.goto(`${BASE_URL}/?place=${PLACE_ID}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".leaflet-container", { timeout: 60000 });
  await page.getByText(PLACE_NAME).first().waitFor({ timeout: 15000 });
  const panelText = await page.locator(".selectedPointDesktop").innerText({ timeout: 10000 });
  if (!panelText.includes(PLACE_NAME)) fail("desktop place deep-link did not open the selected-place panel");
  const normalizedPanelText = panelText.toLocaleLowerCase("ru-RU");
  const officialIndex = normalizedPanelText.indexOf("официальный статус");
  const uncertaintyIndex = normalizedPanelText.indexOf("опубликованные показатели");
  if (officialIndex < 0) fail("desktop place panel does not expose official status");
  if (uncertaintyIndex >= 0 && uncertaintyIndex < officialIndex) {
    fail("desktop place panel shows uncertainty before official status");
  }
  await page.screenshot({ path: join(OUT_DIR, "desktop-place.png") });
  assertNoClientErrors("desktop place", errors);
  await context.close();
}

async function mobilePlace(browser) {
  const context = await newContext(browser, { width: 390, height: 844 });
  const page = await context.newPage();
  const errors = collectClientErrors(page);
  await page.goto(`${BASE_URL}/?place=${PLACE_ID}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".leaflet-container", { timeout: 60000 });
  await page.locator(".gmSheetPlaceContent").waitFor({ timeout: 15000 });
  const sheetText = await page.locator(".mobileBottomSheet").innerText({ timeout: 10000 });
  if (!sheetText.includes(PLACE_NAME)) fail("mobile place deep-link did not open the bottom sheet");
  const normalizedSheetText = sheetText.toLocaleLowerCase("ru-RU");
  const officialIndex = normalizedSheetText.indexOf("официальный статус");
  const uncertaintyIndex = normalizedSheetText.indexOf("опубликованные показатели");
  if (officialIndex < 0) fail("mobile place sheet does not expose official status");
  if (uncertaintyIndex >= 0 && uncertaintyIndex < officialIndex) {
    fail("mobile place sheet shows uncertainty before official status");
  }
  await page.screenshot({ path: join(OUT_DIR, "mobile-place.png") });
  assertNoClientErrors("mobile place", errors);
  await context.close();
}

async function verifyPage(browser) {
  const context = await newContext(browser, { width: 1280, height: 900 });
  const page = await context.newPage();
  const errors = collectClientErrors(page);
  await page.goto(`${BASE_URL}/verify`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.getByText("Проверка снимка").waitFor({ timeout: 10000 });
  await page.screenshot({ path: join(OUT_DIR, "verify.png") });
  assertNoClientErrors("verify page", errors);
  await context.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    fail(`${error instanceof Error ? error.message : String(error)}\nRun: npx playwright install chromium`);
  }

  try {
    await desktopRoot(browser);
    await desktopPlace(browser);
    await mobilePlace(browser);
    await verifyPage(browser);
  } finally {
    await browser.close();
  }

  console.log(`[ux-smoke] OK. Screenshots: ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
