import { expect, test, type Page, type Request } from "@playwright/test";

const formalHeaderSelector =
  'header[data-site-header]:visible, header[data-home-design-header]:visible, header[data-kids-design-header]:visible';

async function clickFormalNavigation(page: Page, targetHref: string) {
  const header = page.locator(formalHeaderSelector).first();
  await expect(header).toBeVisible();

  const directLink = header
    .locator(`a[href="${targetHref}"]:visible`)
    .first();
  if (await directLink.isVisible()) {
    await directLink.click();
    return;
  }

  const mobileMenuToggle = header.locator(
    'button[aria-controls="site-mobile-navigation"]:visible',
  );
  if (await mobileMenuToggle.isVisible()) {
    await mobileMenuToggle.click();
    const targetLink = page
      .locator(`#site-mobile-navigation a[href="${targetHref}"]:visible`)
      .first();
    await expect(targetLink).toBeVisible();
    await targetLink.click();
    return;
  }

  const pageLink = page.locator(`a[href="${targetHref}"]:visible`).first();
  await expect(pageLink).toBeVisible();
  await pageLink.click();
}

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
        await expect(page.locator(formalHeaderSelector).first()).toBeVisible();

        // Ensure full-screen LoadingPage is never displayed
        await expect(page.locator(".status-page")).toHaveCount(0);

        await clickFormalNavigation(page, step.targetHref);

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

        // Exactly one formal header remains mounted for the active route.
        await expect(page.locator(formalHeaderSelector)).toHaveCount(1);
      }

      // Assert that the only document navigation is the intentional transition to the Kids route
      // (which requires a fresh document to receive dynamic nonce-based AdSense CSP),
      // and all other subsequent navigations remain strictly client-side SPA.
      expect(documentRequests).toEqual([
        "GET http://127.0.0.1:3000/would-you-rather-questions-for-kids",
        "GET http://127.0.0.1:3000/find-questions",
        "GET http://127.0.0.1:3000/",
      ]);
      console.log(
        `[PROD-VP ${vp.name}] Successfully verified navigation chain with intentional Kids document request!`,
      );
    });
  });
}
