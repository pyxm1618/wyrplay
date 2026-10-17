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

test("official Google Privacy & messaging CMP signal enables GA4 and Clarity", async ({ page }) => {
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

  // Simulate official Google Privacy & messaging CMP: CONSENT_MODE_DATA_READY + getGoogleConsentModeValues()
  await page.evaluate(() => {
    window.googlefc = window.googlefc || {};
    window.googlefc.ConsentModePurposeStatusEnum = {
      UNKNOWN: 0,
      GRANTED: 1,
      DENIED: 2,
      NOT_APPLICABLE: 3,
      NOT_CONFIGURED: 4,
    };
    window.googlefc.getGoogleConsentModeValues = () => ({
      analyticsStoragePurposeConsentStatus: 1,
      adStoragePurposeConsentStatus: 1,
      adUserDataPurposeConsentStatus: 1,
      adPersonalizationPurposeConsentStatus: 1,
    });
    const queue = (window.googlefc.callbackQueue = window.googlefc.callbackQueue || []);
    for (const item of queue) {
      if (item && typeof item === "object" && "CONSENT_MODE_DATA_READY" in item) {
        (item as { CONSENT_MODE_DATA_READY: () => void }).CONSENT_MODE_DATA_READY();
      }
    }
  });

  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(1);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(1);
});

test("granted analytics can be withdrawn via CMP and ceases tracking while cleaning up injected scripts", async ({
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
    window.googlefc = window.googlefc || {};
    window.googlefc.ConsentModePurposeStatusEnum = {
      UNKNOWN: 0,
      GRANTED: 1,
      DENIED: 2,
      NOT_APPLICABLE: 3,
      NOT_CONFIGURED: 4,
    };
    window.googlefc.getGoogleConsentModeValues = () => ({
      analyticsStoragePurposeConsentStatus: 1,
      adStoragePurposeConsentStatus: 1,
      adUserDataPurposeConsentStatus: 1,
      adPersonalizationPurposeConsentStatus: 1,
    });
    const queue = (window.googlefc.callbackQueue = window.googlefc.callbackQueue || []);
    for (const item of queue) {
      if (item && typeof item === "object" && "CONSENT_MODE_DATA_READY" in item) {
        (item as { CONSENT_MODE_DATA_READY: () => void }).CONSENT_MODE_DATA_READY();
      }
    }
  });

  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(1);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(1);

  // Withdraw analytics consent via official Google CMP signal
  await page.evaluate(() => {
    window.googlefc!.getGoogleConsentModeValues = () => ({
      analyticsStoragePurposeConsentStatus: 2,
      adStoragePurposeConsentStatus: 2,
      adUserDataPurposeConsentStatus: 2,
      adPersonalizationPurposeConsentStatus: 2,
    });
    const queue = window.googlefc!.callbackQueue as Array<{
      CONSENT_MODE_DATA_READY?: () => void;
    }>;
    for (const item of queue) {
      item?.CONSENT_MODE_DATA_READY?.();
    }
  });

  await expect(page.locator("#creat-web-ga4")).toHaveCount(0);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(0);

  requests.length = 0;
  await page.reload();
  await page.waitForTimeout(400);
  expect(requests).toEqual([]);
});

test("sensitive sign-in surface does not load analytics even if CMP granted consent", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (isAnalytics(request.url())) requests.push(request.url());
  });

  await page.addInitScript(() => {
    window.googlefc = {
      ConsentModePurposeStatusEnum: {
        UNKNOWN: 0,
        GRANTED: 1,
        DENIED: 2,
        NOT_APPLICABLE: 3,
        NOT_CONFIGURED: 4,
      },
      getGoogleConsentModeValues: () => ({
        analyticsStoragePurposeConsentStatus: 1,
        adStoragePurposeConsentStatus: 1,
        adUserDataPurposeConsentStatus: 1,
        adPersonalizationPurposeConsentStatus: 1,
      }),
      callbackQueue: [],
    };
  });

  await page.goto("/sign-in");
  await page.waitForTimeout(400);
  expect(requests).toEqual([]);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(0);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(0);
});

test("footer includes Privacy & cookie settings that triggers CMP revocation mechanism via callbackQueue", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.googlefc = {
      showRevocationMessage: () => {},
      callbackQueue: [],
    };
  });

  await page.goto("/");
  const footerButton = page.getByRole("button", { name: "Privacy & cookie settings" });
  await expect(footerButton).toBeVisible();

  await footerButton.click();
  const hasRevocation = await page.evaluate(() => {
    const queue = window.googlefc?.callbackQueue as unknown[];
    return queue?.includes(window.googlefc?.showRevocationMessage);
  });
  expect(hasRevocation).toBe(true);
});

test("footer settings on non-ad page navigates to CMP host route without expanding CSP", async ({
  page,
}) => {
  await page.goto("/questions");
  const footerButton = page.getByRole("button", { name: "Privacy & cookie settings" });
  await expect(footerButton).toBeVisible();

  await footerButton.click();
  await page.waitForURL((url) => url.pathname === "/");
  expect(page.url()).toContain("http://127.0.0.1:3000/");
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
