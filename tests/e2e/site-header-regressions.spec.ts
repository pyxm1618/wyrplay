import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  "/",
  "/find-questions",
  "/play",
  "/print",
  "/leaderboards",
  "/questions",
  "/funny-would-you-rather-questions",
  "/hard-would-you-rather-questions",
  "/would-you-rather-questions-for-friends",
  "/would-you-rather-questions-for-couples",
  "/would-you-rather-questions-for-kids",
  "/privacy",
] as const;

const navigationLinks = [
  ["Home", "/"],
  ["For Kids", "/would-you-rather-questions-for-kids"],
  ["Find Questions", "/find-questions"],
  ["Print", "/print"],
  ["Leaderboards", "/leaderboards"],
  ["Play Now", "/play"],
] as const;

const responsiveRoutes = ["/", "/would-you-rather-questions-for-kids", "/find-questions"] as const;

async function denyAnalytics(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("creat-web:analytics-consent:v1", "denied");
    } catch {
      // ignore storage restrictions in unusual browser contexts
    }
  });
}

async function expectNavigationLinks(page: Page, mobile: boolean) {
  const header = page.locator("[data-site-header]");
  const navigation = mobile
    ? header.getByRole("navigation", { name: "Mobile navigation" })
    : header.getByRole("navigation", { name: "Primary navigation" });

  for (const [label, href] of navigationLinks) {
    const link =
      label === "Play Now"
        ? mobile
          ? navigation.getByRole("link", { name: label, exact: true })
          : header.getByRole("link", { name: label, exact: true })
        : navigation.getByRole("link", { name: label, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
  }
}

test.beforeEach(async ({ page }) => {
  await denyAnalytics(page);
});

test("all major public routes render exactly one authoritative SiteHeader", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page.locator("[data-site-header]"), `${route}: SiteHeader count`).toHaveCount(1);
    await expect(
      page.locator("[data-home-design-header]"),
      `${route}: retired Home header`,
    ).toHaveCount(0);
    await expect(
      page.locator("[data-kids-design-header]"),
      `${route}: retired Kids header`,
    ).toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
      `${route}: primary navigation`,
    ).toHaveCount(1);
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
      `${route}: duplicate global navigation`,
    ).toHaveCount(0);
    await expect(page.locator("footer"), `${route}: SiteFooter count`).toHaveCount(1);
  }
});

test("public navigation route semantics come from the shared authority", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expectNavigationLinks(page, false);
});

for (const width of [375, 390, 768, 1024, 1280, 1440] as const) {
  test(`shared responsive navigation works across public surfaces at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 1024 });

    for (const route of responsiveRoutes) {
      await page.goto(route);
      const header = page.locator("[data-site-header]");
      await expect(header).toHaveCount(1);
      await expect(page.locator("[data-home-design-header]")).toHaveCount(0);
      await expect(page.locator("[data-kids-design-header]")).toHaveCount(0);

      const menuButton = header.getByRole("button", { name: "Open mobile menu" });
      if (width < 1280) {
        await expect(menuButton).toBeVisible();
        await menuButton.click();
        await expect(header.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
        await expectNavigationLinks(page, true);
        await page.keyboard.press("Escape");
        await expect(header.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
      } else {
        await expect(menuButton).toBeHidden();
        await expect(header.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
        await expectNavigationLinks(page, false);
      }

      const fitsViewport = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      );
      expect(fitsViewport, `${route} should not overflow at ${width}px`).toBe(true);
    }
  });
}

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
] as const) {
  test(`homepage mobile navigation remains operable at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const header = page.locator("[data-site-header]");
    const menuButton = header.getByRole("button", { name: "Open mobile menu" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expectNavigationLinks(page, true);
  });
}

test("mobile navigation closes when pathname changes through a persistent header action", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/find-questions");

  const header = page.locator("[data-site-header]");
  const menuButton = header.getByRole("button", { name: "Open mobile menu" });
  const mobileNav = header.getByRole("navigation", { name: "Mobile navigation" });
  const brandLink = header.getByRole("link", { name: "WYRPlay Home", exact: true });

  await menuButton.click();
  await expect(mobileNav).toBeVisible();
  await brandLink.click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-site-header]")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
});

test("auth-enabled header exposes login and signup at every breakpoint boundary", async ({
  page,
}) => {
  await page.goto("/find-questions");
  const header = page.locator("[data-site-header]");

  for (const width of [1024, 1100, 1279]) {
    await page.setViewportSize({ width, height: 900 });

    const menuButton = header.getByRole("button", { name: "Open mobile menu" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const mobileNav = header.getByRole("navigation", { name: "Mobile navigation" });
    await expect(mobileNav.getByRole("link", { name: "Log In", exact: true })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Sign Up", exact: true })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(mobileNav).toHaveCount(0);
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(header.getByRole("link", { name: "Log In", exact: true }).first()).toBeVisible();
  await expect(header.getByRole("link", { name: "Sign Up", exact: true }).first()).toBeVisible();
  await expect(header.getByRole("button", { name: "Open mobile menu" })).toBeHidden();
});
