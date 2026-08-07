/**
 * Captures work-chapter visuals (PRD 6.3).
 * - Glue: PENDING-INPUT. glue.is no longer resolves and gluelabs.com pivoted
 *   to a different product (verified Aug 2026), so there is nothing truthful
 *   to capture live. A labeled placeholder ships until Yash provides editor
 *   screenshots. The capture path below is kept for when a URL exists again.
 * - TruWallet / TruEnroll: PENDING-INPUT (auth-walled products). Generates
 *   clearly labeled placeholder frames in the site palette so the layout is
 *   real while assets are pending. Replace the files in public/images/work/
 *   when approved visuals arrive; no code change needed.
 *
 * Usage: npx tsx scripts/capture-work.ts  (or ts-node; plain node >= 22 with
 * --experimental-strip-types also works)
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/images/work");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function captureGlue() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  try {
    await page.goto("https://gluelabs.com", {
      waitUntil: "networkidle",
      timeout: 45_000,
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT_DIR, "glue.png") });
    console.log("glue.png captured");
  } finally {
    await browser.close();
  }
}

/** Labeled placeholder in palette; loudly marked as pending. */
async function placeholder(
  file: string,
  label: string,
  w: number,
  h: number
) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="#131316"/>
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    ${Array.from({ length: 14 }, (_, i) => {
      const y = (h / 14) * i + h / 28;
      return `<circle cx="${w * 0.82}" cy="${y}" r="${2 + (i % 4)}" fill="rgba(232,118,58,${0.1 + (i % 5) * 0.08})"/>`;
    }).join("")}
    <text x="48" y="${h / 2 - 12}" font-family="monospace" font-size="26" fill="#63636b">${label}</text>
    <text x="48" y="${h / 2 + 28}" font-family="monospace" font-size="18" fill="#4a4a52">PENDING-INPUT: approved product visual</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, file));
  console.log(`${file} placeholder written`);
}

async function main() {
  // Live capture disabled until a truthful Glue editor URL exists again.
  // Re-enable by swapping the placeholder call for captureGlue().
  void captureGlue;
  await placeholder("glue.png", "Glue canvas suite", 1600, 1000);
  await placeholder("truwallet.png", "TruWallet", 780, 1600);
  await placeholder("truenroll.png", "TruEnroll", 1600, 1000);
}

main();
