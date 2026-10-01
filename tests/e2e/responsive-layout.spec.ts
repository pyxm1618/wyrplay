import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

const viewports = [
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1728, 900],
  [1792, 850],
  [1920, 1080],
  [2560, 1440],
] as const;

const shots = {
  home: new Set(["1440x900", "1792x850", "1920x1080", "390x844"]),
  play: new Set(["1440x900", "1280x720", "1920x1080", "390x844"]),
  presenter: new Set(["1440x900", "1280x720", "1792x850", "1920x1080"]),
  finder: new Set(["1440x900", "1920x1080", "390x844"]),
  leaderboard: new Set(["1440x900", "1920x1080", "390x844"]),
  auth: new Set(["1440x900", "1920x1080", "390x844"]),
  print: new Set(["1440x900", "1920x1080", "390x844"]),
} as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("creat-web:analytics-consent:v1", "denied");
    } catch {}
  });
});

async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.allSettled([...document.images].map((image) => image.decode()));
  });
}
async function noOverflow(page: Page) {
  const s = await page.evaluate(() => ({
    width: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(s.document).toBeLessThanOrEqual(s.width + 1);
  expect(s.body).toBeLessThanOrEqual(s.width + 1);
}
async function inside(locator: Locator, height: number) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Expected visible element to have a bounding box");
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
}
async function shot(page: Page, info: TestInfo, group: keyof typeof shots, w: number, h: number) {
  const size = `${w}x${h}`;
  if (!shots[group].has(size)) return;
  await page.screenshot({
    path: info.outputPath(`${group}-${size}.png`),
    fullPage: false,
    animations: "disabled",
  });
}

test.describe("required responsive viewport matrix", () => {
  test.setTimeout(120_000);

  test("Home full-bleed shell and desktop fold", async ({ page }, info) => {
    for (const [w, h] of viewports) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      await settle(page);
      await noOverflow(page);
      const root = await page
        .locator(".home-main .illustrated-home.homepage")
        .first()
        .boundingBox();
      if (!root) throw new Error("Illustrated home is missing");
      expect(root.width).toBeGreaterThanOrEqual(w - 2);
      if (w >= 1024) await inside(page.locator(".choice-cta").first(), h);
      if ((w === 1440 && h === 900) || (w === 1728 && h === 900) || (w === 1920 && h === 1080)) {
        const categories = await page.locator(".categories-section").first().boundingBox();
        if (!categories) throw new Error("Popular Categories is missing");
        expect(categories.y).toBeLessThan(h);
      }
      await shot(page, info, "home", w, h);
    }
  });

  test("Play keeps choices and primary actions reachable", async ({ page }, info) => {
    for (const [w, h] of viewports) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/play");
      await settle(page);
      await noOverflow(page);
      await expect(page.locator(".play-options")).toBeVisible();
      await expect(page.locator(".play-actions")).toBeVisible();
      if (w >= 1024) {
        const choices = await page.locator(".play-options").boundingBox();
        const actions = await page.locator(".play-actions").boundingBox();
        if (!choices || !actions) throw new Error("Play core surface is missing");
        expect(choices.y).toBeLessThan(h);
        expect(actions.y).toBeLessThan(h + 120);
      }
      await shot(page, info, "play", w, h);
    }
  });

  test("Presenter keeps all core controls in one desktop viewport", async ({ page }, info) => {
    for (const [w, h] of viewports) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/play");
      await page.getByRole("button", { name: "Present", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await settle(page);
      await noOverflow(page);
      const exit = dialog.getByRole("button", { name: "Exit Presenter", exact: true });
      await expect(exit).toBeVisible();
      if (w >= 1024) {
        for (const target of [
          dialog.locator(".play-heading"),
          dialog.locator(".play-options"),
          dialog.getByRole("button", { name: "Previous", exact: true }),
          dialog.getByRole("button", { name: "Next", exact: true }),
          exit,
        ])
          await inside(target, h);
        const scroll = await dialog.evaluate((el) => ({
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
        }));
        expect(scroll.scrollHeight).toBeLessThanOrEqual(scroll.clientHeight + 1);
      }
      await shot(page, info, "presenter", w, h);
      await exit.click();
    }
  });

  test("Finder is no longer an 849px desktop island", async ({ page }, info) => {
    for (const [w, h] of viewports) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/find-questions");
      await settle(page);
      await noOverflow(page);
      const root = await page.locator(".finder-page").boundingBox();
      if (!root) throw new Error("Finder root is missing");
      expect(root.width).toBeGreaterThanOrEqual(w - 2);
      if (w >= 1100) {
        const directory = await page.locator(".directory").boundingBox();
        if (!directory) throw new Error("Finder directory is missing");
        expect(directory.width).toBeGreaterThanOrEqual(Math.min(w - 64, 1180));
      }
      await shot(page, info, "finder", w, h);
    }
  });

  test("Leaderboard uses a broader controlled functional surface", async ({ page }, info) => {
    for (const [w, h] of viewports) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/leaderboards");
      await settle(page);
      await noOverflow(page);
      if (w >= 1024) {
        const shell = await page.locator(".leaderboard-page .page-shell").boundingBox();
        if (!shell) throw new Error("Leaderboard shell is missing");
        expect(shell.width).toBeGreaterThanOrEqual(Math.min(w - 36, 1510));
      }
      await shot(page, info, "leaderboard", w, h);
    }
  });

  test("Auth fills the viewport and exposes both sign-in choices on desktop", async ({
    page,
  }, info) => {
    for (const route of ["/sign-in", "/sign-up"]) {
      for (const [w, h] of viewports) {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(route);
        await settle(page);
        await noOverflow(page);
        const root = await page.locator(".auth-page").boundingBox();
        if (!root) throw new Error("Auth root is missing");
        expect(root.width).toBeGreaterThanOrEqual(w - 2);
        if (w >= 1024) {
          await inside(page.getByRole("button", { name: "Continue with Google" }), h);
          await inside(page.getByRole("button", { name: "Continue with Magic Link" }), h);
        }
        await shot(page, info, "auth", w, h);
      }
    }
  });

  test("Print remains usable and overflow-free", async ({ page }, info) => {
    for (const [w, h] of viewports) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/print");
      await settle(page);
      await noOverflow(page);
      await expect(page.locator(".preview-paper")).toBeVisible();
      await shot(page, info, "print", w, h);
    }
  });
});

test.describe("formal route cross-page smoke", () => {
  test.setTimeout(120_000);
  const routes = [
    "/",
    "/find-questions",
    "/create",
    "/play",
    "/print",
    "/leaderboards",
    "/would-you-rather-questions-for-kids",
    "/funny-would-you-rather-questions",
    "/hard-would-you-rather-questions",
    "/would-you-rather-questions-for-friends",
    "/would-you-rather-questions-for-couples",
    "/sign-in",
    "/sign-up",
    "/auth/magic-link/confirm",
    "/privacy",
    "/terms",
    "/acceptable-use",
    "/refund-policy",
    "/account-deletion",
    "/contact",
  ] as const;
  for (const [w, h] of [
    [390, 844],
    [1024, 768],
    [1440, 900],
  ] as const) {
    test(`formal public surfaces avoid horizontal overflow at ${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      for (const route of routes) {
        const response = await page.goto(route);
        expect(response?.status(), route).toBeLessThan(500);
        await noOverflow(page);
      }
    });
  }
});
