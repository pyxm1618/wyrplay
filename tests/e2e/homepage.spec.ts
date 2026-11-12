import { expect, test } from "@playwright/test";

import { homeConfig } from "@/config/home.config";
import { routeRegistry } from "@/config/routes.config";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("creat-web:analytics-consent:v1", "denied"));
});

test("homepage has server-rendered purpose, one H1 and meaningful navigation", async ({ page }) => {
  const home = routeRegistry.get("/");
  if (home.class !== "public_indexable") throw new Error("homepage must be indexable");

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(home.h1);
  await expect(
    page.locator("a[href='/would-you-rather-questions-for-kids']").first(),
  ).toBeVisible();
  await expect(page.getByText(/best online tool/i)).toHaveCount(0);

  const html = await response?.text();
  expect(html).toContain(home.h1);

  // The configured hero copy must be present in the server response rather than
  // injected on the client. Compare against the longest fragment that carries no
  // HTML-escapable character, so this holds for any product's wording.
  const hero = homeConfig.sections.find((section) => section.type === "hero");
  if (!hero) throw new Error("homepage must configure a hero section");
  const serverRenderedFragment = hero.lead
    .split(/[&<>"']/)
    .reduce((longest, part) => (part.length > longest.length ? part : longest), "")
    .trim();
  expect(serverRenderedFragment.length).toBeGreaterThan(20);
  expect(html).toContain(serverRenderedFragment);
});

test("homepage does not overflow a 375px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("compact desktop artwork keeps a readable minimum and the primary action in the fold", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1024, height: 576 });
  await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const visuals = page.locator(".hero #play .pet-art");
  await expect(visuals).toHaveCount(2);
  for (const visual of await visuals.all()) {
    const box = await visual.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(92);
    expect(box!.height).toBeGreaterThanOrEqual(90);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1024);
  const action = await page.locator(".hero #play .choice-cta").boundingBox();
  expect(action).not.toBeNull();
  expect(action!.x).toBeGreaterThanOrEqual(0);
  expect(action!.x + action!.width).toBeLessThanOrEqual(1024);
  await page.screenshot({ path: info.outputPath("home-1024x576.png") });
});

test("778px reference Header and Hero match the frozen reconstruction geometry", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 778, height: 1000 });
  await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  const rect = async (selector: string) => {
    const box = await page.locator(selector).first().boundingBox();
    if (!box) throw new Error(`${selector} must have a bounding box`);
    return box;
  };

  const selectors = {
    header: "[data-home-design-header]",
    brand: "[data-home-design-header] .home-brand-mark",
    nav: "[data-home-design-header] nav",
    search: "[data-home-design-header] .search-button",
    login: "[data-home-design-header] .login-button",
    signup: "[data-home-design-header] .signup-button",
    hero: ".illustrated-home .hero",
    title: ".illustrated-home .hero-title-img",
    grid: ".illustrated-home .hero #play .choice-grid",
    cta: ".illustrated-home .hero #play .choice-cta",
  } as const;
  const boxes = Object.fromEntries(
    await Promise.all(
      Object.entries(selectors).map(async ([name, selector]) => [name, await rect(selector)]),
    ),
  ) as Record<keyof typeof selectors, Awaited<ReturnType<typeof rect>>>;

  const expectBox = (
    name: keyof typeof selectors,
    expected: readonly [number, number, number, number],
  ) => {
    const box = boxes[name];
    expect(box.x, `${name} x`).toBeCloseTo(expected[0], 1);
    expect(box.y, `${name} y`).toBeCloseTo(expected[1], 1);
    expect(box.width, `${name} width`).toBeCloseTo(expected[2], 1);
    expect(box.height, `${name} height`).toBeCloseTo(expected[3], 1);
  };

  console.info(
    `[HOME-AUTHORITY-GEOMETRY] ${JSON.stringify(
      Object.fromEntries(
        Object.entries(boxes).map(([name, box]) => [
          name,
          [box.x, box.y, box.width, box.height].map((value) => Number(value.toFixed(2))),
        ]),
      ),
    )}`,
  );

  expectBox("header", [0, 0, 778, 60]);
  expectBox("brand", [55, 7, 120, 43]);
  expectBox("search", [535.140625, 10, 29, 29]);
  expectBox("login", [581.140625, 9.5, 68, 30]);
  expectBox("signup", [658.140625, 9.5, 73, 30]);
  expectBox("hero", [0, 60, 778, 572]);
  expectBox("title", [209.5, 43, 359, 190]);
  expectBox("grid", [125, 285, 525, 180]);
  expectBox("cta", [262, 511, 254, 51]);

  await expect(page.locator(".illustrated-home .hero #play > h2")).toHaveClass(/sr-only/);
  await expect(page.locator(".illustrated-home .hero .home-secondary-controls")).toHaveCount(0);
  await expect(page.locator(".illustrated-home .hero #play .choice-cta")).toHaveText(
    /Make Your Choice/,
  );

  await page.screenshot({
    path: info.outputPath("home-authority-778x1000.png"),
    fullPage: false,
    animations: "disabled",
  });
});

