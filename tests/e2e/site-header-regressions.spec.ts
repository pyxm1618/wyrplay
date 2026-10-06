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
  await header.getByRole("button", { name: "Open mobile menu" }).click();
  await expect(header.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();

  await header.getByRole("link", { name: "WYRPlay Home", exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(header.getByRole("navigation", { name: "Mobile navigation" })).toHaveCount(0);
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
    await expect(
      mobileNav.getByRole("link", { name: "Log In", exact: true }),
    ).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "Sign Up", exact: true }),
    ).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
    true,
  );

    await page.keyboard.press("Escape");
    await expect(mobileNav).toHaveCount(0);
  }

  await page.setViewportSize({ width: 1280, height: 900 });

  await expect(
    header.getByRole("link", { name: "Log In", exact: true }).first(),
  ).toBeVisible();
  await expect(
    header.getByRole("link", { name: "Sign Up", exact: true }).first(),
  ).toBeVisible();
  await expect(header.getByRole("button", { name: "Open mobile menu" })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
});
