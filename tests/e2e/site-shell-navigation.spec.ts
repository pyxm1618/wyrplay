import { expect, test } from "@playwright/test";

const shellRoutes = [
  "/",
  "/find-questions",
  "/print",
  "/leaderboards",
  "/play",
  "/questions",
  "/would-you-rather-questions-for-kids",
  "/funny-would-you-rather-questions",
  "/privacy",
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("creat-web:analytics-consent:v1", "denied");
    } catch {
      // ignore storage restrictions in unusual browser contexts
    }
  });
});

test("normal public routes share one site header and footer", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const route of shellRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);

    await expect(page.locator("[data-site-header]"), route).toHaveCount(1);
    await expect(page.locator("[data-site-footer]"), route).toHaveCount(1);

    const primary = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(primary.getByRole("link", { name: "Home", exact: true })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(
      primary.getByRole("link", { name: "Find Questions", exact: true }),
    ).toHaveAttribute("href", "/find-questions");
    await expect(primary.getByRole("link", { name: "Print", exact: true })).toHaveAttribute(
      "href",
      "/print",
    );
    await expect(
      primary.getByRole("link", { name: "Leaderboards", exact: true }),
    ).toHaveAttribute("href", "/leaderboards");
    await expect(primary.getByRole("link", { name: "Categories", exact: true })).toHaveCount(0);
    await expect(primary.getByRole("link", { name: "Create", exact: true })).toHaveCount(0);

    await expect(
      page.locator("[data-site-header]").getByRole("link", { name: "Play Now", exact: true }),
    ).toHaveAttribute("href", "/play");
  }
});

test("mobile header uses the same primary navigation config", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/find-questions");

  await page.getByRole("button", { name: "Open mobile menu" }).click();
  const mobile = page.getByRole("navigation", { name: "Mobile navigation" });

  for (const name of ["Home", "Find Questions", "Print", "Leaderboards", "Play Now"] as const) {
    await expect(mobile.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(mobile.getByRole("link", { name: "Categories", exact: true })).toHaveCount(0);
  await expect(mobile.getByRole("link", { name: "Create", exact: true })).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(mobile).toHaveCount(0);
});

test("footer exposes only real category, support and legal destinations", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("[data-site-footer]");

  for (const href of [
    "/find-questions",
    "/print",
    "/leaderboards",
    "/would-you-rather-questions-for-kids",
    "/funny-would-you-rather-questions",
    "/hard-would-you-rather-questions",
    "/would-you-rather-questions-for-friends",
    "/would-you-rather-questions-for-couples",
    "/questions",
    "/contact",
    "/privacy#childrens-privacy",
    "/privacy",
    "/terms",
    "/acceptable-use",
    "/refund-policy",
    "/account-deletion",
  ] as const) {
    await expect(footer.locator(`a[href="${href}"]`), href).toHaveCount(1);
  }
});

test("presenter mode hides site chrome and restores it on exit", async ({ page }) => {
  await page.goto("/play");
  await expect(page.locator("[data-site-header]")).toBeVisible();

  await page.getByRole("button", { name: "Present", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("[data-site-header]")).not.toBeVisible();
  await expect(page.locator("[data-site-footer]")).not.toBeVisible();

  await page.getByRole("button", { name: "Exit Presenter", exact: true }).click();
  await expect(page.locator("[data-site-header]")).toBeVisible();
});

test("direct print entry remains a complete printable workflow", async ({ page }) => {
  await page.goto("/print");
  await expect(page.locator(".print-preview")).toContainText("457 questions");
  await expect(page.getByLabel("Number of questions")).toBeEnabled();
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeEnabled();

  await page.emulateMedia({ media: "print" });
  await expect(page.locator("[data-site-header]")).not.toBeVisible();
  await expect(page.locator("[data-site-footer]")).not.toBeVisible();
  await expect(page.locator(".print-document .print-page-sheet:visible").first()).toBeVisible();
});
