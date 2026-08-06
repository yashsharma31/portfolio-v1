import { test, expect } from "@playwright/test";

test.describe("portfolio smoke", () => {
  test("homepage loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/.+/);

    expect(errors, `Console errors found:\n${errors.join("\n")}`).toEqual([]);
  });

  test("contact page loads", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBe(200);
  });

  test("visual snapshot of full page", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach("full-page", { body: shot, contentType: "image/png" });
  });
});
