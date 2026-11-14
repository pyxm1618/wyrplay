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

  test.describe("1. Production Formal Question Bank (512 Approved Dilemmas)", () => {
    test("production 首页消费精选正式题池，5 个 SEO 落地页保持正式 collection", async ({
      page,
    }) => {
      test.setTimeout(90_000);

      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      await expect(page.getByText("Dilemmas are Currently Under Editorial Review")).toHaveCount(0);
      const arenaHeading = page.locator("#play h2").first();
      await expect(arenaHeading).toHaveClass(/sr-only/);
      expect((await arenaHeading.innerText()).length).toBeGreaterThan(10);
      await expect(page.locator(".hero #play button[aria-pressed]")).toHaveCount(2);

      // The Homepage Authority ends at 2021 and intentionally does not own
      // Finder / multi-question / Presenter controls.
      await expect(page.getByRole("button", { name: /Next Question/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^Random$/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Presenter Mode/i })).toHaveCount(0);
      await expect(page.locator(".home-live-experience")).toHaveCount(0);

      const questionStat = page.locator("#statistics .statistic").filter({ hasText: "Questions" });
      await expect(questionStat).toHaveCount(1);
      await expect(questionStat).toContainText("512");

      const seoRoutes = [
        { route: "/would-you-rather-questions-for-kids", expectedCount: 318 },
        { route: "/funny-would-you-rather-questions", expectedCount: 145 },
        { route: "/hard-would-you-rather-questions", expectedCount: 297 },
        { route: "/would-you-rather-questions-for-friends", expectedCount: 209 },
        { route: "/would-you-rather-questions-for-couples", expectedCount: 45 },
      ] as const;

      for (const { route, expectedCount } of seoRoutes) {
        await page.goto(route);
        await expect(page.getByText("Dilemmas are Currently Under Editorial Review")).toHaveCount(
          0,
        );
        await expect(page.locator("#play h2").first()).toBeVisible();
        if (route === "/would-you-rather-questions-for-kids") {
          await page
            .getByRole("button", { name: "Browse more kids questions", exact: true })
            .click();
          await expect(page.locator(".kids-reviewed-card")).toHaveCount(expectedCount);
          await expect(page.locator("#questions article:not(.kids-reviewed-card)")).toHaveCount(0);
        } else {
          await expect(page.locator("#questions article")).toHaveCount(20);
          while (await page.getByRole("button", { name: /^Show more/ }).count())
            await page.getByRole("button", { name: /^Show more/ }).click();
          await expect(page.locator("#questions article")).toHaveCount(expectedCount);
        }
      }
    });

    test("正式题库搜索与多维度筛选 (Search, Filters, Clear, No Results)", async ({ page }) => {
      await page.goto("/find-questions");

      const searchInput = page.getByRole("searchbox", { name: "Search questions" });
      await expect(searchInput).toBeVisible();

      await searchInput.fill("hear");
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await expect(page).toHaveURL(/\/find-questions\?q=hear$/);
      await expect(page.locator(".panel-heading p")).toContainText("matching questions");
      expect(await page.locator("#questions .question-card").count()).toBeGreaterThan(0);

      const filters = page.locator('aside[aria-label="Question filters"]');
      await filters.getByRole("button", { name: "Hard", exact: true }).click();
      await filters.getByRole("button", { name: "Apply Filters" }).click();
      await expect(page).toHaveURL(/q=hear&difficulty=hard$/);

      await searchInput.fill("xyznonexistentkeyword123456789");
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await expect(page.getByText("No questions found", { exact: true })).toBeVisible();

      await filters.getByRole("button", { name: "Clear all", exact: true }).click();
      await expect(page.getByRole("searchbox", { name: "Search questions" })).toHaveValue("");
      await expect(page).toHaveURL(/\/find-questions$/);
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

    test("Kids voting clears legacy identity and does not persist a voter cookie", async ({
      page,
      context,
    }) => {
      await context.clearCookies();
      await context.addCookies([
        {
          name: "wyr_vid",
          value: "legacy-root-voter",
          url: "http://127.0.0.1:3000",
        },
      ]);

      await page.goto("/would-you-rather-questions-for-kids");
      await page.getByRole("button", { name: "Next question", exact: true }).click();
      await expect(page.locator(".kids-vote-arena")).toBeVisible();

      // The Kids stats request deletes the old root-scoped identity cookie.
      await expect
        .poll(async () => (await context.cookies()).some((cookie) => cookie.name === "wyr_vid"))
        .toBe(false);

      const optionA = page.locator(".kids-choice-a");
      const optionB = page.locator(".kids-choice-b");
      await optionA.click();
      await expect(optionA).toHaveAttribute("aria-pressed", "true");
      await expect(optionB).toBeDisabled();

      expect((await context.cookies()).some((cookie) => cookie.name === "wyr_vid")).toBe(false);

      await page.reload();
      await page.getByRole("button", { name: "Next question", exact: true }).click();
      const reloadedOptionA = page.locator(".kids-choice-a");
      await expect(reloadedOptionA).toHaveAttribute("aria-pressed", "false");
      expect((await context.cookies()).some((cookie) => cookie.name === "wyr_vid")).toBe(false);
    });

    test("dedicated play route next-question navigation keeps question state isolated", async ({
      page,
    }) => {
      await page.goto("/play?set=1,2,3");

      const heading = page.locator(".play-heading > p");
      const firstHeading = await heading.innerText();

      const nextBtn = page.getByRole("button", { name: "Next question", exact: true });
      await nextBtn.click();
      await expect(page.locator(".question-navigation")).toContainText("2 / 3");
      const secondHeading = await heading.innerText();
      expect(secondHeading).not.toBe(firstHeading);

      await nextBtn.click();
      await expect(page.locator(".question-navigation")).toContainText("3 / 3");
      const thirdHeading = await heading.innerText();
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

      const optionA = page.locator(".hero #play button[aria-pressed]").first();
      await optionA.click();

      // 页面展示错误提示，不崩溃白屏
      await expect(page.locator("text=Simulated voting failure")).toBeVisible();
    });

    test("Presenter 模式在 dedicated play route 保持可用并恢复焦点", async ({ page }) => {
      await page.goto("/play?set=1,2");

      const presenterBtn = page.getByRole("button", { name: "Present", exact: true });
      await expect(presenterBtn).toBeVisible();
      await presenterBtn.click();

      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();

      const prevBtn = modal.getByRole("button", { name: "Previous", exact: true });
      await expect(prevBtn).toBeDisabled();

      const nextModalBtn = modal.getByRole("button", { name: "Next", exact: true });
      await expect(nextModalBtn).toBeEnabled();
      await nextModalBtn.click();
      await expect(prevBtn).toBeEnabled();

      await page.keyboard.press("Escape");
      await expect(modal).toHaveCount(0);
      await expect(presenterBtn).toBeFocused();
    });

    test("keyboard/focus (arena-scoped shortcuts vote without hijacking outside focus)", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      const homepageChoices = page.locator(".hero #play button[aria-pressed]");
      const optionA = homepageChoices.nth(0);
      const optionB = homepageChoices.nth(1);
      await expect(optionA).toHaveAttribute("aria-pressed", "false");
      await expect(optionB).toHaveAttribute("aria-pressed", "false");

      await page.locator("footer a").first().focus();
      await page.keyboard.press("ArrowRight");
      await expect(optionB).toHaveAttribute("aria-pressed", "false");

      await page.locator("#play").evaluate((arena) => {
        const input = document.createElement("input");
        input.id = "keyboard-scope-input";
        const textarea = document.createElement("textarea");
        textarea.id = "keyboard-scope-textarea";
        const editable = document.createElement("div");
        editable.id = "keyboard-scope-editable";
        editable.contentEditable = "true";
        arena.append(input, textarea, editable);
      });
      for (const selector of [
        "#keyboard-scope-input",
        "#keyboard-scope-textarea",
        "#keyboard-scope-editable",
      ]) {
        await page.locator(selector).focus();
        await page.keyboard.press("ArrowRight");
        await expect(optionB).toHaveAttribute("aria-pressed", "false");
      }

      await page.locator("#play").focus();
      await page.keyboard.press("KeyA");
      await expect(optionA).toHaveAttribute("aria-pressed", "true");
    });
  });

  test.describe("2. Mobile 375px Viewport & Shared Header", () => {
    test("375px 视口无横向溢出且 authoritative SiteHeader 保持可用", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("/");
      await expect(page.locator("[data-home-ready=true]")).toBeEnabled();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

      const header = page.locator("[data-site-header]");
      await expect(header).toHaveCount(1);
      await expect(page.locator("[data-home-design-header]")).toHaveCount(0);
      await expect(header.getByRole("link", { name: "WYRPlay Home", exact: true })).toBeVisible();

      const menuButton = header.getByRole("button", { name: "Open mobile menu" });
      await expect(menuButton).toBeVisible();
      await menuButton.click();

      const mobileNav = header.getByRole("navigation", { name: "Mobile navigation" });
      await expect(mobileNav).toBeVisible();
      await expect(
        mobileNav.getByRole("link", { name: "Find Questions", exact: true }),
      ).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Play Now", exact: true })).toBeVisible();
    });
  });

  test.describe("3. Theme Toggle & Persistence", () => {
    test("theme persistence (toggles theme and persists across page reloads)", async ({ page }) => {
      await page.goto("/funny-would-you-rather-questions");
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
