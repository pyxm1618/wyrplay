import { expect, test } from "@playwright/test";
import { openAccount } from "./account-test-helper";

const routes = [
  "/account",
  "/account?view=saved",
  "/account?view=my",
  "/account?view=activity",
  "/account/settings",
  "/account/security",
  "/account/billing",
  "/account/credits",
  "/checkout/return",
  "/account/deleted",
];

test("all account surfaces share light chrome, load at ten viewports and produce clean browser evidence", async ({
  browser,
  request,
  baseURL,
}, testInfo) => {
  test.setTimeout(240_000);
  const { context, page } = await openAccount(browser, request, baseURL!);
  const fonts = await page.evaluate(async () => {
    const faces = await Promise.all(
      [
        "400 16px AccountBody",
        "700 16px AccountBody",
        "400 16px AccountChewy",
        "700 16px AccountCondensed",
      ].map((font) => document.fonts.load(font)),
    );
    return faces.map((face) => face.length > 0 && face.every((font) => font.status === "loaded"));
  });
  expect(fonts).toEqual([true, true, true, true]);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  try {
    // A real local import exercises saved grids rather than just empty states.
    await page.evaluate(() =>
      localStorage.setItem(
        "wyrplay:saved-questions:v1",
        JSON.stringify(
          Array.from({ length: 12 }, (_, i) => `wyr-${String(i + 1).padStart(6, "0")}`),
        ),
      ),
    );
    for (const width of [320, 360, 375, 390, 768, 1024, 1120, 1200, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        const response = await page.goto(route);
        expect(response?.status(), `${route} ${width}`).toBe(200);
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
          `${route} ${width}`,
        ).toBe(true);
        expect(
          await page
            .locator(".account-overview")
            .evaluate((el) => getComputedStyle(el).backgroundColor),
        ).toBe("rgb(255, 252, 246)");
        if (width <= 390) {
          for (const field of await page
            .locator('input:visible:not([type="checkbox"]), textarea:visible, select:visible')
            .all()) {
            await field.focus();
            expect(
              await field.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
              `${route} input font`,
            ).toBeGreaterThanOrEqual(16);
          }
        }
        if ([375, 390, 768, 1024, 1200, 1440].includes(width) && !route.includes("?"))
          await page.screenshot({
            path: testInfo.outputPath(`${route.replaceAll("/", "-")}-${width}.png`),
            fullPage: true,
          });
      }
    }
    await page.goto("/account");
    const contrasts = await page
      .locator(".account-tag, .account-tags span")
      .evaluateAll((labels) => {
        function luminance(color: string) {
          const channels = color
            .match(/\d+(?:\.\d+)?/g)!
            .slice(0, 3)
            .map((channel) => {
              const value = Number(channel) / 255;
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            });
          return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
        }
        return labels.map((label) => {
          const style = getComputedStyle(label);
          const foreground = luminance(style.color);
          const background = luminance(style.backgroundColor);
          return (
            (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
          );
        });
      });
    expect(contrasts.length).toBeGreaterThan(0);
    for (const contrast of contrasts) expect(contrast).toBeGreaterThanOrEqual(4.5);
    await testInfo.attach("label-contrast", {
      body: JSON.stringify(contrasts),
      contentType: "application/json",
    });
    const menu = page.locator("details.account-menu");
    await page.getByLabel("Account menu", { exact: true }).click();
    await expect(menu).toHaveAttribute("open", "");
    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveAttribute("open");
    await page.getByLabel("Account menu", { exact: true }).click();
    await page.locator("h1").click();
    await expect(menu).not.toHaveAttribute("open");
    await page.getByLabel("Account menu", { exact: true }).click();
    await menu.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(page).toHaveURL(/account\/settings/);
    await expect(menu).not.toHaveAttribute("open");
    await page.goto("/account/security");
    await expect(page.getByRole("heading", { name: "Active sessions" })).toBeVisible();
    await expect(page.locator('form[action="/api/account/delete"]')).toHaveCount(0);
    await page.goto("/account/deleted");
    await expect(page.getByRole("link", { name: "Return to the homepage" })).toBeVisible();
    await expect(page.getByLabel("Account menu")).toHaveCount(0);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test("account favorites survive a second device, removal, logout and failed import", async ({
  browser,
  request,
  baseURL,
}) => {
  test.setTimeout(60_000);
  const { context, page } = await openAccount(browser, request, baseURL!);
  const second = await browser.newContext({
    baseURL: baseURL!,
    storageState: await context.storageState(),
  });
  // storageState includes cookies; explicitly keep this device free of local storage.
  const device = await second.newPage();
  try {
    await page.evaluate(() =>
      localStorage.setItem(
        "wyrplay:saved-questions:v1",
        '["wyr-000001","future-unavailable-id","wyr-000001"]',
      ),
    );
    await page.reload();
    await expect(page.locator(".account-saved-card")).toHaveCount(1);
    expect(await page.evaluate(() => localStorage.getItem("wyrplay:saved-questions:v1"))).toBe(
      "[]",
    );
    await device.goto("/account?view=saved");
    await expect(device.locator(".library-row")).toHaveCount(1);
    await device.goto("/play?set=wyr-000002");
    await device.getByRole("button", { name: "Decline", exact: true }).click();
    await device.getByRole("button", { name: "Save", exact: true }).click();
    await expect(device.getByRole("button", { name: "Saved", exact: true })).toBeVisible();
    await page.reload();
    await expect(page.locator(".account-saved-card")).toHaveCount(2);
    const remove = await second.request.post("/api/account/saved-questions", {
      headers: { origin: baseURL! },
      data: { action: "remove", id: "wyr-000001" },
    });
    expect(remove.status()).toBe(200);
    await page.reload();
    await expect(page.locator(".account-saved-card")).toHaveCount(1);
    expect(
      (await (await context.request.get("/api/account/saved-questions")).json()).ids,
    ).toContain("future-unavailable-id");
    await page.evaluate(() => localStorage.setItem("wyrplay:saved-questions:v1", '["wyr-000003"]'));
    await page.route("**/api/account/saved-questions", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({ status: 503, body: '{"error":"test import unavailable"}' })
        : route.continue(),
    );
    await page.reload();
    await expect(page.locator(".account-notice")).toContainText("stored data has not been changed");
    expect(await page.evaluate(() => localStorage.getItem("wyrplay:saved-questions:v1"))).toBe(
      '["wyr-000003"]',
    );
    await page.unroute("**/api/account/saved-questions");
    await page.goto("/account/settings");
    await page.getByRole("button", { name: "Sign Out", exact: true }).click();
    await expect(page).toHaveURL(/sign-in/);
    expect((await context.request.get("/api/account/saved-questions")).status()).toBe(401);
    const other = await openAccount(browser, request, baseURL!);
    try {
      expect(
        (await (await other.context.request.get("/api/account/saved-questions")).json()).ids,
      ).toEqual([]);
    } finally {
      await other.context.close();
    }
  } finally {
    await second.close();
    await context.close();
  }
});

test("display name is saved, mutations reject foreign origin and forged checkout success remains untrusted", async ({
  browser,
  request,
  baseURL,
}) => {
  const { context, page } = await openAccount(browser, request, baseURL!);
  try {
    await page.goto("/account/settings");
    await page.getByRole("textbox", { name: "Display Name", exact: true }).fill("Curious Explorer");
    await page.getByRole("button", { name: "Save Changes", exact: true }).click();
    await expect(page.getByRole("status")).toHaveText("Display name saved.");
    await page.goto("/account");
    await expect(page.locator("h1")).toHaveText("Curious Explorer");
    expect(
      (
        await context.request.post("/api/account/saved-questions", {
          headers: { origin: "https://other.example" },
          data: { action: "save", id: "wyr-000001" },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await context.request.post("/api/account/saved-questions", {
          headers: { origin: baseURL! },
          data: { action: "replace", ids: [] },
        })
      ).status(),
    ).toBe(400);
    await page.goto("/checkout/return?order=abc&status=success");
    await expect(
      page.getByText("The requested order was not found for this account."),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test("anonymous guards and guest favorites keep their independent storage", async ({ page }) => {
  for (const route of routes.filter((route) => route !== "/account/deleted")) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/sign-in$/);
  }
  await page.goto("/account/deleted");
  await expect(page.getByRole("heading", { name: "Account deletion submitted" })).toBeVisible();
  await page.goto("/play?set=wyr-000001");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("button", { name: "Saved", exact: true })).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("wyrplay:saved-questions:v1") ?? "null"),
    ),
  ).toEqual(["wyr-000001"]);
});
