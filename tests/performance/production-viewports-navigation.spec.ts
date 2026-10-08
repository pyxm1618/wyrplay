import { expect, test, type Request } from "@playwright/test";

const viewports = [
  { name: "Mobile (390x844)", width: 390, height: 844, isMobile: true },
  { name: "Laptop (1366x768)", width: 1366, height: 768, isMobile: false },
  { name: "MacBook (1440x900)", width: 1440, height: 900, isMobile: false },
  { name: "FullHD (1920x1080)", width: 1920, height: 1080, isMobile: false },
] as const;

for (const vp of viewports) {
  test.describe(`Production Multi-Viewport Gate [${vp.name}]`, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
    });

    test(`Full primary navigation loop maintains SPA routing and zero-overflow at ${vp.width}x${vp.height}`, async ({
      page,
      isMobile,
    }) => {
      // The viewport matrix already covers mobile & desktop viewports independently;
      // skip execution under the mobile device simulator to avoid redundant runs.
      test.skip(isMobile, "Viewport matrix is verified in the desktop project");
      test.setTimeout(90_000);

      const documentRequests: string[] = [];
      let initialLoadComplete = false;

      page.on("request", (req: Request) => {
        if (initialLoadComplete && req.resourceType() === "document") {
          documentRequests.push(`${req.method()} ${req.url()}`);
        }
      });

      // 1. Initial Load of Home
      const startHome = Date.now();
      await page.goto("/", { waitUntil: "domcontentloaded" });
      initialLoadComplete = true;

      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("[data-home-ready=true]")).toBeVisible({ timeout: 15_000 });
      console.log(`[PROD-VP ${vp.name}] Home initial load in ${Date.now() - startHome}ms`);

      // Check horizontal overflow
      const homeNoOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      );
      expect(homeNoOverflow, `horizontal overflow detected at ${vp.name} on /`).toBe(true);

      const navSteps = [
        {
          from: "/",
          targetHref: "/would-you-rather-questions-for-kids",
          expectedPathname: "/would-you-rather-questions-for-kids",
          expectedHeading: /Kids|Children|Family/i,
        },
        {
          from: "/would-you-rather-questions-for-kids",
          targetHref: "/find-questions",
          expectedPathname: "/find-questions",
          expectedHeading: /Find Questions/i,
        },
        {
          from: "/find-questions",
          targetHref: "/print",
          expectedPathname: "/print",
          expectedHeading: /Print.*Cards.*Sheets/i,
        },
        {
          from: "/print",
          targetHref: "/leaderboards",
          expectedPathname: "/leaderboards",
          expectedHeading: /Leaderboard|Ranking/i,
        },
        {
          from: "/leaderboards",
          targetHref: "/",
          expectedPathname: "/",
          expectedHeading: /Would You Rather/i,
        },
      ];

      for (const step of navSteps) {
        const headerNav = page.locator("header[data-site-header]");
        await expect(headerNav).toBeVisible();

        // Ensure full-screen LoadingPage is never displayed
        await expect(page.locator(".status-page")).toHaveCount(0);

        if (vp.isMobile) {
          if (step.targetHref === "/") {
            const brandLink = headerNav.locator('a[href="/"]').first();
            await expect(brandLink).toBeVisible();
            await brandLink.click();
          } else {
            const mobileMenuToggle = headerNav.locator(
              'button[aria-controls="site-mobile-navigation"]',
            );
            await mobileMenuToggle.click();
            const mobileDrawer = page.locator("#site-mobile-navigation");
            await expect(mobileDrawer).toBeVisible();
            const targetLink = mobileDrawer.locator(`a[href="${step.targetHref}"]`).first();
            await expect(targetLink).toBeVisible();
            await targetLink.click();
          }
        } else {
          const targetLink =
            step.targetHref === "/"
              ? headerNav.locator('a[href="/"]').first()
              : headerNav
                  .locator(`nav[aria-label="Primary navigation"] a[href="${step.targetHref}"]`)
                  .first();
          await expect(targetLink).toBeVisible();
          await targetLink.click();
        }

        await page.waitForURL((url) => url.pathname === step.expectedPathname);

        // Verify no full-screen loading
        await expect(page.locator(".status-page")).toHaveCount(0);

        // Verify no horizontal overflow at this viewport
        const noOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        );
        expect(noOverflow, `horizontal overflow detected at ${vp.name} on ${step.targetHref}`).toBe(
          true,
        );

        // Verify shell remains mounted
        await expect(page.locator("header[data-site-header]")).toBeVisible();
      }

      // Assert zero document reload occurred across the entire navigation chain
      expect(documentRequests).toEqual([]);
      console.log(`[PROD-VP ${vp.name}] Successfully verified SPA chain without document reload!`);
    });
  });
}
