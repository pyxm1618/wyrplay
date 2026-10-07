import { expect, test } from "@playwright/test";

test.describe("Homepage Streaming & Leaderboard Decoupling Gate", () => {
  test("Hero and main content stream immediately before leaderboard delay finishes", async ({
    page,
  }) => {
    const startTime = Date.now();

    // Navigate to homepage with commit/domcontentloaded to observe streaming HTML shell immediately
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // 1. Verify that before 1000ms, the main content (H1, Hero, Arena) is visible
    const heroH1 = page.locator("h1");
    await expect(heroH1).toBeVisible({ timeout: 800 });

    const timeHeroVisible = Date.now() - startTime;
    console.log(`[STREAMING BENCHMARK] Hero visible at ${timeHeroVisible}ms`);
    expect(timeHeroVisible).toBeLessThan(1000);

    // 2. Main structure is present
    const mainShell = page.locator(".home-main");
    await expect(mainShell).toBeVisible();

    // 3. After the delayed loader finishes, the leaderboard content is resolved
    const trendingResolved = page.locator(
      '[data-trending-ready="true"], [data-trending-unavailable="true"]',
    );
    await expect(trendingResolved).toBeVisible({ timeout: 10_000 });

    const timeTrendingResolved = Date.now() - startTime;
    console.log(`[STREAMING BENCHMARK] Trending resolved at ${timeTrendingResolved}ms`);

    // 4. Skeleton should be replaced and no longer visible
    await expect(page.locator('[data-trending-skeleton="true"]')).toHaveCount(0);
  });
});
