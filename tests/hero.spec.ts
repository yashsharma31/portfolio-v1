import { test, expect } from "@playwright/test";

test.describe("hero", () => {
  test("artwork is present and organism canvas mounts without errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await expect(page.locator("img[data-hero-art]")).toBeVisible();

    // HeroCanvas retired (B2) — portrait dissolve lives on the global organism.
    await expect(page.locator("[data-hero-canvas]")).toHaveCount(0);
    await expect(page.locator("[data-ember-field] canvas")).toHaveCount(1, {
      timeout: 15_000,
    });
    expect(errors).toEqual([]);
  });

  test("reduced motion shows static artwork only", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("img[data-hero-art]")).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.locator("[data-hero-canvas]")).toHaveCount(0);
    await expect(page.locator("[data-ember-field]")).toHaveCount(0);

    // Entrance animation is disabled: headline fully visible immediately.
    const headline = page.getByRole("heading", { level: 1 });
    await expect(headline).toContainText("I build editors, canvases");
  });

  test("primary CTA scrolls to projects", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "See the work" }).click();
    await page.waitForTimeout(1200);
    const projectsInView = await page.locator("#projects").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    });
    expect(projectsInView).toBe(true);
  });
});
