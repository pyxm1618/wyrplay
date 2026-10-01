import { expect, test, type Browser, type APIRequestContext } from "@playwright/test";

async function openAccount(browser: Browser, request: APIRequestContext, baseURL: string) {
  const email = `account-ui-${crypto.randomUUID()}@example.test`;
  const sent = await request.post("/api/auth/magic-link/request", {
    headers: { origin: baseURL, "x-real-ip": "203.0.113.222" },
    data: { email, returnTo: "/account", turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" },
  });
  expect(sent.status()).toBe(202);
  const mailbox = await request.get(`/api/test/emails/latest?to=${encodeURIComponent(email)}`);
  expect(mailbox.status()).toBe(200);
  const message = (await mailbox.json()) as { html: string };
  const confirmation = message.html.match(/href="([^"]+)"/)?.[1];
  if (!confirmation) throw new Error("Missing account test sign-in confirmation");
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(confirmation.replaceAll("&amp;", "&"));
  await page.getByRole("button", { name: "Confirm sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  return { context, page, email };
}

test("account keeps its login guard and uses authenticated identity", async ({
  page,
  browser,
  request,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Account test base URL is required");
  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in$/);
  const signedIn = await openAccount(browser, request, baseURL);
  try {
    await expect(signedIn.page.locator("h1")).not.toBeEmpty();
    await expect(signedIn.page.locator(".account-identity")).toContainText(signedIn.email);
    await expect(
      signedIn.page.getByRole("button", { name: "Edit Profile", exact: true }),
    ).toBeDisabled();
    await signedIn.page.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(signedIn.page).toHaveURL(/\/account\/settings$/);
    await signedIn.page.getByRole("link", { name: "Manage Sessions →", exact: true }).click();
    await expect(
      signedIn.page.getByRole("heading", { name: "Active sessions", exact: true }),
    ).toBeVisible();
  } finally {
    await signedIn.context.close();
  }
});

test("account reads finder favorites and removes only the selected stored ID", async ({
  browser,
  request,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Account test base URL is required");
  const { context, page } = await openAccount(browser, request, baseURL);
  try {
    await page.evaluate(() =>
      localStorage.setItem(
        "wyrplay:saved-questions:v1",
        JSON.stringify(["wyr-000001", "wyr-000002", "future-unavailable-id"]),
      ),
    );
    await page.reload();
    await expect(page.locator(".account-saved-card")).toHaveCount(2);
    await page.locator(".account-saved-card").first().locator("summary").click();
    await page.getByRole("button", { name: "Remove from saved", exact: true }).click();
    await expect(page.locator(".account-saved-card")).toHaveCount(1);
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("wyrplay:saved-questions:v1") ?? "null"),
      ),
    ).toEqual(["wyr-000002", "future-unavailable-id"]);
    await page.locator(".account-question-title").click();
    await expect(page.getByRole("dialog", { name: "Play a saved question" })).toBeVisible();
    await page.getByRole("button", { name: "Close voting", exact: true }).click();
  } finally {
    await context.close();
  }
});

test("account does not turn corrupted favorites into a successful empty collection", async ({
  browser,
  request,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Account test base URL is required");
  const { context, page } = await openAccount(browser, request, baseURL);
  try {
    await page.evaluate(() => localStorage.setItem("wyrplay:saved-questions:v1", "not-json"));
    await page.reload();
    await expect(page.locator(".account-notice")).toContainText("stored data has not been changed");
    await expect(page.locator(".account-saved")).toContainText("Saved questions unavailable");
    expect(await page.evaluate(() => localStorage.getItem("wyrplay:saved-questions:v1"))).toBe(
      "not-json",
    );
  } finally {
    await context.close();
  }
});


test("authenticated account route family stays responsive and preserves viewport evidence", async ({ browser, request, baseURL }, testInfo) => {
  if (!baseURL) throw new Error("Account test base URL is required");
  const { context, page } = await openAccount(browser, request, baseURL);
  try {
    for (const [width, height] of [
      [1440, 900],
      [1920, 1080],
      [390, 844],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto("/account");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`account-${width}x${height}.png`),
        fullPage: false,
        animations: "disabled",
      });
    }

    for (const route of [
      "/account",
      "/account/settings",
      "/account/security",
      "/account/billing",
      "/account/credits",
      "/account/deleted",
      "/checkout/return",
    ]) {
      await page.setViewportSize({ width: 1024, height: 768 });
      const response = await page.goto(route);
      expect(response?.status(), route).toBeLessThan(500);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        route,
      ).toBe(true);
    }
  } finally {
    await context.close();
  }
});
