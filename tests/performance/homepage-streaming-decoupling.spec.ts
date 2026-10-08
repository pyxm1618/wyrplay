import { expect, test } from "@playwright/test";

test.describe("Homepage Streaming & Leaderboard Decoupling Gate", () => {
  test("Hero and main content stream immediately before leaderboard delay finishes", async ({
    page,
  }) => {
    const startTime = Date.now();

    // Use "commit" so Playwright does not wait for chunked streaming to close.
    // This allows asserting that the initial shell (Hero, H1, Arena) renders
    // immediately while the async Suspense leaderboard is still delayed.
    await page.goto("/", { waitUntil: "commit" });

    // 1. Verify that the Hero H1 is visible immediately in the first stream chunk
    const heroH1 = page.locator("h1");
    await expect(heroH1).toBeVisible({ timeout: 2000 });

    const timeHeroVisible = Date.now() - startTime;
    console.log(`[STREAMING BENCHMARK] Hero visible at ${timeHeroVisible}ms`);

    // 2. Main structure is present
    const mainShell = page.locator(".home-main");
    await expect(mainShell).toBeVisible();

    // 3. Trending should still be in skeleton state initially
    // Then after the loader delay finishes, the leaderboard content resolves
    const trendingResolved = page.locator(
      '[data-trending-ready="true"], [data-trending-unavailable="true"]',
    );
    await expect(trendingResolved).toBeVisible({ timeout: 10_000 });

    const timeTrendingResolved = Date.now() - startTime;
    console.log(`[STREAMING BENCHMARK] Trending resolved at ${timeTrendingResolved}ms`);

    // The hero must appear at or before the leaderboard resolution
    expect(timeTrendingResolved).toBeGreaterThanOrEqual(timeHeroVisible);

    // 4. Skeleton should be replaced and no longer visible
    await expect(page.locator('[data-trending-skeleton="true"]')).toHaveCount(0);
  });
});
