import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.H2O_UX_BASE_URL || "https://h2oatlas.ee";
const OUT_DIR = process.env.H2O_UX_OUT_DIR || "/tmp/h2oatlas-live-ux-smoke";
const ATTEMPTS = positiveInt(process.env.H2O_UX_ATTEMPTS, 3);
const RETRY_DELAY_MS = positiveInt(process.env.H2O_UX_RETRY_DELAY_MS, 15000);

function positiveInt(raw, fallback) {
  const parsed = Number.parseInt(String(raw || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function attemptOutDir(attempt) {
  return ATTEMPTS > 1 ? `${OUT_DIR}-attempt-${attempt}` : OUT_DIR;
}

function runSmokeAttempt(attempt) {
  const outDir = attemptOutDir(attempt);
  console.log(`[ux-smoke-live] attempt ${attempt}/${ATTEMPTS}: ${BASE_URL}`);
  console.log(`[ux-smoke-live] screenshots: ${outDir}`);

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [join(SCRIPT_DIR, "ux-smoke.mjs")], {
      env: {
        ...process.env,
        H2O_UX_BASE_URL: BASE_URL,
        H2O_UX_OUT_DIR: outDir,
      },
      stdio: "inherit",
    });

    child.on("error", (error) => {
      console.error(`[ux-smoke-live] failed to start smoke attempt: ${error.message}`);
      resolve(1);
    });
    child.on("exit", (code, signal) => {
      if (signal) {
        console.error(`[ux-smoke-live] smoke attempt stopped by ${signal}`);
        resolve(1);
        return;
      }
      resolve(code ?? 1);
    });
  });
}

let lastCode = 1;

for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
  lastCode = await runSmokeAttempt(attempt);
  if (lastCode === 0) {
    console.log(`[ux-smoke-live] OK after ${attempt} attempt${attempt === 1 ? "" : "s"}`);
    process.exit(0);
  }

  if (attempt < ATTEMPTS) {
    console.warn(`[ux-smoke-live] attempt ${attempt} failed; retrying in ${RETRY_DELAY_MS}ms`);
    await sleep(RETRY_DELAY_MS);
  }
}

console.error(`[ux-smoke-live] failed after ${ATTEMPTS} attempt${ATTEMPTS === 1 ? "" : "s"}`);
process.exit(lastCode);
