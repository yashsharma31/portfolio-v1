import { test, expect } from "@playwright/test";

test.describe("proof bar", () => {
  test("renders live ribbon and stats, or shipping fallback", async ({
    page,
  }) => {
    await page.goto("/");
    const bar = page.locator("[data-proof-bar]");
    await expect(bar).toBeVisible();
    await expect(page.locator("[data-proof-stats]")).toContainText(
      /shipping since 2022/
    );

    // Wait for either the ribbon (API success) or confirm fallback only.
    const ribbon = page.locator("[data-proof-ribbon]");
    const appeared = await ribbon
      .waitFor({ state: "visible", timeout: 12_000 })
      .then(() => true)
      .catch(() => false);

    if (appeared) {
      await expect(page.locator("[data-proof-stats]")).toContainText(
        /contributions this year/
      );
      await expect(page.locator("[data-proof-stats]")).toContainText(/day streak/);
    } else {
      await expect(ribbon).toHaveCount(0);
      await expect(page.locator("[data-proof-stats]")).toHaveText(
        /shipping since 2022/
      );
    }
  });

  test("API failure hides ribbon and keeps shipping fallback", async ({
    page,
  }) => {
    await page.route(
      "**/github-contributions-api.jogruber.de/**",
      (route) => route.abort()
    );
    await page.goto("/");
    await page.waitForTimeout(1500);
    await expect(page.locator("[data-proof-ribbon]")).toHaveCount(0);
    await expect(page.locator("[data-proof-stats]")).toHaveText(
      /shipping since 2022/
    );
  });
});

test.describe("experience", () => {
  test("renders four timeline entries", async ({ page }) => {
    await page.goto("/");
    await page.locator("#experience").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Where the hours went." })).toBeVisible();
    await expect(page.locator("[data-experience-entry]")).toHaveCount(4);
    await expect(page.getByText("Software Development Engineer II")).toBeVisible();
    await expect(page.getByText("Trential").first()).toBeVisible();
    await expect(page.getByText("Glue Labs").first()).toBeVisible();
  });

  test("accent rail is present", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.locator("#experience").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-experience-accent]")).toBeVisible();
    const path = `tests/__screenshots__/${testInfo.project.name}-experience.png`;
    await page.locator("#experience").screenshot({ path });
    await testInfo.attach("experience", { path, contentType: "image/png" });
  });
});
