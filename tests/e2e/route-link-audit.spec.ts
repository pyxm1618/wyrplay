import { expect, test } from "@playwright/test";

test.describe("Route, Link, Anchor & SEO Surface Permanent Audit Gate", () => {
  test.beforeEach(async ({ page }) => {
    // 预置已拒绝 Cookie，防止弹窗遮罩干扰
    await page.addInitScript(() => {
      try {
        localStorage.setItem("creat-web:analytics-consent:v1", "denied");
      } catch {
        // ignore
      }
    });
  });

  test("8. 统一 Header 使用正式路由，首页局部锚点仍保持有效", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const initialUrl = new URL(page.url());
    expect(initialUrl.pathname).toBe("/");
    expect(initialUrl.hash).toBe("");

    await expect(page.locator("#play")).toBeAttached();
    await expect(page.locator("#questions")).toBeAttached();
    await expect(page.locator("#categories")).toBeAttached();

    const primary = page.getByRole("navigation", { name: "Primary navigation" });
    for (const [name, href] of [
      ["Home", "/"],
      ["Find Questions", "/find-questions"],
      ["Print", "/print"],
      ["Leaderboards", "/leaderboards"],
    ] as const) {
      await expect(primary.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
    }
    await expect(primary.getByRole("link", { name: "Categories", exact: true })).toHaveCount(0);
    await expect(primary.getByRole("link", { name: "Create", exact: true })).toHaveCount(0);

    const playLink = page.getByRole("link", { name: "Play Now", exact: true }).first();
    await expect(playLink).toHaveAttribute("href", "/play");
    await playLink.click();
    await expect(page).toHaveURL(/\/play$/);

    await page.goto("/");
    const localQuestionsLink = page.locator('a[href="#questions"], a[href="/#questions"]').first();
    await expect(localQuestionsLink).toBeVisible();
    await localQuestionsLink.click();
    await expect.poll(() => new URL(page.url()).hash).toBe("#questions");
    await expect(page.locator("#questions")).toBeInViewport();
  });

  test("7. 全站同源链接、Hash 锚点目标与公共面无死链爬取门禁 (Crawl Gate)", async ({ page }) => {
    const seedRoutes = [
      "/",
      "/would-you-rather-questions-for-kids",
      "/funny-would-you-rather-questions",
      "/hard-would-you-rather-questions",
      "/would-you-rather-questions-for-friends",
      "/would-you-rather-questions-for-couples",
      "/questions",
      "/privacy",
      "/terms",
      "/acceptable-use",
      "/contact",
    ];

    const discoveredUrls = new Set<string>();
    const hashTargetsToVerify = new Map<string, Set<string>>(); // route -> Set of hashes

    // 第一阶段：从所有公开种子页面采集所有同源 <a href>
    for (const route of seedRoutes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      // 验证 canonical clean (无 hash、无 query)
      const canonicalLocator = page.locator('link[rel="canonical"]');
      if ((await canonicalLocator.count()) > 0) {
        const canonical = await canonicalLocator.first().getAttribute("href");
        if (canonical) {
          const canonicalUrl = new URL(canonical);
          expect(canonicalUrl.hash).toBe("");
          expect(canonicalUrl.search).toBe("");
        }
      }

      // 提取所有链接
      const links = await page
        .locator("a[href]")
        .evaluateAll((elements) =>
          elements
            .map((el) => el.getAttribute("href"))
            .filter((href): href is string => typeof href === "string"),
        );

      for (const href of links) {
        // 排除外链、mailto 和 tel
        if (
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) {
          // 如果是完整同源外链则解析为 path
          try {
            const parsed = new URL(href);
            if (
              parsed.host === "www.wyrplay.com" ||
              parsed.host === "localhost:3000" ||
              parsed.host === "127.0.0.1:3000"
            ) {
              discoveredUrls.add(parsed.pathname);
            }
          } catch {
            // ignore external
          }
          continue;
        }

        // 严禁公开页面链接到未开启的模板路径
        expect(href).not.toMatch(
          /^\/(?:sign-in(?:\/|$)|account(?:\/|$)|auth(?:\/|$)|checkout(?:\/|$))/,
        );

        if (href.startsWith("/")) {
          const [pathname, hash] = href.split("#");
          if (pathname) discoveredUrls.add(pathname);
          if (hash) {
            const targetRoute = pathname || route;
            if (!hashTargetsToVerify.has(targetRoute)) {
              hashTargetsToVerify.set(targetRoute, new Set());
            }
            hashTargetsToVerify.get(targetRoute)!.add(hash);
          }
        }
      }
    }

    // 第二阶段：验证所有发现的内部路径返回 200
    for (const url of discoveredUrls) {
      const res = await page.goto(url);
      expect(res?.status(), `Expected 200 for internal route ${url}, got ${res?.status()}`).toBe(
        200,
      );
    }

    // 第三阶段：验证所有 Hash 对应的 DOM 目标在页面上真实存在
    for (const [targetRoute, hashes] of hashTargetsToVerify.entries()) {
      await page.goto(targetRoute);
      for (const hash of hashes) {
        const targetElement = page.locator(`#${hash}`);
        const count = await targetElement.count();
        expect(
          count,
          `Expected DOM target #${hash} to exist on ${targetRoute}`,
        ).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test("10. /test-bench 与模板账号页面在生产模式下严格 404", async ({ page, baseURL }) => {
    // 随机未知页面无论在何种环境都必须 404
    const nonExistentRes = await page.goto("/non-existent-route-for-audit");
    expect(nonExistentRes?.status()).toBe(404);

    // 当针对生产域名或生产环境运行时，验证隔离页面严格 404
    const isProductionTarget =
      baseURL?.includes("wyrplay.com") || process.env.APP_ENV === "production";
    if (isProductionTarget) {
      const signInRes = await page.goto("/sign-in");
      expect(signInRes?.status()).toBe(404);

      const signUpRes = await page.goto("/sign-up");
      expect(signUpRes?.status()).toBe(404);

      const accountRes = await page.goto("/account");
      expect(accountRes?.status()).toBe(404);

      const billingRes = await page.goto("/account/billing");
      expect(billingRes?.status()).toBe(404);

      const testBenchRes = await page.goto("/test-bench");
      expect(testBenchRes?.status()).toBe(404);
    }
  });
});
