import { test, expect } from "@playwright/test";
import { bypassIntro } from "./helpers/intro";

test.describe("the lab", () => {
  test.beforeEach(async ({ page }) => {
    await bypassIntro(page);
  });

  test("clock renders a live IST time", async ({ page }) => {
    await page.goto("/");
    await page.locator("#lab").scrollIntoViewIfNeeded();
    const clock = page.locator("[data-scramble-clock]");
    await expect(clock).toBeVisible({ timeout: 15_000 });
    await expect(clock).toHaveText(/\d{2}:\d{2}:\d{2}/, { timeout: 10_000 });
  });

  test("spring ball is draggable and returns home", async ({ page }) => {
    await page.goto("/");
    await page.locator("#lab").scrollIntoViewIfNeeded();
    const ball = page.locator("[data-spring-ball]");
    await expect(ball).toBeVisible({ timeout: 15_000 });

    const start = await ball.boundingBox();
    await ball.hover();
    await page.mouse.down();
    await page.mouse.move(start!.x + 80, start!.y + 40, { steps: 5 });
    await page.mouse.up();
    // Spring should return the ball to origin
    await page.waitForTimeout(1500);
    const end = await ball.boundingBox();
    expect(Math.abs(end!.x - start!.x)).toBeLessThan(10);
    expect(Math.abs(end!.y - start!.y)).toBeLessThan(10);
  });

  test("visual snapshot of the lab", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.locator("#lab").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-spring-ball]")).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForTimeout(1200);
    const path = `tests/__screenshots__/${testInfo.project.name}-lab.png`;
    await page.locator("#lab").screenshot({ path });
    await testInfo.attach("lab", { path, contentType: "image/png" });
  });

  test("no console errors in the lab", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.locator("#lab").scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    expect(errors, errors.join("\n")).toEqual([]);
  });
});
