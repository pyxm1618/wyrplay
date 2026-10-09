import { expect, test, type Page, type Request } from "@playwright/test";

async function waitForInteractiveHome(page: Page) {
  await expect(page.locator('[data-home-ready="true"]')).toBeVisible();
  await page.waitForFunction(() => {
    const image = document.querySelector<HTMLImageElement>(".hero-title-img");
    return Boolean(image?.complete && image.naturalWidth > 0);
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

test.describe("SPA Client Navigation Gate", () => {
  test("Header navigation maintains client-side routing without full document reload or full-screen loading", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    // Collect document navigation requests after initial page load
    const documentRequests: string[] = [];
    let initialLoadComplete = false;

    page.on("request", (req: Request) => {
      if (initialLoadComplete && req.resourceType() === "document") {
        documentRequests.push(`${req.method()} ${req.url()}`);
      }
    });

    page.on("console", (msg) => console.log("PAGE CONSOLE:", msg.type(), msg.text()));
    page.on("pageerror", (err) => console.log("PAGE ERROR:", err));

    // 1. Initial load of Home page
    await page.goto("/", { waitUntil: "load" });
    await waitForInteractiveHome(page);
    initialLoadComplete = true;

    const navSteps = [
      {
        from: "/",
        targetHref: "/would-you-rather-questions-for-kids",
        expectedPathname: "/would-you-rather-questions-for-kids",
      },
      {
        from: "/would-you-rather-questions-for-kids",
        targetHref: "/find-questions",
        expectedPathname: "/find-questions",
      },
      {
        from: "/find-questions",
        targetHref: "/print",
        expectedPathname: "/print",
      },
      {
        from: "/print",
        targetHref: "/leaderboards",
        expectedPathname: "/leaderboards",
      },
      {
        from: "/leaderboards",
        targetHref: "/",
        expectedPathname: "/",
      },
    ];

    for (const step of navSteps) {
      const headerNav = page.locator("header[data-site-header]");
      await expect(headerNav).toBeVisible();

      // Ensure full-screen LoadingPage is never displayed before click
      await expect(page.locator(".status-page")).toHaveCount(0);
      await expect(page.getByText("Getting things ready for you")).toHaveCount(0);

      const mobileMenuToggle = headerNav.locator('button[aria-controls="site-mobile-navigation"]');
      const isMobile = await mobileMenuToggle.isVisible();

      if (isMobile) {
        if (step.targetHref === "/") {
          const brandLink = headerNav.locator('a[href="/"]').first();
          await expect(brandLink).toBeVisible();
          await brandLink.click();
        } else {
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

      // Wait for URL to update
      await page.waitForURL((url) => url.pathname === step.expectedPathname);

      // Ensure no full-screen LoadingPage appears after transition
      await expect(page.locator(".status-page")).toHaveCount(0);
      await expect(page.getByText("Getting things ready for you")).toHaveCount(0);

      // Shell remains mounted
      await expect(page.locator("header[data-site-header]")).toBeVisible();
    }

    // Assert that no new document navigation occurred during the entire traversal
    expect(documentRequests).toEqual([]);
  });
});
