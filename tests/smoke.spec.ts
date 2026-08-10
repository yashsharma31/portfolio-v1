import { test, expect } from "@playwright/test";
import { bypassIntro } from "./helpers/intro";

const SECTION_ANCHORS = [
  "top",
  "projects",
  "lab",
  "experience",
  "blog",
  "linkedin",
  "about",
  "contact",
];

test.describe("portfolio smoke", () => {
  test.beforeEach(async ({ page }) => {
    await bypassIntro(page);
  });

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

  test("hero renders locked copy and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toContainText("I build editors, canvases");
    await expect(
      page.getByRole("link", { name: "See the work" })
    ).toBeVisible();
  });

  test("all section anchors exist", async ({ page }) => {
    await page.goto("/");
    for (const id of SECTION_ANCHORS) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("navbar is a single 64px line with one contact CTA intent", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box?.height).toBeLessThanOrEqual(80);

    // CTA intent lock: every contact CTA uses the exact label "Get in touch"
    const ctaTexts = await page
      .locator('a[href="#contact"]')
      .allInnerTexts();
    for (const text of ctaTexts) {
      const normalized = text.replace("→", "").trim();
      expect(["Get in touch"]).toContain(normalized);
    }
  });

  test("/contact redirects to homepage contact anchor", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBe(200);
    expect(page.url()).toContain("/#contact");
  });

  test("visual snapshot of full page", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const path = `tests/__screenshots__/${testInfo.project.name}-full.png`;
    await page.screenshot({ path, fullPage: true });
    await testInfo.attach("full-page", {
      path,
      contentType: "image/png",
    });
  });
});
