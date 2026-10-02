import { expect, test } from "@playwright/test";

test.describe("WYRPlay Real Browser Interactions & E2E Acceptance", () => {
  test.beforeEach(async ({ page }) => {
    // 预置已拒绝分析许可（存纯字符串 denied），防止 Cookie Consent 遮罩遮挡视口点击
    await page.addInitScript(() => {
      try {
        localStorage.setItem("creat-web:analytics-consent:v1", "denied");
      } catch {
        // ignore
      }
    });
  });

  test.describe("1. Production Formal Question Bank (116 Approved Dilemmas)", () => {
    test("production 首页与 5 个 SEO 落地页真实消费 116 道正式题库", async ({ page }) => {
      // 1.1 检查首页生产行为
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      // Arena 正常展示第一道正式题目，绝非审核中空状态
      await expect(page.getByText("Dilemmas are Currently Under Editorial Review")).toHaveCount(0);
      const arenaHeading = page.locator("#play h2").first();
      await expect(arenaHeading).toBeVisible();
      const headingText = await arenaHeading.innerText();
      expect(headingText.length).toBeGreaterThan(10);

      // Arena 切题按钮正常渲染
      await expect(page.getByRole("button", { name: /Next Question/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /^Random$/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Presenter Mode/i })).toBeVisible();

      // 统计栏展示全部 116 道已审核可玩题目
      const counterText = page.getByText(/116 playable dilemmas/i);
      await expect(counterText).toBeVisible();

      // 题目长目录正常渲染题目卡片
      const questionCards = page.locator("#questions article");
      const cardCount = await questionCards.count();
      expect(cardCount).toBeGreaterThan(0);

      // 页面绝无任何 "Under Review" 提示
      await expect(page.locator("#questions").getByText("Under Review")).toHaveCount(0);

      // 1.2 检查 5 个核心 SEO 专题落地页全部有且仅有对应分类的正式题目（精确题数）
      const seoRoutes = [
        { route: "/would-you-rather-questions-for-kids", expectedCount: 58 },
        { route: "/funny-would-you-rather-questions", expectedCount: 18 },
        { route: "/hard-would-you-rather-questions", expectedCount: 73 },
        { route: "/would-you-rather-questions-for-friends", expectedCount: 49 },
        { route: "/would-you-rather-questions-for-couples", expectedCount: 9 },
      ] as const;

      for (const { route, expectedCount } of seoRoutes) {
        await page.goto(route);
        await expect(page.getByText("Dilemmas are Currently Under Editorial Review")).toHaveCount(
          0,
        );
        await expect(page.locator("#play h2").first()).toBeVisible();
        const routeCards = await page.locator("#questions article").count();
        expect(routeCards).toBe(expectedCount);
      }
    });

    test("正式题库搜索与多维度筛选 (Search, Filters, Clear, No Results)", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      const searchInput = page.getByPlaceholder(/Search dilemmas by keyword/i);
      await expect(searchInput).toBeVisible();

      // 关键词搜索
      await searchInput.fill("hear");
      await page.waitForTimeout(150);
      const matchCount = await page.locator("#questions article").count();
      expect(matchCount).toBe(6);

      // 难度筛选
      const hardBtn = page.getByRole("button", { name: "hard", exact: true });
      await hardBtn.click();
      await page.waitForTimeout(150);

      // 极端无效关键词导致 0 结果
      await searchInput.fill("xyznonexistentkeyword123456789");
      await page.waitForTimeout(150);
      await expect(page.getByText("No dilemma matches your active filters")).toBeVisible();

      // 清除筛选按钮
      const clearBtn = page.getByRole("button", { name: /Clear all filters/i });
      await expect(clearBtn).toBeVisible();
      await clearBtn.click();
      await page.waitForTimeout(150);

      // 恢复全部 116 道题展示
      await expect(page.getByText(/116 playable dilemmas/i)).toBeVisible();
    });

    test("正式题库 A/B 投票、改票与刷新恢复 (A/B voting, switch A->B & B->A, refresh persistence)", async ({
      page,
    }) => {
      await page.goto("/would-you-rather-questions-for-couples");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      const optionA = page.locator("#play button:has-text('Option A')").first();
      const optionB = page.locator("#play button:has-text('Option B')").first();

      // 初始无投票态
      await expect(optionA).toHaveAttribute("aria-pressed", "false");
      await expect(optionB).toHaveAttribute("aria-pressed", "false");

      // 投 Option A
      await optionA.click();
      await expect(optionA).toHaveAttribute("aria-pressed", "true");
      await expect(optionA.locator("text=Your Choice")).toBeVisible();
      await expect(page.locator("#play").getByText(/Total of \d+ votes received/i)).toBeVisible();

      // 改投 Option B
      await optionB.click();
      await expect(optionB).toHaveAttribute("aria-pressed", "true");
      await expect(optionA).toHaveAttribute("aria-pressed", "false");
      await expect(optionB.locator("text=Your Choice")).toBeVisible();

      // 刷新页面，保持 Option B 状态
      await page.reload();
      const reloadedOptionB = page.locator("#play button:has-text('Option B')").first();
      await expect(reloadedOptionB).toHaveAttribute("aria-pressed", "true");
      await expect(reloadedOptionB.locator("text=Your Choice")).toBeVisible();
    });

    test("Kids voting does not create or reuse the persistent voter cookie", async ({
      page,
      context,
    }) => {
      await context.clearCookies();
      await page.goto("/would-you-rather-questions-for-kids");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      expect((await context.cookies()).some((cookie) => cookie.name === "wyr_vid")).toBe(false);

      const optionA = page.locator("#play button:has-text('Option A')").first();
      await optionA.click();
      await expect(optionA).toHaveAttribute("aria-pressed", "true");

      expect((await context.cookies()).some((cookie) => cookie.name === "wyr_vid")).toBe(false);

      await page.reload();
      const reloadedOptionA = page.locator("#play button:has-text('Option A')").first();
      await expect(reloadedOptionA).toHaveAttribute("aria-pressed", "false");
      expect((await context.cookies()).some((cookie) => cookie.name === "wyr_vid")).toBe(false);
    });

    test("Next/Random 切题有效性与状态隔离", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      const arenaHeading = page.locator("#play h2").first();
      const firstHeading = await arenaHeading.innerText();

      // 点击 Next 切题
      const nextBtn = page.getByRole("button", { name: /Next Question/i });
      await nextBtn.click();
      await page.waitForTimeout(200);

      const secondHeading = await arenaHeading.innerText();
      expect(secondHeading).not.toBe(firstHeading);

      // 点击 Random 切题
      const randomBtn = page.getByRole("button", { name: /^Random$/i });
      await randomBtn.click();
      await page.waitForTimeout(200);

      const thirdHeading = await arenaHeading.innerText();
      expect(thirdHeading).not.toBe(secondHeading);
    });

    test("API 失败容错 (handles API 500 gracefully without crashing)", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      // 拦截投票 API 并模拟 500 故障
      await page.route("**/api/wyr/vote", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Simulated voting failure" }),
        });
      });

      const optionA = page.locator("#play button:has-text('Option A')").first();
      await optionA.click();

      // 页面展示错误提示，不崩溃白屏
      await expect(page.locator("text=Simulated voting failure")).toBeVisible();
    });

    test("Presenter 模式 (opens, disables prev on first, navigates next, closes with escape, restores focus)", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      const presenterBtn = page.getByRole("button", { name: /Presenter Mode/i });
      await expect(presenterBtn).toBeVisible();
      await presenterBtn.click();

      // 弹窗可见
      const modal = page.locator("div[role='dialog']");
      await expect(modal).toBeVisible();

      // 首题 Previous 禁用
      const prevBtn = modal.getByRole("button", { name: /Previous/i });
      await expect(prevBtn).toBeDisabled();

      // Next 可用并翻页
      const nextModalBtn = modal.getByRole("button", { name: /Next/i });
      await expect(nextModalBtn).toBeEnabled();
      await nextModalBtn.click();

      // 翻页后 Previous 变为可用
      await expect(prevBtn).toBeEnabled();

      // Escape 退出弹窗并恢复焦点
      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();
      await expect(presenterBtn).toBeFocused();
    });

    test("keyboard/focus (keyboard shortcut KeyA votes & focus management)", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      // 按键盘 KeyA 进行投票
      await page.keyboard.press("KeyA");

      const optionA = page.locator("#play button:has-text('Option A')").first();
      await expect(optionA).toHaveAttribute("aria-pressed", "true");
      await expect(optionA.locator("text=Your Choice")).toBeVisible();
    });
  });

  test.describe("2. Mobile 375px Viewport & Mobile Menu", () => {
    test("375px 视口无横向溢出且 mobile menu 可交互点击", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

      const menuButton = page.locator("button[aria-label='Open mobile menu']");
      await expect(menuButton).toBeVisible();
      await menuButton.click();
      await page.waitForTimeout(200);

      const mobileKidsLink = page.locator(
        "nav[aria-label='Mobile navigation'] a[href='/would-you-rather-questions-for-kids']",
      );
      await expect(mobileKidsLink).toBeVisible();
    });
  });

  test.describe("3. Theme Toggle & Persistence", () => {
    test("theme persistence (toggles theme and persists across page reloads)", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      const themeToggle = page.locator("button[aria-label*='theme' i]").first();
      await expect(themeToggle).toBeVisible();

      await expect(themeToggle).toBeEnabled();
      const initialTheme = await page.evaluate(
        () => document.documentElement.getAttribute("data-theme") ?? "dark",
      );
      const targetTheme = initialTheme === "dark" ? "light" : "dark";

      await themeToggle.click();
      await page.waitForTimeout(200);

      const updatedTheme = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme"),
      );
      expect(updatedTheme).toBe(targetTheme);

      // 刷新持久化
      await page.reload();
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();
      const persistedTheme = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme"),
      );
      expect(persistedTheme).toBe(targetTheme);
    });
  });
});
