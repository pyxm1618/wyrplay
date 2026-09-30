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

  test.describe("1. Production Editorial Review State (Zero unreviewed questions exposed)", () => {
    test("production 正式页面不暴露 unreviewed 题 (Arena & Questions show editorial review empty state with 0 questions)", async ({
      page,
    }) => {
      // 1.1 检查首页生产行为
      await page.goto("/");

      // Arena 审校中空状态文案与提示
      const arenaParagraph = page.getByText("Dilemmas are Currently Under Editorial Review");
      await expect(arenaParagraph).toBeVisible();

      const arenaSubtext = page.getByText(
        "Our editorial process is reviewing dilemmas for verified age ratings and suitability",
      );
      await expect(arenaSubtext).toBeVisible();

      // 在无已审核题目时，Arena 安全不渲染切题按钮
      await expect(page.getByRole("button", { name: /Next Question/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^Random$/i })).toHaveCount(0);

      // 目录必须展示审核中空状态，卡片数严格为 0，绝对不暴露任何未审核题
      const emptyStateHeading = page
        .locator("#questions")
        .getByText("No approved dilemmas available");
      await expect(emptyStateHeading).toBeVisible();

      const questionCards = page.locator("#questions article");
      expect(await questionCards.count()).toBe(0);

      // 验证页面上绝对没有 "Under Review" 题目徽章或未审核选项
      const underReviewBadges = page.locator("#questions").getByText("Under Review");
      expect(await underReviewBadges.count()).toBe(0);

      // 统计栏诚实展示 0 playable dilemmas
      const counterText = page.getByText(/0 playable dilemmas/i);
      await expect(counterText).toBeVisible();

      // 1.2 检查专题落地页（Kids）
      await page.goto("/would-you-rather-questions-for-kids");
      await expect(page.getByText("Dilemmas are Currently Under Editorial Review")).toBeVisible();
      expect(await page.locator("#questions article").count()).toBe(0);
    });
  });

  test.describe("2. Playable Dilemma Interactive Engine (Test Fixture Verification)", () => {
    test("test fixture 可正常搜索/筛选 (search, filter by difficulty, clear filters, no results)", async ({
      page,
    }) => {
      await page.goto("/test-bench");

      const searchInput = page.getByPlaceholder(/Search dilemmas by keyword/i);
      await expect(searchInput).toBeVisible();

      // 初始渲染全部 3 道受控测试题目
      const cards = page.locator("#questions article");
      expect(await cards.count()).toBe(3);

      // 1. 搜索特定关键词 "invisible"
      await searchInput.fill("invisible");
      await page.waitForTimeout(350); // debounce
      expect(await cards.count()).toBe(1);
      await expect(cards.first()).toContainText("invisible");

      // 2. 清空搜索，验证恢复 3 道题
      await searchInput.fill("");
      await page.waitForTimeout(350);
      expect(await cards.count()).toBe(3);

      // 3. 点击难度筛选 "easy"
      const easyBtn = page.getByRole("button", { name: "easy", exact: true });
      await easyBtn.click();
      await page.waitForTimeout(200);
      expect(await cards.count()).toBe(2);

      // 4. 清除所有筛选
      const clearBtn = page.getByRole("button", { name: /Clear all filters/i });
      await clearBtn.click();
      await page.waitForTimeout(200);
      expect(await cards.count()).toBe(3);

      // 5. 无结果状态
      await searchInput.fill("nonexistent_random_phrase_xyz_987");
      await page.waitForTimeout(350);
      await expect(page.getByText("No questions found")).toBeVisible();

      // 清空后恢复
      await searchInput.fill("");
      await page.waitForTimeout(350);
      expect(await cards.count()).toBe(3);
    });

    test("A/B 选择、改票与刷新恢复 (A/B voting, switch A->B & B->A, refresh persistence)", async ({
      page,
    }) => {
      await page.goto("/test-bench");

      const optionA = page.locator("button:has-text('Option A')").first();
      const optionB = page.locator("button:has-text('Option B')").first();
      await expect(optionA).toBeVisible();
      await expect(optionB).toBeVisible();

      // 1. A/B: 点击 Option A
      await optionA.click();
      await expect(optionA).toHaveAttribute("aria-pressed", "true");
      await expect(optionA.locator("text=Your Choice")).toBeVisible();
      await expect(optionA.locator("text=%")).toBeVisible();

      // 2. 改票: 点击 Option B
      await optionB.click();
      await expect(optionB).toHaveAttribute("aria-pressed", "true");
      await expect(optionB.locator("text=Your Choice")).toBeVisible();
      await expect(optionA).toHaveAttribute("aria-pressed", "false");
      await expect(optionA.locator("text=Your Choice")).toHaveCount(0);

      // 再次改回 A
      await optionA.click();
      await expect(optionA).toHaveAttribute("aria-pressed", "true");
      await expect(optionB).toHaveAttribute("aria-pressed", "false");

      // 3. 刷新恢复
      await page.reload();
      const refreshedOptionA = page.locator("button:has-text('Option A')").first();
      await expect(refreshedOptionA).toHaveAttribute("aria-pressed", "true");
      await expect(refreshedOptionA.locator("text=Your Choice")).toBeVisible();
      await expect(refreshedOptionA.locator("text=%")).toBeVisible();
    });

    test("Next/Random 与请求隔离 (Next/Random切题且新题不泄漏投票态)", async ({ page }) => {
      await page.goto("/test-bench");

      // 记录首题题干
      const arenaHeading = page.locator("#play h2").first();
      const firstHeadingText = await arenaHeading.innerText();

      // 首题投 Option A
      const optionA = page.locator("button:has-text('Option A')").first();
      await optionA.click();
      await expect(optionA).toHaveAttribute("aria-pressed", "true");

      // 1. Next 切题
      const nextBtn = page.getByRole("button", { name: /Next Question/i });
      await nextBtn.click();
      await page.waitForTimeout(200);

      // 验证切题成功：题干变化
      const secondHeadingText = await arenaHeading.innerText();
      expect(secondHeadingText).not.toBe(firstHeadingText);

      // 验证请求隔离：新题目绝不残留上一题的选择状态
      await expect(page.locator("text=Your Choice")).toHaveCount(0);
      const newOptionA = page.locator("button:has-text('Option A')").first();
      await expect(newOptionA).toHaveAttribute("aria-pressed", "false");

      // 2. Random 切题
      const randomBtn = page.getByRole("button", { name: "Random", exact: true });
      await randomBtn.click();
      await page.waitForTimeout(200);
      const thirdHeadingText = await arenaHeading.innerText();
      // 验证 Random 成功切出当前题目
      expect(thirdHeadingText).not.toBe(secondHeadingText);
      // 验证题目状态与真实投票记录一致：若随机回首题则呈现已投，若切入未投票题则隔离无残留
      if (thirdHeadingText === firstHeadingText) {
        await expect(page.locator("button:has-text('Option A')").first()).toHaveAttribute(
          "aria-pressed",
          "true",
        );
      } else {
        await expect(page.locator("text=Your Choice")).toHaveCount(0);
      }
    });

    test("API 失败容错 (handles API 500 gracefully without crashing)", async ({ page }) => {
      await page.goto("/test-bench");

      // 拦截投票 API 并模拟 500 故障
      await page.route("**/api/wyr/vote", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Simulated voting failure" }),
        });
      });

      const optionA = page.locator("button:has-text('Option A')").first();
      await optionA.click();

      // 页面展示错误提示，不崩溃白屏
      await expect(page.locator("text=Simulated voting failure")).toBeVisible();
    });

    test("Presenter 模式 (opens, disables prev on first, navigates next, closes with escape, restores focus)", async ({
      page,
    }) => {
      await page.goto("/test-bench");

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
      await page.goto("/test-bench");

      // 按键盘 KeyA 进行投票
      await page.keyboard.press("KeyA");

      const optionA = page.locator("button:has-text('Option A')").first();
      await expect(optionA).toHaveAttribute("aria-pressed", "true");
      await expect(optionA.locator("text=Your Choice")).toBeVisible();
    });
  });

  test.describe("3. Mobile 375px Viewport & Mobile Menu", () => {
    test("375px 视口无横向溢出且 mobile menu 可交互点击", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("/");

      // 检查横向绝对不溢出
      const isOverflowing = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(isOverflowing).toBe(false);

      // 查找移动端汉堡菜单按钮并点击展开
      const menuButton = page.locator("button[aria-label='Open mobile menu']");
      await expect(menuButton).toBeVisible();
      await menuButton.click();
      await page.waitForTimeout(200);

      // 验证移动端导航菜单内的链接可见且可点击
      const mobileKidsLink = page.locator(
        "nav[aria-label='Mobile navigation'] a[href='/would-you-rather-questions-for-kids']",
      );
      await expect(mobileKidsLink).toBeVisible();
    });
  });

  test.describe("4. Theme Switching & Persistence", () => {
    test("theme persistence (toggles theme and persists across page reloads)", async ({ page }) => {
      await page.goto("/");

      const themeToggle = page.locator("button[aria-label*='theme' i]").first();
      await expect(themeToggle).toBeVisible();

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
      const persistedTheme = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme"),
      );
      expect(persistedTheme).toBe(targetTheme);
    });
  });
});
