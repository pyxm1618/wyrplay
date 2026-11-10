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

test("homepage preserves the approved 778px design geometry", async ({ page }, info) => {
  await page.setViewportSize({ width: 778, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  const regions = [
    ["[data-site-header]", [0, 0, 778, 60]],
    [".hero", [0, 60, 778, 572]],
    [".choice-grid", [125, 285, 525, 180]],
    [".home-play-actions .choice-cta", [262, 511, 254, 51]],
    ["#categories", [0, 632, 778, 218]],
    ["#highlights", [0, 850, 778, 240]],
    ["#how-it-works", [0, 1090, 778, 140]],
    ["#trending", [0, 1230, 778, 290]],
    [".create-panel", [432, 1274, 314, 237]],
    ["#statistics", [0, 1520, 778, 73]],
    ["#community", [0, 1593, 778, 273]],
    ["#play-together", [0, 1866, 778, 155]],
  ] as const;

  for (const [selector, [x, y, width, height]] of regions) {
    const locator = page.locator(selector).first();
    await expect(locator, selector).toBeVisible();
    const box = await locator.boundingBox();
    expect(box, selector).not.toBeNull();
    for (const [actual, expected, dimension] of [
      [box!.x, x, "x"],
      [box!.y, y, "y"],
      [box!.width, width, "width"],
      [box!.height, height, "height"],
    ] as const) {
      expect(
        Math.abs(actual - expected),
        `${selector} ${dimension}: expected ${expected}px, got ${actual}px`,
      ).toBeLessThanOrEqual(1);
    }
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(778);
  await page.locator("#community").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLImageElement>("#community img")].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  const communityBrokenImages = await page
    .locator("#community img")
    .evaluateAll((images) =>
      (images as HTMLImageElement[])
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute("src") ?? "unknown"),
    );
  expect(communityBrokenImages).toEqual([]);
  expect(
    await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .some((entry) => entry.name.includes("/home-art/reference-art.png")),
    ),
  ).toBe(false);
  await page.screenshot({
    path: info.outputPath("home-reference-canvas-778x2021.png"),
    clip: { x: 0, y: 0, width: 778, height: 2021 },
  });
  await expect(page.getByRole("heading", { name: "See What Others Think" })).toBeVisible();
  await expect(page.locator("#categories .category-title")).toHaveText([
    "Popular",
    "Funny",
    "For Friends",
    "For Couples",
    "Classroom",
    "Hard Questions",
  ]);
  await expect(page.locator("#categories .category-description")).toHaveText([
    "Most voted",
    "Lighten the mood",
    "Perfect for groups",
    "Better conversations",
    "Great for discussion",
    "Challenge your mind",
  ]);
  await expect(page.locator("#statistics .statistic")).toHaveCount(4);
  await expect(page.locator("#statistics .statistic p span")).toHaveText([
    "Players",
    "Questions",
    "Categories",
    "Community Votes",
  ]);
  await expect(page.locator('img[src*="reference-art"], image[href*="reference-art"]')).toHaveCount(
    0,
  );
});
test("compact desktop artwork keeps a readable minimum and the primary action in the fold", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1024, height: 576 });
  await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const visuals = page.locator(".home-choice-visual");
  await expect(visuals).toHaveCount(2);
  for (const visual of await visuals.all()) {
    const box = await visual.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(120);
    expect(box!.height).toBeCloseTo(box!.width, 0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1024);
  const action = await page.locator(".home-play-actions .choice-cta").boundingBox();
  expect(action).not.toBeNull();
  expect(action!.y).toBeGreaterThanOrEqual(0);
  expect(action!.y + action!.height).toBeLessThanOrEqual(576);
  await page.screenshot({ path: info.outputPath("home-1024x576.png") });
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
      expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    }
    for (const selector of [
      "#categories",
      ".highlights-section",
      ".how-section",
      "#trending",
      ".create-panel",
      ".statistics",
      "#community",
      ".together-section",
      "#question-search",
      ".home-faq",
      "footer",
    ]) {
      await expect(page.locator(selector)).toBeVisible();
    }
    await expect(page.locator("[data-site-header] img").first()).toHaveAttribute(
      "src",
      /finder(?:%2F|\/)assets(?:%2F|\/)logo\.png/,
    );
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
  const summary = page.locator(".vote-summary");
  await expect(summary).toContainText("100%");
  await expect(summary).toHaveAttribute("aria-label", /100% chose A and 0% chose B, 1 total votes/);
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

test("presenter mode remains available on the dedicated play surface", async ({ page }) => {
  await page.goto("/play");
  await page.waitForLoadState("networkidle");

  const presenterTrigger = page.getByRole("button", { name: /Present/ }).first();
  await expect(presenterTrigger).toBeVisible();
  await presenterTrigger.click();

  const modal = page.locator(".presenter-page");
  await expect(modal).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
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
