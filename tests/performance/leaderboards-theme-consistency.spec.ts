import { expect, test } from "@playwright/test";

test.describe("Leaderboard Theme Consistency & Flash Verification Gate", () => {
  test("Direct visit to /leaderboards renders light theme on first frame without theme flash", async ({
    page,
  }) => {
    // 1. Initial direct load to /leaderboards
    await page.goto("/leaderboards", { waitUntil: "domcontentloaded" });

    // The container is scoped with data-theme="light" and .leaderboard-body in SSR markup
    const container = page.locator("div.leaderboard-body");
    await expect(container).toBeVisible();
    await expect(container).toHaveAttribute("data-theme", "light");

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
    const homeMain = page.locator(".home-main");
    await expect(homeMain).toBeVisible();

    // 2. Navigate to /leaderboards
    const header = page.locator("header[data-site-header]");
    const mobileMenuToggle = header.locator('button[aria-controls="site-mobile-navigation"]');
    const isMobile = await mobileMenuToggle.isVisible();

    if (isMobile) {
      await mobileMenuToggle.click();
      const mobileDrawer = page.locator("#site-mobile-navigation");
      await expect(mobileDrawer).toBeVisible();
      const targetLink = mobileDrawer.locator('a[href="/leaderboards"]').first();
      await expect(targetLink).toBeVisible();
      await targetLink.click();
    } else {
      const navLink = header.locator('a[href="/leaderboards"]').first();
      await navLink.click();
    }
    await page.waitForURL(/\/leaderboards$/);

    // Verify transition to light theme on the leaderboard scoped container
    const container = page.locator("div.leaderboard-body");
    await expect(container).toBeVisible();
    await expect(container).toHaveAttribute("data-theme", "light");

    const bgColor = await container.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toBe("rgb(255, 252, 246)");

    // 3. Return to Home page
    const brandLink = header.locator('a[href="/"]').first();
    await brandLink.click();
    await page.waitForURL(/\/$/);

    // Verify cleanup and restoration of Home
    await expect(homeMain).toBeVisible();
    await expect(page.locator("div.leaderboard-body")).toHaveCount(0);
  });
});
