import { expect, test } from "@playwright/test";

const siteCodeUrl =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2804737462866511";
const scriptSelector = `script[src="${siteCodeUrl}"]`;
const excluded = [
  "/questions",
  "/funny-would-you-rather-questions",
  "/hard-would-you-rather-questions",
  "/would-you-rather-questions-for-friends",
  "/would-you-rather-questions-for-couples",
  "/privacy",
  "/play",
  "/print",
  "/find-questions",
  "/does-not-exist",
];

test("/ loads the real AdSense site script under nonce-based strict CSP", async ({ page }) => {
  const violations: string[] = [];
  await page.exposeFunction("recordAdCspViolation", (message: string) => violations.push(message));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      (
        window as unknown as { recordAdCspViolation: (message: string) => void }
      ).recordAdCspViolation(`${event.effectiveDirective}: ${event.blockedURI}`);
    });
  });

  const loaded = page.waitForResponse((response) => response.url() === siteCodeUrl);
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  const csp = response?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).toContain("'unsafe-inline'");
  expect(csp).toContain("'unsafe-eval'");
  expect(csp).toMatch(/script-src[^;]*'nonce-[^']+'/);
  expect(csp).not.toMatch(/googlesyndication|doubleclick|adtrafficquality|fundingchoicesmessages/);

  expect((await loaded).status()).toBe(200);
  await expect(page.locator(scriptSelector)).toHaveCount(1);
  await expect(page.locator(scriptSelector)).toHaveAttribute("async", "");
  await expect(page.locator(scriptSelector)).toHaveAttribute("crossorigin", "anonymous");
  expect(
    await page.locator(scriptSelector).evaluate((script: HTMLScriptElement) => script.nonce),
  ).not.toBe("");

  await page.waitForTimeout(2500);
  expect(violations).toEqual([]);
});

test("/would-you-rather-questions-for-kids loads the real AdSense site script under nonce-based strict CSP", async ({
  page,
}) => {
  const violations: string[] = [];
  await page.exposeFunction("recordAdCspViolationKids", (message: string) =>
    violations.push(message),
  );
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      (
        window as unknown as { recordAdCspViolationKids: (message: string) => void }
      ).recordAdCspViolationKids(`${event.effectiveDirective}: ${event.blockedURI}`);
    });
  });

  const loaded = page.waitForResponse((response) => response.url() === siteCodeUrl);
  const response = await page.goto("/would-you-rather-questions-for-kids");
  expect(response?.status()).toBe(200);

  const csp = response?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).toContain("'unsafe-inline'");
  expect(csp).toContain("'unsafe-eval'");
  expect(csp).toMatch(/script-src[^;]*'nonce-[^']+'/);
  expect(csp).not.toMatch(/googlesyndication|doubleclick|adtrafficquality|fundingchoicesmessages/);

  expect((await loaded).status()).toBe(200);
  await expect(page.locator(scriptSelector)).toHaveCount(1);
  await expect(page.locator(scriptSelector)).toHaveAttribute("async", "");
  await expect(page.locator(scriptSelector)).toHaveAttribute("crossorigin", "anonymous");
  expect(
    await page.locator(scriptSelector).evaluate((script: HTMLScriptElement) => script.nonce),
  ).not.toBe("");

  await page.waitForTimeout(2500);
  expect(violations).toEqual([]);
});

for (const route of excluded) {
  test(`${route} does not actively load the AdSense site script or expand CSP`, async ({
    page,
  }) => {
    const siteCodeRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url() === siteCodeUrl) siteCodeRequests.push(request.url());
    });

    const response = await page.goto(route);
    expect(response?.status()).toBe(route === "/does-not-exist" ? 404 : 200);
    expect(response?.headers()["content-security-policy"]).not.toMatch(
      /strict-dynamic|googlesyndication|doubleclick|adtrafficquality|fundingchoicesmessages/,
    );
    if (route !== "/does-not-exist") await expect(page.locator("main").first()).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(page.locator(scriptSelector)).toHaveCount(0);
    await expect(page.locator("ins.adsbygoogle")).toHaveCount(0);
    expect(siteCodeRequests).toEqual([]);
  });
}

