import { expect, test } from "@playwright/test";

const analyticsHosts = [
  "www.googletagmanager.com",
  "www.google-analytics.com",
  "region1.google-analytics.com",
  "www.clarity.ms",
];

function isAnalytics(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return analyticsHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

test("analytics makes zero third-party requests before consent (fail-closed) and has no floating settings", async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (isAnalytics(url)) {
      requests.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  await page.goto("/");
  await page.waitForTimeout(500);

  // Strict fail-closed: zero requests without consent
  expect(requests).toEqual([]);

  // Floating Privacy settings must be completely removed
  await expect(page.getByRole("button", { name: "Analytics settings" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Privacy settings" })).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "Analytics consent" })).toHaveCount(0);
});

test("CMP official Consent Mode signal enables GA4 and Clarity", async ({ page }) => {
  const requests: string[] = [];
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (isAnalytics(url)) {
      requests.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  await page.goto("/");
  await page.waitForTimeout(300);
  expect(requests).toEqual([]);

  // Simulate official Google Privacy & messaging / Consent Mode update signal
  await page.evaluate(() => {
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
  });

  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(1);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(1);
});

test("granted analytics can be withdrawn and ceases tracking while cleaning up injected scripts", async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (isAnalytics(url)) {
      requests.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  await page.goto("/");
  await page.evaluate(() => {
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
  });

  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(1);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(1);

  // Withdraw analytics consent via CMP signal
  await page.evaluate(() => {
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
  });

  await expect(page.locator("#creat-web-ga4")).toHaveCount(0);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(0);

  requests.length = 0;
  await page.reload();
  await page.waitForTimeout(400);
  expect(requests).toEqual([]);
});

test("sensitive sign-in surface does not load analytics even if consent signal was provided", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (isAnalytics(request.url())) requests.push(request.url());
  });

  await page.addInitScript(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(["consent", "update", { analytics_storage: "granted" }]);
  });

  await page.goto("/sign-in");
  await page.waitForTimeout(400);
  expect(requests).toEqual([]);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(0);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(0);
});

test("footer includes Privacy & cookie settings that triggers CMP revocation mechanism", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as { __revocationCalled?: boolean }).__revocationCalled = false;
    window.googlefc = window.googlefc || {};
    window.googlefc.showRevocationMessage = () => {
      (window as unknown as { __revocationCalled: boolean }).__revocationCalled = true;
    };
  });

  await page.goto("/");
  const footerButton = page.getByRole("button", { name: "Privacy & cookie settings" });
  await expect(footerButton).toBeVisible();

  await footerButton.click();
  const called = await page.evaluate(
    () => (window as unknown as { __revocationCalled?: boolean }).__revocationCalled,
  );
  expect(called).toBe(true);
});

test("legacy consent key in localStorage is safely cleaned and does not authorize analytics", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("creat-web:analytics-consent:v1", "granted");
  });

  const requests: string[] = [];
  page.on("request", (request) => {
    if (isAnalytics(request.url())) requests.push(request.url());
  });

  await page.goto("/");
  await page.waitForTimeout(400);

  // Legacy key must not authorize GA4 or Clarity
  expect(requests).toEqual([]);
  expect(
    await page.evaluate(() => localStorage.getItem("creat-web:analytics-consent:v1")),
  ).toBeNull();
});
