import { test, expect } from "@playwright/test";

test.describe("writing", () => {
  test("renders Medium rows or fallback link", async ({ page }) => {
    await page.goto("/");
    await page.locator("#blog").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("heading", { name: "Notes on building things." })
    ).toBeVisible();

    // Wait for either rows or the Medium fallback.
    const rows = page.locator("[data-writing-rows]");
    const fallback = page.getByRole("link", { name: /Read on Medium/i });
    await expect(rows.or(fallback)).toBeVisible({ timeout: 15_000 });
  });

  test("API failure shows Medium fallback", async ({ page }) => {
    await page.route("**/api/medium", (route) => route.abort());
    await page.goto("/");
    await page.locator("#blog").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("link", { name: /Read on Medium/i })
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("about", () => {
  test("portrait loads and resume link resolves", async ({ page }) => {
    await page.goto("/");
    await page.locator("#about").scrollIntoViewIfNeeded();
    const portrait = page.locator("[data-about-portrait]");
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveJSProperty("complete", true);

    const resume = page.locator("[data-resume-link]");
    await expect(resume).toBeVisible();
    const href = await resume.getAttribute("href");
    expect(href).toBeTruthy();
    const res = await page.request.get(href!);
    expect(res.status()).toBe(200);
  });

  test("visual snapshot", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const path = `tests/__screenshots__/${testInfo.project.name}-about.png`;
    await page.locator("#about").screenshot({ path });
    await testInfo.attach("about", { path, contentType: "image/png" });
  });
});
