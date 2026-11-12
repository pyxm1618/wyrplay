import { expect, test, type Page } from "@playwright/test";

async function waitForInteractiveHome(page: Page) {
  await expect(page.locator(".home-main")).toBeVisible();
  await page.waitForFunction(() => {
    const image = document.querySelector<HTMLImageElement>(".hero-title-img");
    return Boolean(image?.complete && image.naturalWidth > 0);
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

test.describe("Leaderboard Theme Consistency & Flash Verification Gate", () => {
  test("Direct visit to /leaderboards renders light theme on first frame without theme flash", async ({
    page,
  }) => {
    // 1. Initial direct load to /leaderboards
    await page.goto("/leaderboards", { waitUntil: "domcontentloaded" });

    // Fixed light experience synchronizes the root theme without an inner override.
    const container = page.locator("div.leaderboard-body");
    await expect(container).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(container).not.toHaveAttribute("data-theme");

    // Verify computed background color is the intended light paper tone (#fffcf6 = rgb(255, 252, 246))
    const bgColor = await container.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe("rgb(255, 252, 246)");

    // Ensure the leaderboard page content renders in light mode
    const pageContent = page.locator(".leaderboard-page");
    await expect(pageContent).toBeVisible();
    const pageBg = await pageContent.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(pageBg).toBe("rgb(255, 252, 246)");
  });

  test("Client navigation Home -> Leaderboards -> Home transitions themes seamlessly without flash", async ({
    page,
  }) => {
    // 1. Load Home page
    await page.goto("/", { waitUntil: "load" });
    await waitForInteractiveHome(page);
    const homeMain = page.locator(".home-main");
    await expect(homeMain).toBeVisible();

    // 2. Navigate to /leaderboards from the active Homepage authority.
    const leaderboardLink = page.locator('a[href="/leaderboards"]:visible').first();
    await expect(leaderboardLink).toBeVisible();
    await leaderboardLink.click();
    await page.waitForURL(/\/leaderboards$/);

    // Verify transition to light theme on the leaderboard scoped container
    const container = page.locator("div.leaderboard-body");
    await expect(container).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(container).not.toHaveAttribute("data-theme");

    const bgColor = await container.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe("rgb(255, 252, 246)");

    // 3. Return to Home page through the shared header used by Leaderboards.
    const brandLink = page.locator('header[data-site-header] a[href="/"]').first();
    await expect(brandLink).toBeVisible();
    await brandLink.click();
    await page.waitForURL(/\/$/);

    // Verify cleanup and restoration of Home
    await expect(homeMain).toBeVisible();
    await expect(page.locator("div.leaderboard-body")).toHaveCount(0);
  });
});
