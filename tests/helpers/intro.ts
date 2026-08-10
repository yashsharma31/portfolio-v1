import type { Page } from "@playwright/test";

const INTRO_TEST_BYPASS_KEY = "ember-intro-bypass";

/** Skip intro before any document scripts run (suite speed only). */
export async function bypassIntro(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
  }, INTRO_TEST_BYPASS_KEY);
}

export async function waitForIntroDone(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-intro") === "done",
    undefined,
    { timeout: 8_000 }
  );
}

/** Assert handoff uses exiting crossfade (no instant pending→done pop). */
export async function waitForIntroExiting(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-intro") === "exiting",
    undefined,
    { timeout: 15_000 }
  );
}
