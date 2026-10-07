import { expect, test, type Locator } from "@playwright/test";

const finderViewports = [
  [320, 568],
  [360, 800],
  [375, 812],
  [390, 844],
  [393, 852],
  [414, 896],
  [430, 932],
  [701, 900],
  [768, 1024],
  [800, 900],
  [820, 1180],
  [834, 1194],
  [849, 900],
  [900, 900],
  [1024, 768],
  [1099, 900],
  [1280, 720],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2048, 1152],
  [2560, 1440],
] as const;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("creat-web:analytics-consent:v1", "denied"));
});

const screenshotWidths = new Set([375, 390, 768, 834, 849, 1024, 1440, 1920]);

async function noIntersection(a: Locator, b: Locator, context: string) {
  const first = await a.boundingBox();
  const second = await b.boundingBox();
  if (!first || !second) throw new Error(`Missing visible layout element: ${context}`);
  const horizontal =
    Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x);
  const vertical =
    Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y);
  expect(horizontal <= 1 || vertical <= 1, context).toBe(true);
}

test("Finder viewport matrix preserves independent content, artwork and controls", async ({
  page,
}, info) => {
  test.setTimeout(180_000);
  await page.goto("/find-questions");
  await page.evaluate(() => document.fonts.ready);
  const selectors = [
    ".question-details h3",
    ".tags",
    ".question-stats",
    ".question-art",
    ".bookmark",
    ".select-button",
  ];
  for (const [width, height] of finderViewports) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
    const root = await page.locator(".finder-page").boundingBox();
    expect(root!.width).toBeGreaterThanOrEqual(width - 2);
    if (width >= 1100) {
      const directory = await page.locator(".directory").boundingBox();
      expect(directory!.width).toBeGreaterThanOrEqual(Math.min(width - 64, 1180));
      expect(directory!.width).toBeLessThanOrEqual(width > 1440 ? 1521 : 1241);
    }
    if (width <= 700) {
      const header = await page.locator("[data-site-header]").boundingBox();
      expect(header).toBeDefined();
      expect(header!.height).toBeLessThanOrEqual(80);
      await expect(page.getByRole("button", { name: "Open mobile menu" })).toBeVisible();
    }
    const cards = page.locator(".question-card");
    for (let cardIndex = 0; cardIndex < (await cards.count()); cardIndex++) {
      for (let a = 0; a < selectors.length; a++) {
        for (let b = a + 1; b < selectors.length; b++) {
          await noIntersection(
            cards.nth(cardIndex).locator(selectors[a]!),
            cards.nth(cardIndex).locator(selectors[b]!),
            `${width}px card ${cardIndex + 1}: ${selectors[a]} / ${selectors[b]}`,
          );
        }
      }
    }
    const character = page.locator(".hero-character");
    const bounds = await character.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    if (width <= 700) {
      for (const selector of [".find-word", ".rather-line", ".questions-word", ".hero p"])
        await noIntersection(character, page.locator(selector), `${width}px hero ${selector}`);
      expect((await page.locator(".hero").boundingBox())!.height).toBeLessThanOrEqual(270);
    }
    await expect(page.locator("[data-site-footer]")).toBeVisible();
    if (screenshotWidths.has(width)) {
      await page.screenshot({
        path: info.outputPath(`finder-final-${width}x${height}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
  }
});

test("Finder long copy and statistics errors grow cards without collisions", async ({ page }) => {
  const mockUnavailableStats = (
    route: Parameters<typeof page.route>[1] extends (r: infer R, ...args: never[]) => unknown
      ? R
      : never,
  ) => route.fulfill({ status: 503, json: { error: "Controlled unavailable statistics" } });
  await page.route("**/api/wyr/vote?*", mockUnavailableStats);
  await page.route("**/api/wyr/kids-vote?*", mockUnavailableStats);
  await page.goto("/find-questions");
  await expect(page.locator(".stats-retry")).toHaveCount(10);
  // Stress the component beyond the current bank's longest title without changing source content.
  await page
    .locator(".question-details h3")
    .first()
    .evaluate((el) => {
      el.textContent =
        "Would you rather " +
        "consider a very long imaginary possibility with your friends ".repeat(8) +
        "or choose another possibility?";
    });
  for (const width of [320, 375, 701, 768, 834, 1024, 1099, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const card = page.locator(".question-card").first();
    for (const copy of [".question-details h3", ".tags", ".question-stats"])
      for (const control of [".question-art", ".bookmark", ".select-button"])
        await noIntersection(
          card.locator(copy),
          card.locator(control),
          `${width}px long copy: ${copy} / ${control}`,
        );
  }
});

test("Finder artwork stays stable through search, pagination and reload", async ({ page }) => {
  await page.goto("/find-questions");
  const artwork = () =>
    page
      .locator(".question-card")
      .evaluateAll((cards) =>
        cards.map((card) => [
          card.getAttribute("data-question-id"),
          card.querySelector(".question-art")!.getAttribute("src"),
        ]),
      );
  const initial = await artwork();
  const sources = initial.map(([, src]) => src);
  expect(
    Math.max(...sources.map((src) => sources.filter((value) => value === src).length)),
  ).toBeLessThanOrEqual(2);
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await page.getByRole("button", { name: "Page 1", exact: true }).click();
  expect(await artwork()).toEqual(initial);
  await page.getByRole("searchbox").fill("squirrel");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  expect((await artwork())[0]).toEqual(initial[0]);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await page.reload();
  expect(await artwork()).toEqual(initial);
});

test("Finder completes age/tone, save/unsave, selected pool, restore and mobile navigation", async ({
  page,
}) => {
  await page.goto("/find-questions");
  await page.getByRole("button", { name: "Kids", exact: true }).click();
  await page.getByRole("button", { name: "Funny", exact: true }).click();
  await expect(page.locator(".panel-heading")).toContainText("512 curated questions");
  await page.getByRole("button", { name: "Apply Filters" }).click();
  await expect(page.locator(".panel-heading")).toContainText("matching questions");
  const poolCount = await page.locator(".panel-heading p").textContent();
  await page.getByRole("button", { name: "Save question 1", exact: true }).click();
  await page.getByRole("button", { name: "Unsave question 1", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save question 1", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(await page.evaluate(() => localStorage.getItem("wyrplay:saved-questions:v1"))).toBe("[]");
  const ids = await page
    .locator(".question-card")
    .evaluateAll((cards) => cards.slice(0, 2).map((card) => card.getAttribute("data-question-id")));
  await page.locator(".select-button").nth(0).click();
  await expect(page.locator(".question-card").first()).toHaveCSS(
    "border-top-color",
    "rgb(23, 173, 235)",
  );
  await page.locator(".select-button").nth(1).click();
  await page.getByRole("button", { name: "Play these questions" }).click();
  await expect(page).toHaveURL(/\/play\?/);
  const selectedIds = new URL(page.url()).searchParams.get("set")?.split(",");
  expect(selectedIds).toEqual(ids);
  await page.getByRole("link", { name: "Back to questions" }).click();
  await expect(page.locator(".selection-bar h3")).toHaveText("2 selected questions");
  await expect(page.locator(".panel-heading p")).toHaveText(poolCount!);
  await expect(page.getByRole("button", { name: "Kids", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Funny", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await page
    .locator(".popular-searches")
    .getByRole("button", { name: "for kids", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Kids", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page
    .locator(".popular-searches")
    .getByRole("button", { name: "funny", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Funny", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Kids", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  const filterButtons = page.locator(".filter-options button");
  await expect(filterButtons).toHaveCount(19);
  for (let index = 0; index < (await filterButtons.count()); index++) {
    await filterButtons.nth(index).click();
    await expect(filterButtons.nth(index)).toHaveAttribute("aria-pressed", "true");
    await filterButtons.nth(index).click();
    await expect(filterButtons.nth(index)).toHaveAttribute("aria-pressed", "false");
  }
  await page.setViewportSize({ width: 375, height: 812 });
  const searchbox = page.getByRole("searchbox");
  await searchbox.focus();
  await expect(searchbox).toBeFocused();
  await expect(searchbox).toHaveCSS("outline-style", "solid");
  await expect(searchbox).toHaveCSS("outline-width", "3px");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeFocused();

  await page.getByRole("button", { name: "Open mobile menu" }).click();
  const menu = page.getByRole("navigation", { name: "Mobile navigation" });
  for (const label of ["Home", "Find Questions", "Print", "Leaderboards", "Play Now"])
    await expect(menu.getByRole("link", { name: label, exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open mobile menu" })).toBeVisible();
  await page.locator(".finder-categories").getByRole("link", { name: "Kids questions" }).click();
  await expect(page).toHaveURL(/would-you-rather-questions-for-kids/);
  await expect(page.locator("footer")).not.toHaveAttribute("data-theme", "light");
});

test("Finder vote summary renders real stats and recovers from an explicit API error", async ({
  page,
}) => {
  await page.goto("/find-questions");
  await expect(page.locator(".question-stats").first()).not.toContainText("Loading");
  await expect(page.locator(".stats-retry")).toHaveCount(0);
  let failed = true;
  const mockRetry = async (
    route: Parameters<typeof page.route>[1] extends (r: infer R, ...args: never[]) => unknown
      ? R
      : never,
  ) => {
    if (failed) await route.fulfill({ status: 503, json: { error: "Controlled test failure" } });
    else await route.continue();
  };
  await page.route("**/api/wyr/vote?*", mockRetry);
  await page.route("**/api/wyr/kids-vote?*", mockRetry);
  await page.reload();
  await expect(page.locator(".stats-retry")).toHaveCount(10);
  failed = false;
  await page.locator(".stats-retry").first().click();
  await expect(page.locator(".question-stats").first()).not.toContainText("unavailable");
  await expect(page.locator(".question-stats").first()).not.toContainText("Loading");
});

test("Finder privacy and analytics banner safe positioning across profiles", async ({ page }) => {
  for (const consentState of ["not-decided", "granted", "denied"] as const) {
    await page.addInitScript((state) => {
      try {
        if (state === "not-decided") {
          localStorage.removeItem("creat-web:analytics-consent:v1");
        } else {
          localStorage.setItem("creat-web:analytics-consent:v1", state);
        }
      } catch {
        // ignore storage errors
      }
    }, consentState);

    for (const width of [390, 430, 768, 834, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/find-questions");
      await page.waitForLoadState("domcontentloaded");

      const panel = page.locator(".question-panel");
      await expect(panel).toBeVisible();

      const searchBox = page.getByRole("searchbox");
      await expect(searchBox).toBeVisible();

      const nextBtn = page.getByRole("button", { name: "Next →" });
      await expect(nextBtn).toBeVisible();

      const selectionBar = page.locator(".selection-bar");
      await expect(selectionBar).toBeVisible();
    }
  }
});

test("Finder DPR 1 and DPR 2 asset rendering across representative viewports", async ({
  browser,
}) => {
  const baseURL = test.info().project.use.baseURL;
  if (!baseURL) throw new Error("Playwright baseURL is required for Finder tests");

  for (const deviceScaleFactor of [1, 2]) {
    const context = await browser.newContext({
      baseURL,
      deviceScaleFactor,
    });
    const page = await context.newPage();
    await page.addInitScript(() =>
      localStorage.setItem("creat-web:analytics-consent:v1", "denied"),
    );

    for (const [width, height] of [
      [390, 844],
      [834, 1194],
      [1440, 900],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto("/find-questions");
      await page.evaluate(() => document.fonts.ready);

      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((resolve) => setTimeout(resolve, 300));
        window.scrollTo(0, 0);
      });

      const brokenImages = await page.locator("img").evaluateAll((imgs) =>
        (imgs as HTMLImageElement[])
          .filter((img) => {
            const style = window.getComputedStyle(img);
            if (style.display === "none" || style.visibility === "hidden") return false;
            return img.complete && img.naturalWidth === 0 && !img.src.includes("data:");
          })
          .map((img) => img.src),
      );
      expect(brokenImages).toEqual([]);

      await expect(page.locator(".hero-character")).toHaveAttribute("src", /\/_next\/image\?/);
      await expect(page.locator(".question-art").first()).toHaveAttribute(
        "src",
        /\/_next\/image\?/,
      );
    }

    await context.close();
  }
});

test("Finder image delivery skips mobile-only decorations and uses optimized content images", async ({
  browser,
}) => {
  const baseURL = test.info().project.use.baseURL;
  if (!baseURL) throw new Error("Playwright baseURL is required for Finder tests");

  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem("creat-web:analytics-consent:v1", "denied"));
  const imageRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "image") imageRequests.push(request.url());
  });

  await page.goto("/find-questions");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-character")).toBeVisible();
  await expect(page.locator(".question-art").first()).toBeVisible();

  await expect(page.locator(".hero-character")).toHaveAttribute("src", /\/_next\/image\?/);
  await expect(page.locator(".question-art").first()).toHaveAttribute("src", /\/_next\/image\?/);

  for (const file of [
    "search-left.png",
    "search-right.png",
    "selection-left.png",
    "left-bottom.png",
  ]) {
    expect(
      imageRequests.some((url) => url.includes(`/finder/assets/${file}`)),
      `mobile should not request hidden decoration ${file}`,
    ).toBe(false);
  }

  await context.close();
});

test("Finder 849px layout geometry aligns with reference structure", async ({ page }) => {
  await page.setViewportSize({ width: 849, height: 900 });
  await page.goto("/find-questions");
  await expect(page.locator(".directory")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  const header = await page.locator("[data-site-header]").boundingBox();
  const hero = await page.locator(".hero").boundingBox();
  const searchArea = await page.locator(".search-area").boundingBox();
  const directory = await page.locator(".directory").boundingBox();
  const filters = await page.locator(".filters").boundingBox();
  const questionPanel = await page.locator(".question-panel").boundingBox();

  expect(header).toBeDefined();
  expect(hero).toBeDefined();
  expect(searchArea).toBeDefined();
  expect(directory).toBeDefined();
  expect(filters).toBeDefined();
  expect(questionPanel).toBeDefined();

  expect(directory!.width).toBeGreaterThanOrEqual(790);
  expect(directory!.width).toBeLessThanOrEqual(810);
  expect(filters!.width).toBeGreaterThanOrEqual(220);
  expect(filters!.width).toBeLessThanOrEqual(280);
});
