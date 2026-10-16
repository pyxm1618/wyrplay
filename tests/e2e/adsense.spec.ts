import { expect, test } from "@playwright/test";

const scriptSelector =
  'script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2804737462866511"]';
const adRequest =
  /https:\/\/[^/]*(?:googlesyndication\.com|doubleclick\.net|adtrafficquality\.google|fundingchoicesmessages\.google\.com|www\.google\.com)\//;
const enabled = [
  "/",
  "/questions",
  "/funny-would-you-rather-questions",
  "/hard-would-you-rather-questions",
  "/would-you-rather-questions-for-friends",
  "/would-you-rather-questions-for-couples",
];

for (const route of enabled) {
  test(`${route} loads exactly one real AdSense site script without CSP violations`, async ({
    page,
  }) => {
    const violations: string[] = [];
    await page.exposeFunction("recordAdCspViolation", (message: string) =>
      violations.push(message),
    );
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (event) => {
        (
          window as unknown as { recordAdCspViolation: (message: string) => void }
        ).recordAdCspViolation(`${event.effectiveDirective}: ${event.blockedURI}`);
      });
    });
    const loaded = page.waitForResponse((response) =>
      response.url().includes("/pagead/js/adsbygoogle.js?client="),
    );
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    expect(response?.headers()["content-security-policy"]).toContain(
      "https://pagead2.googlesyndication.com",
    );
    expect((await loaded).status()).toBe(200);
    await expect(page.locator(scriptSelector)).toHaveCount(1);
    await expect(page.locator(scriptSelector)).toHaveAttribute("async", "");
    await expect(page.locator(scriptSelector)).toHaveAttribute("crossorigin", "anonymous");
    if (route === "/") {
      expect(
        await page.locator(scriptSelector).evaluate((script: HTMLScriptElement) => script.nonce),
      ).not.toBe("");
    }
    await page.waitForTimeout(2500);
    expect(violations).toEqual([]);
  });
}

for (const route of [
  "/would-you-rather-questions-for-kids",
  "/privacy",
  "/play",
  "/print",
  "/find-questions",
  "/does-not-exist",
]) {
  test(`${route} has no AdSense script, elements, requests or CSP expansion`, async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => {
      if (adRequest.test(request.url())) requests.push(request.url());
    });
    const response = await page.goto(route);
    expect(response?.status()).toBe(route === "/does-not-exist" ? 404 : 200);
    expect(response?.headers()["content-security-policy"]).not.toMatch(
      /strict-dynamic|googlesyndication|doubleclick|adtrafficquality|fundingchoicesmessages/,
    );
    if (route !== "/does-not-exist") await expect(page.locator("main").first()).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.locator(scriptSelector)).toHaveCount(0);
    await expect(
      page.locator("ins.adsbygoogle, iframe[src*='doubleclick'], iframe[src*='googlesyndication']"),
    ).toHaveCount(0);
    expect(requests).toEqual([]);
  });
}

test("client links and history isolate Kids and privacy from an already running ad document", async ({
  page,
}) => {
  const excludedRequests: string[] = [];
  page.on("request", (request) => {
    if (
      adRequest.test(request.url()) &&
      /\/(?:privacy|would-you-rather-questions-for-kids)(?:[?#]|$)/.test(page.url())
    ) {
      excludedRequests.push(request.url());
    }
  });
  await page.goto("/");
  await expect(page.locator(scriptSelector)).toHaveCount(1);
  for (const route of ["/would-you-rather-questions-for-kids", "/privacy", "/questions"]) {
    if (route === "/privacy") {
      await page.goBack();
      await expect(page.locator(scriptSelector)).toHaveCount(1);
    }
    await page.evaluate(() => {
      (window as unknown as { adDocumentMarker: boolean }).adDocumentMarker = true;
    });
    const documentResponse = page.waitForResponse(
      (response) =>
        response.request().isNavigationRequest() && new URL(response.url()).pathname === route,
    );
    await page.locator(`footer a[href='${route}']`).click();
    expect((await documentResponse).status()).toBe(200);
    expect(
      await page.evaluate(
        () => (window as unknown as { adDocumentMarker?: boolean }).adDocumentMarker,
      ),
    ).toBeUndefined();
    await expect(page.locator(scriptSelector)).toHaveCount(route === "/questions" ? 1 : 0);
    if (route !== "/questions") {
      await page.waitForTimeout(1500);
      expect(excludedRequests).toEqual([]);
    }
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator(scriptSelector)).toHaveCount(0);
  await page.waitForTimeout(1500);
  expect(excludedRequests).toEqual([]);
});
