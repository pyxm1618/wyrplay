import { expect, test, type Page } from "@playwright/test";

async function installTurnstile(page: Page) {
  await page.addInitScript(() => {
    window.turnstile = {
      ready(callback) {
        callback();
      },
      render(_container, options) {
        queueMicrotask(() => options.callback("XXXX.DUMMY.TOKEN.XXXX"));
        return "auth-ui-test";
      },
      reset() {},
      remove() {},
    };
  });
}

for (const [route, heading, card] of [
  ["/sign-in", "Sign In", [198, 658, 654, 730]],
  ["/sign-up", "Create Your Account", [177, 649, 677, 737]],
] as const) {
  test(`${route} preserves the approved layout and secure form on narrow screens`, async ({
    page,
  }) => {
    await installTurnstile(page);
    await page.setViewportSize({ width: 1024, height: 900 });
    const response = await page.goto(route);
    expect(response?.headers()["cache-control"]).toContain("no-store");
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode()));
    });
    const bounds = await page.locator(".auth-card").boundingBox();
    if (!bounds) throw new Error("Auth card is not rendered");
    const actual = [bounds.x, bounds.y, bounds.width, bounds.height];
    for (const [index, expected] of card.entries()) {
      expect(Math.abs(actual[index]! - expected)).toBeLessThan(1);
    }
    await page.getByRole("button", { name: "Continue with Magic Link" }).click();
    await expect(page.getByLabel("Email address")).toBeFocused();
    await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeEnabled();
    for (const width of [390, 700, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      await expect(page.getByLabel("Email address")).toBeVisible();
      await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeVisible();
    }
  });
}

for (const [status, expected] of [
  [429, "Too many sign-in requests"],
  [403, "Human verification expired"],
  [503, "Human verification expired"],
  [500, "The sign-in request could not be completed"],
] as const) {
  test(`Magic Link displays the existing ${status} response state without claiming success`, async ({
    page,
  }) => {
    await installTurnstile(page);
    await page.route("**/api/auth/magic-link/request", (route) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({ error: "test_failure" }),
      }),
    );
    await page.goto("/sign-up");
    await page.getByRole("button", { name: "Continue with Magic Link" }).click();
    await page.getByLabel("Email address").fill("auth-ui-error@example.com");
    await page.getByRole("button", { name: "Send secure sign-in link" }).click();
    await expect(page.locator("#sign-in-status")).toContainText(expected);
    await expect(page.locator("#sign-in-status")).not.toContainText("has been sent");
    await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeDisabled();
  });
}

test("registration uses the existing real Magic Link request and confirmation flow", async ({
  page,
  request,
}) => {
  await installTurnstile(page);
  const email = `auth-ui-registration-${Date.now()}@example.com`;
  await page.goto("/sign-up");
  await page.getByRole("button", { name: "Continue with Magic Link" }).click();
  await page.getByLabel("Email address").fill(email);
  const sent = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/magic-link/request") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send secure sign-in link" }).click();
  expect((await sent).status()).toBe(202);
  await expect(page.locator("#sign-in-status")).toContainText("a sign-in link has been sent");
  const mailbox = await request.get(`/api/test/emails/latest?to=${encodeURIComponent(email)}`);
  expect(mailbox.ok()).toBe(true);
  const { html } = (await mailbox.json()) as { html: string };
  const href = html.match(/href="([^"]+)"/)?.[1];
  if (!href) throw new Error("Registration confirmation link missing from test mailbox");
  await page.goto(href.replaceAll("&amp;", "&"));
  await page.getByRole("button", { name: "Confirm sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
});

test("registration and sign-in links use real routes; provider callback failures are visible", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.locator(".signup-prompt a").click();
  await expect(page).toHaveURL(/\/sign-up$/);
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/sign-in?error=google");
  await expect(page.locator(".auth-page").getByRole("alert")).toContainText(
    "Google sign-in could not be completed",
  );
});
