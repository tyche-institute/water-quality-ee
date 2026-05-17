import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.H2O_UI_REVIEW_BASE_URL || "http://127.0.0.1:3000";
const OUT_DIR = process.env.H2O_UI_REVIEW_OUT_DIR || "/tmp/h2oatlas-ui-review";
const PLACE_ID = process.env.H2O_UI_REVIEW_PLACE_ID || "385153";
const PLACE_NAME = "Vihula mõisa külmaveebassein";
const BASE_ORIGIN = new URL(BASE_URL).origin;

const DESKTOP = { width: 1440, height: 1000 };
const MOBILE = { width: 390, height: 844 };

const results = [];

function fail(message) {
  throw new Error(`[ui-review] ${message}`);
}

function firstParty(url) {
  try {
    return new URL(url).origin === BASE_ORIGIN;
  } catch {
    return false;
  }
}

function ignoredFirstPartyFailure(url) {
  return url.endsWith("/favicon.ico") || url.includes("/apple-touch-icon");
}

function collectRuntimeSignals(page) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (firstParty(url) && !ignoredFirstPartyFailure(url)) {
      errors.push(`request failed: ${request.failure()?.errorText || "unknown"} ${url}`);
    }
  });
  page.on("response", (response) => {
    const url = response.url();
    if (response.status() >= 400 && firstParty(url) && !ignoredFirstPartyFailure(url)) {
      errors.push(`response ${response.status()}: ${url}`);
    }
  });
  return errors;
}

function assertNoRuntimeSignals(label, errors) {
  if (!errors.length) return;
  fail(`${label} emitted browser/runtime errors:\n${errors.slice(0, 8).join("\n")}`);
}

async function newContext(browser, viewport, theme = "light") {
  const context = await browser.newContext({
    viewport,
    locale: "ru-RU",
    colorScheme: theme,
  });
  await context.addInitScript((savedTheme) => {
    window.localStorage.setItem("water.ui.lang", "ru");
    window.localStorage.setItem("water.ui.dataGapNoticeDismissed", "1");
    window.localStorage.setItem("water.ui.theme.v1", savedTheme);
  }, theme);
  return context;
}

function urlFor(path) {
  return new URL(path, BASE_URL).toString();
}

async function loadDashboard(page, path = "/") {
  await page.goto(urlFor(path), { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".leaflet-container", { timeout: 60000 });
  await page.waitForTimeout(1200);
}

async function assertVisible(page, selector, label) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout: 15000 });
  const box = await locator.boundingBox();
  if (!box || box.width < 2 || box.height < 2) {
    fail(`${label} is visible but has an invalid box`);
  }
  const viewport = page.viewportSize();
  if (viewport && (box.x + box.width < 0 || box.y + box.height < 0 || box.x > viewport.width || box.y > viewport.height)) {
    fail(`${label} is outside the viewport`);
  }
  return locator;
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollingElementScrollWidth: document.scrollingElement?.scrollWidth || document.documentElement.scrollWidth,
    htmlScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body?.scrollWidth || 0,
  }));
  const scrollWidth = overflow.scrollingElementScrollWidth;
  if (scrollWidth > overflow.innerWidth + 8) {
    fail(
      `${label} has horizontal overflow: scrollWidth=${scrollWidth}, viewport=${overflow.innerWidth}, ` +
      `html=${overflow.htmlScrollWidth}, body=${overflow.bodyScrollWidth}`,
    );
  }
}

async function assertNoOverlap(page, items, label) {
  const boxes = [];
  for (const item of items) {
    const locator = page.locator(item.selector).first();
    await locator.waitFor({ state: "visible", timeout: 15000 });
    const box = await locator.boundingBox();
    if (box) boxes.push({ label: item.label, box });
  }

  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i];
      const b = boxes[j];
      const x = Math.max(0, Math.min(a.box.x + a.box.width, b.box.x + b.box.width) - Math.max(a.box.x, b.box.x));
      const y = Math.max(0, Math.min(a.box.y + a.box.height, b.box.y + b.box.height) - Math.max(a.box.y, b.box.y));
      if (x > 4 && y > 4) {
        fail(`${label} overlap: ${a.label} intersects ${b.label}`);
      }
    }
  }
}

async function assertTheme(page, expected) {
  await page.waitForFunction(
    (theme) => theme === "dark"
      ? document.documentElement.dataset.theme === "dark"
      : document.documentElement.dataset.theme !== "dark",
    expected,
    { timeout: 10000 },
  );
}

