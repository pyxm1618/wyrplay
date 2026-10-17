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
  "/would-you-rather-questions-for-kids",
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
  expect(csp).not.toMatch(
    /googlesyndication|doubleclick|adtrafficquality|fundingchoicesmessages/,
  );

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

test("client navigation stays SPA-based without attempting to unload the AdSense runtime", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(scriptSelector)).toHaveCount(1);

  const documentRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document") documentRequests.push(request.url());
  });

  await page.locator('a[href="/would-you-rather-questions-for-kids"]').first().click();
  await page.waitForURL((url) => url.pathname === "/would-you-rather-questions-for-kids");

  expect(documentRequests).toEqual([]);
  await expect(page.locator(scriptSelector)).toHaveCount(1);

  await page.reload();
  await expect(page.locator(scriptSelector)).toHaveCount(0);
  await expect(page.locator("ins.adsbygoogle")).toHaveCount(0);
});
