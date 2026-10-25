import { expect, test } from "@playwright/test";

test("resolved denial clears host and parent-domain analytics cookies only", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "_ga", value: "host-cookie", domain: "www.example.test", path: "/" },
    { name: "_ga_PARENT", value: "parent-cookie", domain: ".example.test", path: "/" },
    { name: "_clck", value: "parent-clarity", domain: ".example.test", path: "/" },
    { name: "site-preference", value: "keep", domain: ".example.test", path: "/" },
  ]);
  await page.route("http://www.example.test:3000/**", async (route) => {
    if (route.request().headers()["next-router-prefetch"]) return route.abort();
    const url = new URL(route.request().url());
    url.hostname = "127.0.0.1";
    await route.fulfill({ response: await route.fetch({ url: url.href }) });
  });
  await page.goto("http://www.example.test:3000/questions");
  await expect(page.locator("main")).toBeVisible();
  expect((await context.cookies()).filter((cookie) => cookie.name.startsWith("_"))).toHaveLength(3);
  await expect
    .poll(() => page.evaluate(() => Boolean(window.googlefc?.callbackQueue?.length)))
    .toBe(true);
  await page.evaluate(() => {
    window.googlefc = window.googlefc || {};
    window.googlefc.getGoogleConsentModeValues = () => ({
      analyticsStoragePurposeConsentStatus: 2,
      adStoragePurposeConsentStatus: 2,
      adUserDataPurposeConsentStatus: 2,
      adPersonalizationPurposeConsentStatus: 2,
    });
    const queue = window.googlefc.callbackQueue as Array<{
      CONSENT_MODE_DATA_READY?: () => void;
    }>;
    for (const item of queue) item?.CONSENT_MODE_DATA_READY?.();
  });
  await expect
    .poll(async () => (await context.cookies()).filter((cookie) => cookie.name.startsWith("_")))
    .toEqual([]);
  expect((await context.cookies()).find((cookie) => cookie.name === "site-preference")?.value).toBe(
    "keep",
  );
  await page.unrouteAll({ behavior: "wait" });
  await expect(page.locator("#creat-web-ga4, #creat-web-clarity")).toHaveCount(0);
});