async function assertTrustOrdering(locator, label, options = {}) {
  // `variant: "desktop"` is the slimmed-down desktop card (only sample-date
  // and official-status survived). `requireProvenance` toggles whether the
  // provenance + verification rows are expected — the mobile place sheet
  // drops them (they now live only on the global info pane). Default is the
  // full trust chain.
  const { variant = "full", requireProvenance = true } = options;
  const text = await locator.innerText({ timeout: 10000 });
  if (!text.includes(PLACE_NAME)) fail(`${label} does not show the selected place`);
  const desktop = variant === "desktop";
  if (desktop) {
    // Desktop panel was intentionally collapsed: only sample-date and
    // official-status remain. Risk is rendered as a colored badge next
    // to the official-status badge, so we just verify the two markers
    // and that the sample date comes first.
    const order = await locator.evaluate((root) => {
      const keys = ["sample-date", "official-status"];
      const nodes = Object.fromEntries(
        keys.map((key) => [key, root.querySelector(`[data-trust-order="${key}"]`)]),
      );
      const missing = keys.filter((key) => !nodes[key]);
      const before = (left, right) =>
        Boolean(nodes[left].compareDocumentPosition(nodes[right]) & Node.DOCUMENT_POSITION_FOLLOWING);
      return {
        missing,
        sampleBeforeOfficial: missing.length ? false : before("sample-date", "official-status"),
      };
    });
    if (order.missing.length) fail(`${label} is missing trust-order markers: ${order.missing.join(", ")}`);
    if (!order.sampleBeforeOfficial) fail(`${label} does not show sample date before official status`);
    return;
  }
  const normalized = text.toLocaleLowerCase("ru-RU");
  const officialIndex = normalized.indexOf("официальный статус");
  const modelIndex = normalized.indexOf("оценка модели");
  const uncertaintyIndex = normalized.indexOf("опубликованные показатели");
  if (officialIndex < 0) fail(`${label} does not expose official status`);
  if (modelIndex < 0) fail(`${label} does not expose model assessment`);
  if (modelIndex < officialIndex) fail(`${label} shows model assessment before official status`);
  if (uncertaintyIndex >= 0 && uncertaintyIndex < officialIndex) {
    fail(`${label} shows uncertainty before official status`);
  }
  const order = await locator.evaluate((root, includeProvenance) => {
    const keys = includeProvenance
      ? ["sample-date", "official-status", "provenance", "verification-source", "model-context"]
      : ["sample-date", "official-status", "model-context"];
    const nodes = Object.fromEntries(
      keys.map((key) => [key, root.querySelector(`[data-trust-order="${key}"]`)]),
    );
    const missing = keys.filter((key) => !nodes[key]);
    const before = (left, right) => Boolean(nodes[left].compareDocumentPosition(nodes[right]) & Node.DOCUMENT_POSITION_FOLLOWING);
    const result = {
      missing,
      sampleBeforeOfficial: missing.length ? false : before("sample-date", "official-status"),
    };
    if (includeProvenance) {
      result.officialBeforeProvenance = missing.length ? false : before("official-status", "provenance");
      result.provenanceBeforeVerify = missing.length ? false : before("provenance", "verification-source");
      result.verifyBeforeModel = missing.length ? false : before("verification-source", "model-context");
    } else {
      result.officialBeforeModel = missing.length ? false : before("official-status", "model-context");
    }
    return result;
  }, requireProvenance);
  if (order.missing.length) fail(`${label} is missing trust-order markers: ${order.missing.join(", ")}`);
  if (!order.sampleBeforeOfficial) fail(`${label} does not show sample date before official status`);
  if (requireProvenance) {
    if (!order.officialBeforeProvenance) fail(`${label} does not show official status before provenance`);
    if (!order.provenanceBeforeVerify) fail(`${label} does not show freshness/provenance before verification`);
    if (!order.verifyBeforeModel) fail(`${label} does not keep model context after source verification`);
  } else if (!order.officialBeforeModel) {
    fail(`${label} does not keep official status before model context`);
  }
}

