import { test, expect } from "@playwright/test";
import { bypassIntro } from "./helpers/intro";

test.describe("selected work", () => {
  test.beforeEach(async ({ page }) => {
    await bypassIntro(page);
  });

  test("renders three chapters with loaded images", async ({ page }) => {
    const failed: string[] = [];
    page.on("response", (res) => {
      if (res.url().includes("/images/work/") && res.status() >= 400) {
        failed.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.goto("/");
    const cards = page.locator(".stack-card");
    await expect(cards).toHaveCount(3);

    await expect(page.getByRole("heading", { name: "TruWallet" })).toBeAttached();
    await expect(page.getByRole("heading", { name: "TruEnroll" })).toBeAttached();
    await expect(
      page.getByRole("heading", { name: "Glue canvas suite" })
    ).toBeAttached();

    expect(failed).toEqual([]);
  });

  test("mobile viewport scrolls freely past the chapters", async ({ page }) => {
    await page.goto("/");
    // Scroll to the end of the page; if pinning trapped scroll on mobile,
    // the contact section would never enter the viewport.
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight)
    );
    await page.waitForTimeout(800);
    const contactVisible = await page.locator("#contact").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight;
    });
    expect(contactVisible).toBe(true);
  });

  test("verified metrics render in the Glue chapter", async ({ page }) => {
    await page.goto("/");
    const work = page.getByRole("region", { name: "Selected work" });
    await expect(work.getByText("30%", { exact: true })).toBeAttached();
    await expect(work.getByText("50%", { exact: true })).toBeAttached();
  });
});