test("navigating from static /questions to Kids performs document navigation with fresh nonce-based CSP and loads AdSense", async ({
  page,
}) => {
  const violations: string[] = [];
  await page.exposeFunction("recordQuestionsToKidsCspViolation", (message: string) =>
    violations.push(message),
  );
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      (
        window as unknown as { recordQuestionsToKidsCspViolation: (message: string) => void }
      ).recordQuestionsToKidsCspViolation(`${event.effectiveDirective}: ${event.blockedURI}`);
    });
  });

  const response = await page.goto("/questions");
  expect(response?.status()).toBe(200);
  await expect(page.locator(scriptSelector)).toHaveCount(0);

  const documentRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document" && request.frame() === page.mainFrame()) {
      documentRequests.push(request.url());
    }
  });

  const [kidsResponse] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/would-you-rather-questions-for-kids") &&
        res.request().resourceType() === "document",
    ),
    page.locator('a[href="/would-you-rather-questions-for-kids"]').first().click(),
  ]);

  await page.waitForURL((url) => url.pathname === "/would-you-rather-questions-for-kids");
  expect(kidsResponse.status()).toBe(200);
  expect(documentRequests.length).toBeGreaterThanOrEqual(1);

  const csp = kidsResponse.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).toContain("'unsafe-inline'");
  expect(csp).toContain("'unsafe-eval'");
  expect(csp).toMatch(/script-src[^;]*'nonce-[^']+'/);
  expect(csp).not.toMatch(/googlesyndication|doubleclick|adtrafficquality|fundingchoicesmessages/);

  await expect(page.locator(scriptSelector)).toHaveCount(1);
  await expect(page.locator(scriptSelector)).toHaveAttribute("async", "");
  await expect(page.locator(scriptSelector)).toHaveAttribute("crossorigin", "anonymous");
  expect(
    await page.locator(scriptSelector).evaluate((script: HTMLScriptElement) => script.nonce),
  ).not.toBe("");

  await page.waitForTimeout(2500);
  expect(violations).toEqual([]);
});

test("other internal navigations remain SPA-based without document reload", async ({ page }) => {
  await page.goto("/questions");

  const documentRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document" && request.frame() === page.mainFrame()) {
      documentRequests.push(request.url());
    }
  });

  await page.locator('a[href="/funny-would-you-rather-questions"]').first().click();
  await page.waitForURL((url) => url.pathname === "/funny-would-you-rather-questions");

  expect(documentRequests).toEqual([]);
});

test("AdSense site code gates ad serving on Advertising consent via pauseAdRequests", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(scriptSelector)).toHaveCount(1);
  // Without consent signal, AdSense ad serving must be paused (fail-closed)
  await expect
    .poll(
      async () =>
        await page.evaluate(
          () =>
            (window as unknown as { adsbygoogle?: { pauseAdRequests?: number } }).adsbygoogle
              ?.pauseAdRequests,
        ),
    )
    .toBe(1);

  // When Advertising consent signal is granted by official CMP
  await page.evaluate(() => {
    window.googlefc = window.googlefc || {};
    window.googlefc.getGoogleConsentModeValues = () => ({
      ad_storage: "GRANTED",
      analytics_storage: "DENIED",
    });
    const queue = (window.googlefc.callbackQueue = window.googlefc.callbackQueue || []);
    for (const item of queue) {
      if (item && typeof item === "object" && "CONSENT_MODE_DATA_READY" in item) {
        (item as { CONSENT_MODE_DATA_READY: () => void }).CONSENT_MODE_DATA_READY();
      }
    }
  });

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { adsbygoogle?: { pauseAdRequests?: number } }).adsbygoogle
            ?.pauseAdRequests,
      ),
    )
    .toBe(0);

  // When Advertising consent is withdrawn
  await page.evaluate(() => {
    window.googlefc!.getGoogleConsentModeValues = () => ({
      ad_storage: "DENIED",
      analytics_storage: "DENIED",
    });
    const queue = window.googlefc!.callbackQueue as Array<{
      CONSENT_MODE_DATA_READY?: () => void;
    }>;
    for (const item of queue) {
      item?.CONSENT_MODE_DATA_READY?.();
    }
  });

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { adsbygoogle?: { pauseAdRequests?: number } }).adsbygoogle
            ?.pauseAdRequests,
      ),
    )
    .toBe(1);
});

test("Kids page AdSense site code gates ad serving on Advertising consent via pauseAdRequests", async ({
  page,
}) => {
  await page.goto("/would-you-rather-questions-for-kids");
  await expect(page.locator(scriptSelector)).toHaveCount(1);
  await expect
    .poll(
      async () =>
        await page.evaluate(
          () =>
            (window as unknown as { adsbygoogle?: { pauseAdRequests?: number } }).adsbygoogle
              ?.pauseAdRequests,
        ),
    )
    .toBe(1);

  await page.evaluate(() => {
    window.googlefc = window.googlefc || {};
    window.googlefc.getGoogleConsentModeValues = () => ({
      ad_storage: "GRANTED",
      analytics_storage: "DENIED",
    });
    const queue = (window.googlefc.callbackQueue = window.googlefc.callbackQueue || []);
    for (const item of queue) {
      if (item && typeof item === "object" && "CONSENT_MODE_DATA_READY" in item) {
        (item as { CONSENT_MODE_DATA_READY: () => void }).CONSENT_MODE_DATA_READY();
      }
    }
  });

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { adsbygoogle?: { pauseAdRequests?: number } }).adsbygoogle
            ?.pauseAdRequests,
      ),
    )
    .toBe(0);
});