async function reviewScenario(browser, name, viewport, theme, callback) {
  const context = await newContext(browser, viewport, theme);
  const page = await context.newPage();
  const errors = collectRuntimeSignals(page);
  const screenshots = [];
  const startedAt = Date.now();
  try {
    await callback(page, async (filename) => {
      const path = join(OUT_DIR, filename);
      await page.screenshot({ path, fullPage: false });
      screenshots.push(path);
    });
    assertNoRuntimeSignals(name, errors);
    results.push({
      name,
      viewport,
      theme,
      status: "passed",
      duration_ms: Date.now() - startedAt,
      screenshots,
    });
  } catch (error) {
    results.push({
      name,
      viewport,
      theme,
      status: "failed",
      duration_ms: Date.now() - startedAt,
      screenshots,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    await context.close();
  }
}

async function desktopRoot(page, screenshot) {
  await loadDashboard(page);
  await assertTheme(page, "light");
  await assertVisible(page, ".unifiedTopBar", "desktop header");
  await assertVisible(page, ".sidebar", "desktop sidebar");
  await assertVisible(page, ".mapStatsRow", "desktop map stats");
  await assertVisible(page, ".mapFreshnessCard", "desktop freshness card");
  await assertVisible(page, ".signedBadge", "signed snapshot badge");
  await page.getByText("ВИДИМЫХ").waitFor({ timeout: 10000 });
  await assertNoHorizontalOverflow(page, "desktop root");
  await assertNoOverlap(page, [
    { selector: ".unifiedTopBar", label: "header" },
    { selector: ".mapStatsRow", label: "map stats" },
    { selector: ".mapFreshnessCard", label: "freshness card" },
  ], "desktop root chrome");
  await screenshot("desktop-root-light.png");
}

async function desktopFilters(page, screenshot) {
  await loadDashboard(page);
  await page.locator("#search-input").fill("Vihula");
  await page.locator("#risk-select").selectOption("medium");
  await page.locator("#min-prob").evaluate((input) => {
    input.value = "0.30";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.waitForTimeout(700);
  await assertVisible(page, ".drawerSearchField", "desktop search field");
  await assertVisible(page, "#risk-select", "desktop risk select");
  await assertVisible(page, "#min-prob", "desktop probability slider");
  await assertNoHorizontalOverflow(page, "desktop filtered state");
  await screenshot("desktop-filters-light.png");
}

async function desktopPlace(page, screenshot) {
  await loadDashboard(page, `/?place=${PLACE_ID}`);
  const panel = await assertVisible(page, ".selectedPointDesktop", "desktop selected place panel");
  await panel.getByText(PLACE_NAME).waitFor({ timeout: 15000 });
  await assertTrustOrdering(panel, "desktop selected place panel", { variant: "desktop" });
  await assertVisible(page, ".selectedPointWatchBtn", "desktop watchlist button");
  await assertVisible(page, ".pointGrid", "desktop selected place status grid");
  await assertNoHorizontalOverflow(page, "desktop selected place");
  await screenshot("desktop-place-light.png");

  const reportToggles = page.locator(".selectedPointDesktop .reportPanelToggle");
  if ((await reportToggles.count()) < 2) {
    fail("desktop selected place panel does not expose measurements and history toggles");
  }
  await reportToggles.first().scrollIntoViewIfNeeded();
  await assertVisible(page, ".selectedPointDesktop .reportPanelToggle", "desktop report toggle");
  await screenshot("desktop-place-reports-light.png");

  await page.locator(".selectedPointWatchBtn").first().click();
  await page.waitForTimeout(500);
  await screenshot("desktop-place-watchlist-light.png");
}

async function desktopPlaceDark(page, screenshot) {
  await loadDashboard(page, `/?place=${PLACE_ID}`);
  await assertTheme(page, "dark");
  const panel = await assertVisible(page, ".selectedPointDesktop", "desktop dark selected place panel");
  await assertTrustOrdering(panel, "desktop dark selected place panel", { variant: "desktop" });
  await assertVisible(page, ".signedBadge", "desktop dark signed badge");
  await assertNoHorizontalOverflow(page, "desktop dark selected place");
  await screenshot("desktop-place-dark.png");
}

async function desktopInfoTabs(page, screenshot) {
  await loadDashboard(page);
  await page.locator(".headerInfoNavPrimary").click();
  await assertVisible(page, ".infoPageOverlay", "desktop info overlay");
  await assertVisible(page, ".infoPageTabRow", "desktop info tabs");
  await assertNoHorizontalOverflow(page, "desktop info analytics tab");
  await screenshot("desktop-info-analytics.png");

  const tabs = page.locator(".infoPageTab");
  const tabCount = await tabs.count();
  if (tabCount < 3) fail(`desktop info overlay exposes ${tabCount} tabs, expected at least 3`);

  await tabs.nth(1).click();
  await assertVisible(page, ".infoPageBody", "desktop model info body");
  await assertNoHorizontalOverflow(page, "desktop info model tab");
  await screenshot("desktop-info-model.png");

  await tabs.nth(2).click();
  await assertVisible(page, ".infoPageBody", "desktop service info body");
  await assertNoHorizontalOverflow(page, "desktop info service tab");
  await screenshot("desktop-info-service.png");
}

async function mobileRoot(page, screenshot) {
  await loadDashboard(page);
  await assertTheme(page, "light");
  await assertVisible(page, ".gmSearchBar", "mobile search bar");
  await assertVisible(page, ".gmChipBar", "mobile chip bar");
  await assertVisible(page, ".mobileBottomSheet", "mobile bottom sheet");
  await assertNoHorizontalOverflow(page, "mobile root");
  await assertNoOverlap(page, [
    { selector: ".gmSearchBar", label: "search bar" },
    { selector: ".gmChipBar", label: "chip bar" },
    { selector: ".mobileBottomSheet", label: "bottom sheet" },
  ], "mobile root chrome");
  await screenshot("mobile-root-light.png");
}

async function mobileFilters(page, screenshot) {
  await loadDashboard(page);
  await page.locator(".gmSearchMenuBtn").click();
  await assertVisible(page, ".gmSheetFilterContent", "mobile filter sheet");
  await assertVisible(page, "#gm-risk-select", "mobile risk select");
  await page.locator("#gm-risk-select").selectOption("high");
  await page.locator("#gm-min-prob").evaluate((input) => {
    input.value = "0.40";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.waitForTimeout(500);
  await assertNoHorizontalOverflow(page, "mobile filter sheet");
  await screenshot("mobile-filters-light.png");

  await page.locator(".gmThemeBtn").filter({ hasText: "Тёмная" }).click();
  await assertTheme(page, "dark");
  await assertNoHorizontalOverflow(page, "mobile filter sheet dark theme");
  await screenshot("mobile-filters-dark-toggle.png");
}

async function mobilePlace(page, screenshot) {
  await loadDashboard(page, `/?place=${PLACE_ID}`);
  const sheet = await assertVisible(page, ".mobileBottomSheet", "mobile selected place sheet");
  await assertVisible(page, ".gmSheetPlaceContent", "mobile selected place content");
  await sheet.getByText(PLACE_NAME).waitFor({ timeout: 15000 });
  await assertTrustOrdering(sheet, "mobile selected place sheet", { requireProvenance: false });
  await screenshot("mobile-place-light.png");
  await page.locator(".gmSheetHandle").click();
  await page.locator(".mobileBottomSheet.full").waitFor({ timeout: 10000 });
  await page.waitForTimeout(350);
  const toggles = page.locator(".gmSectionToggle");
  if ((await toggles.count()) < 2) fail("mobile selected place sheet does not expose measurements and history toggles");
  await assertNoHorizontalOverflow(page, "mobile selected place");
  await screenshot("mobile-place-full-light.png");
}

async function mobilePlaceDark(page, screenshot) {
  await loadDashboard(page, `/?place=${PLACE_ID}`);
  await assertTheme(page, "dark");
  const sheet = await assertVisible(page, ".mobileBottomSheet", "mobile dark selected place sheet");
  await assertVisible(page, ".gmSheetPlaceContent", "mobile dark selected place content");
  await assertTrustOrdering(sheet, "mobile dark selected place sheet", { requireProvenance: false });
  await assertNoHorizontalOverflow(page, "mobile dark selected place");
  await screenshot("mobile-place-dark.png");
}

async function verifyResponsive(page, screenshot) {
  await page.goto(urlFor("/verify"), { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.getByText("Проверка снимка").waitFor({ timeout: 10000 });
  await assertNoHorizontalOverflow(page, "verify page");
  await screenshot(page.viewportSize()?.width && page.viewportSize().width < 600 ? "verify-mobile.png" : "verify-desktop.png");
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
    await reviewScenario(browser, "desktop root light", DESKTOP, "light", desktopRoot);
    await reviewScenario(browser, "desktop filters light", DESKTOP, "light", desktopFilters);
    await reviewScenario(browser, "desktop selected place light", DESKTOP, "light", desktopPlace);
    await reviewScenario(browser, "desktop selected place dark", DESKTOP, "dark", desktopPlaceDark);
    await reviewScenario(browser, "desktop info tabs", DESKTOP, "light", desktopInfoTabs);
    await reviewScenario(browser, "mobile root light", MOBILE, "light", mobileRoot);
    await reviewScenario(browser, "mobile filters and theme", MOBILE, "light", mobileFilters);
    await reviewScenario(browser, "mobile selected place light", MOBILE, "light", mobilePlace);
    await reviewScenario(browser, "mobile selected place dark", MOBILE, "dark", mobilePlaceDark);
    await reviewScenario(browser, "verify desktop", { width: 1280, height: 900 }, "light", verifyResponsive);
    await reviewScenario(browser, "verify mobile", MOBILE, "light", verifyResponsive);
  } finally {
    await browser.close();
    await writeFile(join(OUT_DIR, "ui-review-report.json"), `${JSON.stringify({ base_url: BASE_URL, results }, null, 2)}\n`, "utf-8");
  }

  console.log(`[ui-review] OK. Evidence: ${OUT_DIR}`);
}

main().catch(async (error) => {
  try {
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(join(OUT_DIR, "ui-review-report.json"), `${JSON.stringify({ base_url: BASE_URL, results }, null, 2)}\n`, "utf-8");
  } catch {
    // Preserve the original review failure.
  }
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
