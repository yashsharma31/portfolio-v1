import { test, expect } from "@playwright/test";
import {
  bypassIntro,
  waitForIntroDone,
  waitForIntroExiting,
} from "./helpers/intro";

test.describe("intro gate (tackle)", () => {
  test("desktop cluster appears then clears on reload", async ({ page }) => {
    const clusterAttached = page.waitForSelector("[data-intro-cluster]", {
      state: "attached",
      timeout: 15_000,
    });
    await page.goto("/");
    await clusterAttached;
    await waitForIntroDone(page);
    await expect(page.locator("[data-intro-cover]")).toHaveCount(0);
  });

  test("reload shows cover again", async ({ page }) => {
    await page.goto("/");
    await waitForIntroDone(page);

    const clusterAttached = page.waitForSelector("[data-intro-cluster]", {
      state: "attached",
      timeout: 15_000,
    });
    await page.reload();
    await clusterAttached;
    await waitForIntroDone(page);
    await expect(page.locator("[data-intro-cover]")).toHaveCount(0);
  });

  test("deep link never traps behind cover", async ({ page }) => {
    await page.goto("/#contact");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    await expect(page.locator("[data-intro-cover]")).toHaveCount(0);
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("reduced motion skips cover", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    await expect(page.locator("[data-intro-cover]")).toHaveCount(0);
  });

  test("Escape dismisses cover", async ({ page }) => {
    const coverAttached = page.waitForSelector("[data-intro-cover]", {
      state: "attached",
      timeout: 15_000,
    });
    await page.goto("/");
    await coverAttached;
    await page.keyboard.press("Escape");
    await waitForIntroDone(page);
    await expect(page.locator("[data-intro-cover]")).toHaveCount(0);
  });

  test("Skip button dismisses cover", async ({ page }) => {
    await page.goto("/");
    const skip = page.getByRole("button", { name: "Skip" });
    await skip.waitFor({ state: "attached", timeout: 10_000 });
    await skip.click({ force: true, timeout: 3_000 });
    await waitForIntroDone(page);
    await expect(page.locator("[data-intro-cover]")).toHaveCount(0);
  });

  test("handoff slides through exiting (cover still opaque mid-slide)", async ({
    page,
  }) => {
    const exiting = waitForIntroExiting(page);
    await page.goto("/");
    await exiting;

    const mid = await page.evaluate(() => {
      const main = document.querySelector("main");
      const cover = document.querySelector<HTMLElement>("[data-intro-cover]");
      if (!main || !cover) return null;
      const transform = getComputedStyle(cover).transform;
      return {
        attr: document.documentElement.getAttribute("data-intro"),
        mainOpacity: Number(getComputedStyle(main).opacity),
        coverOpacity: Number(getComputedStyle(cover).opacity),
        // Matrix with ty != 0 means the curtain has started sliding.
        sliding: transform !== "none" && transform !== "matrix(1, 0, 0, 1, 0, 0)",
      };
    });

    expect(mid).not.toBeNull();
    expect(mid!.attr).toBe("exiting");
    expect(mid!.mainOpacity).toBeGreaterThan(0);
    expect(mid!.coverOpacity).toBe(1);

    await waitForIntroDone(page);
    await expect(page.locator("[data-intro-cover]")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    await expect(page.locator("main")).toHaveCSS("opacity", "1");
  });

  test("bypass helper keeps suite fast", async ({ page }) => {
    await bypassIntro(page);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "done");
    await expect(page.locator("[data-intro-cover]")).toHaveCount(0);
  });
});

test.describe("intro gate mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile uses the same cluster craft", async ({ page }) => {
    const clusterAttached = page.waitForSelector("[data-intro-cluster]", {
      state: "attached",
      timeout: 15_000,
    });
    await page.goto("/");
    await clusterAttached;
    await expect(page.locator("[data-intro-wipe]")).toHaveCount(0);
    await waitForIntroDone(page);
    await expect(page.locator("[data-intro-cover]")).toHaveCount(0);
  });
});
