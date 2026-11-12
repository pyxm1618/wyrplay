import { expect, test, type Page, type Request } from "@playwright/test";

const formalHeaderSelector =
  "header[data-site-header]:visible, header[data-home-design-header]:visible, header[data-kids-design-header]:visible";

async function clickFormalNavigation(page: Page, targetHref: string) {
  const header = page.locator(formalHeaderSelector).first();
  await expect(header).toBeVisible();

  const directLink = header.locator(`a[href="${targetHref}"]:visible`).first();
  if (await directLink.isVisible()) {
    await directLink.click();
    return;
  }

  const mobileMenuToggle = header.locator('button[aria-controls="site-mobile-navigation"]:visible');
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

test.describe("SPA Client Navigation Gate", () => {
  test("Primary navigation maintains client-side routing without full document reload or full-screen loading", async ({
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
      await expect(page.locator(formalHeaderSelector).first()).toBeVisible();

      // Ensure full-screen LoadingPage is never displayed before click
      await expect(page.locator(".status-page")).toHaveCount(0);
      await expect(page.getByText("Getting things ready for you")).toHaveCount(0);

      await clickFormalNavigation(page, step.targetHref);

      // Wait for URL to update
      await page.waitForURL((url) => url.pathname === step.expectedPathname);

      // Ensure no full-screen LoadingPage appears after transition
      await expect(page.locator(".status-page")).toHaveCount(0);
      await expect(page.getByText("Getting things ready for you")).toHaveCount(0);

      // Exactly one formal header remains mounted for the active route.
      await expect(page.locator(formalHeaderSelector)).toHaveCount(1);
    }

    // Cross-document policy boundaries reload; the ordinary Finder/Print/Leaderboard steps remain SPA.
    expect(documentRequests).toEqual([
      "GET http://127.0.0.1:3000/would-you-rather-questions-for-kids",
      "GET http://127.0.0.1:3000/find-questions",
      "GET http://127.0.0.1:3000/",
    ]);
  });
});
