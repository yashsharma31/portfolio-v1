/** Dev utility: screenshots the work section at several scroll offsets. */
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

const top = await page.evaluate(() => {
  const el = document.querySelector("#projects");
  return el.getBoundingClientRect().top + window.scrollY;
});

for (const [i, frac] of [0.15, 0.45, 0.75].entries()) {
  await page.evaluate(
    ([t, f]) => window.scrollTo(0, t + window.innerHeight * 3 * f),
    [top, frac]
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: `/tmp/scrub-${i}.png` });
}
await browser.close();
console.log("done");