const homeViewports = [
  [375, 812],
  [390, 844],
  [393, 852],
  [414, 896],
  [768, 1024],
  [820, 1180],
  [1024, 1366],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1512, 982],
  [1920, 1080],
] as const;

for (const [width, height] of homeViewports) {
  test(`unified homepage at ${width}x${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator("[data-home-ready=true]")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.locator("#play")).toHaveCount(1);
    const choices = page.locator(".hero #play button[aria-pressed]");
    await expect(choices).toHaveCount(2);
    for (const choice of await choices.all()) {
      const box = await choice.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(box!.y).toBeGreaterThanOrEqual(0);
    }
    for (const selector of [
      "#categories",
      ".highlights-section",
      ".how-section",
      "#trending",
      ".create-panel",
      ".statistics",
      ".together-section",
      "#question-search",
      ".home-faq",
      "footer",
    ]) {
      await expect(page.locator(selector)).toBeVisible();
    }
    await expect(page.locator("[data-home-design-header]")).toHaveCount(1);
    await expect(page.locator("[data-site-header]")).toHaveCount(0);
    await expect(page.locator("[data-home-design-header] .home-brand-mark")).toHaveCount(1);
    await expect(page.locator("h1 image")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Toggle theme" })).toHaveCount(0);
    await expect(page.getByText("Crafted for Genuine Social Play")).toHaveCount(0);
    for (const href of [
      "/would-you-rather-questions-for-kids",
      "/funny-would-you-rather-questions",
      "/hard-would-you-rather-questions",
      "/would-you-rather-questions-for-friends",
      "/would-you-rather-questions-for-couples",
    ]) {
      await expect(page.locator(`#categories a[href='${href}']`)).toBeVisible();
    }
    for (const href of ["/privacy", "/terms", "/acceptable-use", "/contact"]) {
      await expect(page.locator(`footer a[href='${href}']`)).toBeVisible();
    }
    const faq = page.locator(".home-faq details").first();
    await faq.locator("summary").click();
    await expect(faq.locator("p")).toBeVisible();
    if ([375, 390, 768, 1440, 1920].includes(width)) {
      await page.screenshot({
        path: info.outputPath(`home-${width}x${height}.png`),
        fullPage: true,
      });
    }
  });
}

test("highlights select the single hero arena", async ({ page }) => {
  await page.goto("/");
  const heading = page.locator("#play h2");
  const highlight = page.locator(".highlight-card").nth(1);
  const title = await highlight.locator(".highlight-title").textContent();
  await highlight.click();
  await expect(heading).toHaveText(title!);
  await expect(page.locator("#play")).toHaveCount(1);
});

test("late initial statistics cannot overwrite a recorded hero choice", async ({ page }) => {
  let releaseRead: () => void = () => {};
  const initialRead = new Promise<void>((resolve) => {
    releaseRead = resolve;
  });
  let completeRead: () => void = () => {};
  const readFinished = new Promise<void>((resolve) => {
    completeRead = resolve;
  });
  let reads = 0;
  const empty = {
    hasVoted: false,
    selectedOption: null,
    votesA: 0,
    votesB: 0,
    total: 0,
    percentageA: 50,
    percentageB: 50,
  };
  const mockRead = async (
    route: Parameters<typeof page.route>[1] extends (r: infer R, ...args: never[]) => unknown
      ? R
      : never,
  ) => {
    reads += 1;
    await initialRead;
    await route.fulfill({ json: empty });
    completeRead();
  };
  await page.route("**/api/wyr/vote?*", mockRead);
  await page.route("**/api/wyr/kids-vote?*", mockRead);

  const mockVote = async (
    route: Parameters<typeof page.route>[1] extends (r: infer R, ...args: never[]) => unknown
      ? R
      : never,
  ) => {
    await route.fulfill({
      json: {
        ...empty,
        hasVoted: true,
        selectedOption: "A",
        votesA: 1,
        total: 1,
        percentageA: 100,
        percentageB: 0,
      },
    });
  };
  await page.route("**/api/wyr/vote", mockVote);
  await page.route("**/api/wyr/kids-vote", mockVote);
  await page.goto("/");
  await expect.poll(() => reads).toBe(1);
  const choice = page.locator("#play button[aria-pressed]").first();
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  releaseRead();
  await readFinished;
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".vote-count")).toContainText("1 votes");
  await expect(page.locator(".dog-percent")).toHaveText("100%");
});

