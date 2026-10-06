import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("creat-web:analytics-consent:v1", "denied");
    } catch {
      // ignore storage restrictions in unusual browser contexts
    }
  });
});

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
  await expect(mobileNav).toHaveCount(0);
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
    const logInLink = mobileNav.getByRole("link", { name: "Log In", exact: true });
    const signUpLink = mobileNav.getByRole("link", { name: "Sign Up", exact: true });
    await expect(logInLink).toBeVisible();
    await expect(signUpLink).toBeVisible();

    const fitsViewport = await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    );
    expect(fitsViewport).toBe(true);

    await page.keyboard.press("Escape");
    await expect(mobileNav).toHaveCount(0);
  }

  await page.setViewportSize({ width: 1280, height: 900 });

  const desktopLogIn = header.getByRole("link", { name: "Log In", exact: true }).first();
  const desktopSignUp = header.getByRole("link", { name: "Sign Up", exact: true }).first();
  const menuButton = header.getByRole("button", { name: "Open mobile menu" });
  await expect(desktopLogIn).toBeVisible();
  await expect(desktopSignUp).toBeVisible();
  await expect(menuButton).toBeHidden();

  const fitsViewport = await page.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  );
  expect(fitsViewport).toBe(true);
});
