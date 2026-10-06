import { expect, test } from "@playwright/test";

const legalRoutes = [
  "/privacy",
  "/terms",
  "/acceptable-use",
  "/refund-policy",
  "/account-deletion",
] as const;

for (const route of legalRoutes) {
  test(`${route} is reachable, versioned and noindex`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText(/Effective \d{4}-\d{2}-\d{2}/i)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
}

test("/contact is reachable and noindex", async ({ page }) => {
  const response = await page.goto("/contact");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Contact" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Privacy requests" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Billing, subscriptions, and refunds" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("primary legal routes are linked from the footer", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  for (const route of ["/privacy", "/terms", "/acceptable-use", "/contact"] as const) {
    await expect(footer.locator(`a[href='${route}']`)).toHaveCount(1);
  }
});

test("current production Legal copy does not imply live account or checkout features", async ({
  page,
}) => {
  await page.goto("/privacy");
  await expect(
    page
      .getByText("Public account registration is not currently open in the production service.", {
        exact: false,
      })
      .first(),
  ).toBeVisible();

  await page.goto("/refund-policy");
  await expect(
    page
      .getByText("Public subscription checkout is not currently open in production.", {
        exact: false,
      })
      .first(),
  ).toBeVisible();
  await expect(page.getByText(/monthly or annual|monthly or annually/i)).toHaveCount(0);

  await page.goto("/account-deletion");
  await expect(
    page.getByText(
      "When account functionality is opened, the account deletion procedures described below apply.",
      { exact: false },
    ),
  ).toBeVisible();
});

for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
] as const) {
  test(`Kids landing exposes the privacy link on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto("/would-you-rather-questions-for-kids");
    expect(response?.status()).toBe(200);

    const privacyLink = page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Kids & Families Privacy" });
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute("href", "/privacy#childrens-privacy");
  });
}