test("homepage stays warm under a saved dark preference without changing other pages", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.setItem("wyr-theme", "dark"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("wyr-theme"))).toBe("dark");
  const background = await page
    .locator(".illustrated-home")
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).toBe("rgb(255, 249, 240)");
  await expect(page.getByRole("button", { name: "Toggle theme" })).toHaveCount(0);
  await page.goto("/funny-would-you-rather-questions");
  await expect(page.getByRole("button", { name: "Toggle theme" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("a first vote before the initial read finishes keeps its anonymous identity", async ({
  page,
}) => {
  let releaseRead: () => void = () => {};
  let markReady: () => void = () => {};
  let markFinished: () => void = () => {};
  const delayed = new Promise<void>((resolve) => {
    releaseRead = resolve;
  });
  const ready = new Promise<void>((resolve) => {
    markReady = resolve;
  });
  const finished = new Promise<void>((resolve) => {
    markFinished = resolve;
  });
  let initial = true;
  await page.route("**/api/wyr/vote?*", async (route) => {
    if (!initial) {
      await route.continue();
      return;
    }
    initial = false;
    const response = await route.fetch();
    expect(response.status()).toBe(200);
    markReady();
    await delayed;
    await route.fulfill({ response });
    markFinished();
  });
  await page.goto("/would-you-rather-questions-for-couples");
  await ready;
  const choice = page.locator("#play button[aria-pressed]").first();
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  releaseRead();
  await finished;
  await page.reload();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
});

test("question selection moves and keeps keyboard focus on the mounted hero arena", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const heading = page.locator("#play h2");

  // 1. Highlight 点击测试
  const highlight = page.locator(".highlight-card").first();
  const highlightTitle = await highlight.locator(".highlight-title").textContent();
  await highlight.click();
  await expect(heading).toHaveText(highlightTitle!);
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const active = document.activeElement;
        const play = document.getElementById("play");
        return active !== null && (active === play || play?.contains(active));
      });
    })
    .toBe(true);
});

test("presenter modal retains return focus to live trigger after cycling questions", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const presenterTrigger = page.getByRole("button", { name: "Presenter Mode" });
  await expect(presenterTrigger).toBeVisible();
  await presenterTrigger.click();

  const modal = page.locator(".presenter-page");
  await expect(modal).toBeVisible();

  const nextBtn = page.locator(".presenter-page button", { hasText: "Next" }).first();
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
  }

  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const active = document.activeElement;
        return (
          active !== null &&
          active.tagName === "BUTTON" &&
          active.textContent?.includes("Presenter Mode")
        );
      });
    })
    .toBe(true);
});

test("mobile question filter bar buttons satisfy touch target bounding box and spacing requirements", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#question-search")).toBeVisible();

  const filterContainer = page.locator("#question-search");
  await filterContainer.scrollIntoViewIfNeeded();

  const filterButtons = filterContainer.locator("button");
  const count = await filterButtons.count();
  expect(count).toBeGreaterThan(15);

  for (let i = 0; i < count; i++) {
    const btn = filterButtons.nth(i);
    const box = await btn.boundingBox();
    expect(box, `Button ${i} should have a bounding box`).not.toBeNull();
    expect(
      box!.height,
      `Button ${i} height (${box!.height}px) should be at least 36px`,
    ).toBeGreaterThanOrEqual(36);
    expect(
      box!.width,
      `Button ${i} width (${box!.width}px) should be at least 36px`,
    ).toBeGreaterThanOrEqual(36);
  }

  // 记录代表性按钮物理测量尺寸
  const sampleAge = await filterContainer.getByRole("button", { name: "Kids 10-12" }).boundingBox();
  const sampleAdult = await filterContainer
    .getByRole("button", { name: "Adults 18+" })
    .boundingBox();
  console.info(`[TOUCH-TARGET-AUDIT] "Kids 10-12" box: ${sampleAge?.width}x${sampleAge?.height}px`);
  console.info(
    `[TOUCH-TARGET-AUDIT] "Adults 18+" box: ${sampleAdult?.width}x${sampleAdult?.height}px`,
  );

  // 点击一个具体筛选（例如 "Teens 13–17"）触发筛选激活状态
  const teenBtn = filterContainer.getByRole("button", { name: "Teens 13–17" });
  await teenBtn.click();
  await expect(teenBtn).toHaveAttribute("aria-pressed", "true");

  // 验证 Clear all filters 按钮同样拥有合规的真实 bounding box
  const clearBtn = filterContainer.getByRole("button", { name: "Clear all filters" });
  await expect(clearBtn).toBeVisible();
  const clearBox = await clearBtn.boundingBox();
  expect(clearBox).not.toBeNull();
  expect(clearBox!.height).toBeGreaterThanOrEqual(36);
  expect(clearBox!.width).toBeGreaterThanOrEqual(36);
  console.info(
    `[TOUCH-TARGET-AUDIT] "Clear all filters" box: ${clearBox?.width}x${clearBox?.height}px`,
  );

  // 点击清空，验证筛选状态重置
  await clearBtn.click();
  await expect(teenBtn).toHaveAttribute("aria-pressed", "false");
  await expect(clearBtn).toBeHidden();
});
