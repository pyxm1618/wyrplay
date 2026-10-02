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
    } catch {
      // Storage may be unavailable in unusual contexts.
    }
  });
});

async function openStable(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
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

async function shot(
  page: Page,
  info: TestInfo,
  group: keyof typeof shots,
  width: number,
  height: number,
  suffix = "",
) {
  const size = `${width}x${height}`;
  if (!shots[group].has(size)) return;
  const name = suffix ? `${group}-${suffix}-${size}.png` : `${group}-${size}.png`;
  await page.screenshot({
    path: info.outputPath(name),
    fullPage: false,
    animations: "disabled",
  });
}

test.describe("required responsive viewport matrix", () => {
  test.setTimeout(180_000);

  test("Home full-bleed shell and desktop fold", async ({ page }, info) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openStable(page, "/");

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await noOverflow(page);

      const root = await page
        .locator(".home-main .illustrated-home.homepage")
        .first()
        .boundingBox();
      if (!root) throw new Error("Illustrated home is missing");
      expect(root.width).toBeGreaterThanOrEqual(width - 2);

      if (width >= 1024) {
        await inside(page.locator(".choice-cta").first(), height);
      }
      if (
        (width === 1440 && height === 900) ||
        (width === 1728 && height === 900) ||
        (width === 1920 && height === 1080)
      ) {
        const categories = await page.locator(".categories-section").first().boundingBox();
        if (!categories) throw new Error("Popular Categories is missing");
        expect(categories.y).toBeLessThan(height);
      }

      await shot(page, info, "home", width, height);
    }
  });

  test("Play keeps choices and primary actions reachable", async ({ page }, info) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openStable(page, "/play");

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await noOverflow(page);
      await expect(page.locator(".play-options")).toBeVisible();
      await expect(page.locator(".play-actions")).toBeVisible();

      if (width <= 430) {
        await expect(page.locator(".play-header > nav")).toBeHidden();
        const menu = page.locator(".play-menu > summary");
        await expect(menu).toBeVisible();
        if (width === 390 && height === 844) {
          await menu.click();
          await expect(
            page.locator(".play-menu-panel").getByRole("link", { name: "Home" }),
          ).toBeVisible();
          await menu.click();
          await expect(page.locator(".play-menu-panel")).toBeHidden();
        }
      }

      if (width >= 1024) {
        const choices = await page.locator(".play-options").boundingBox();
        const actions = await page.locator(".play-actions").boundingBox();
        if (!choices || !actions) throw new Error("Play core surface is missing");
        expect(choices.y).toBeLessThan(height);
        expect(actions.y).toBeLessThan(height + 120);
      }

      await shot(page, info, "play", width, height);
    }
  });

  test("Presenter keeps all core controls in one desktop viewport", async ({ page }, info) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openStable(page, "/play");
    await page.getByRole("button", { name: "Present", exact: true }).click();

    const dialog = page.getByRole("dialog");
    const exit = dialog.getByRole("button", { name: "Exit Presenter", exact: true });
    await expect(dialog).toBeVisible();
    await expect(exit).toBeVisible();

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await noOverflow(page);
      await expect(exit).toBeVisible();

      if (width >= 1024) {
        for (const target of [
          dialog.locator(".play-heading"),
          dialog.locator(".play-options"),
          dialog.getByRole("button", { name: "Previous", exact: true }),
          dialog.getByRole("button", { name: "Next", exact: true }),
          exit,
        ]) {
          await inside(target, height);
        }
        const scroll = await dialog.evaluate((element) => ({
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
        }));
        expect(scroll.scrollHeight).toBeLessThanOrEqual(scroll.clientHeight + 1);
      }

      await shot(page, info, "presenter", width, height);
    }

    await exit.click();
  });

  test("Finder is no longer an 849px desktop island", async ({ page }, info) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openStable(page, "/find-questions");

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await noOverflow(page);

      if (width <= 430) {
        await expect(page.locator(".finder-page .site-header > nav")).toBeHidden();
        const menu = page.locator(".finder-menu > summary");
        await expect(menu).toBeVisible();
        if (width === 390 && height === 844) {
          await menu.click();
          await expect(
            page.locator(".finder-menu nav").getByRole("link", { name: "Browse questions" }),
          ).toBeVisible();
          await menu.click();
          await expect(page.locator(".finder-menu nav")).toBeHidden();
        }
      }

      const root = await page.locator(".finder-page").boundingBox();
      if (!root) throw new Error("Finder root is missing");
      expect(root.width).toBeGreaterThanOrEqual(width - 2);

      if (width >= 1100) {
        const directory = await page.locator(".directory").boundingBox();
        if (!directory) throw new Error("Finder directory is missing");
        expect(directory.width).toBeGreaterThanOrEqual(Math.min(width - 64, 1180));
      }

      await shot(page, info, "finder", width, height);
    }
  });

  test("Leaderboard uses a broader controlled functional surface", async ({ page }, info) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openStable(page, "/leaderboards");

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await noOverflow(page);

      if (width >= 1024) {
        const shell = await page.locator(".leaderboard-page .page-shell").boundingBox();
        if (!shell) throw new Error("Leaderboard shell is missing");
        expect(shell.width).toBeGreaterThanOrEqual(Math.min(width - 36, 1510));
      }

      await shot(page, info, "leaderboard", width, height);
    }
  });

  test("Auth fills the viewport and exposes both sign-in choices on desktop", async ({
    page,
  }, info) => {
    for (const route of ["/sign-in", "/sign-up"] as const) {
      await page.setViewportSize({ width: 375, height: 812 });
      await openStable(page, route);
      const suffix = route === "/sign-in" ? "sign-in" : "sign-up";

      for (const [width, height] of viewports) {
        await page.setViewportSize({ width, height });
        await noOverflow(page);

        const root = await page.locator(".auth-page").boundingBox();
        if (!root) throw new Error("Auth root is missing");
        expect(root.width).toBeGreaterThanOrEqual(width - 2);

        if (width >= 1024) {
          await inside(page.getByRole("button", { name: "Continue with Google" }), height);
          await inside(page.getByRole("button", { name: "Continue with Magic Link" }), height);
          const heroCopy = await page.locator(".hero-copy").boundingBox();
          const authCard = await page.locator(".auth-card").boundingBox();
          if (!heroCopy || !authCard) throw new Error("Auth composition is incomplete");
          expect(
            heroCopy.y + heroCopy.height,
            `${route} ${width}x${height}: hero copy must clear the auth card`,
          ).toBeLessThanOrEqual(authCard.y - 4);
        }

        await shot(page, info, "auth", width, height, suffix);
      }
    }
  });

  test("Print remains usable and overflow-free", async ({ page }, info) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openStable(page, "/print");

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await noOverflow(page);
      await expect(page.locator(".preview-paper")).toBeVisible();
      await shot(page, info, "print", width, height);
    }
  });
});

test.describe("formal route cross-page smoke", () => {
  test.setTimeout(180_000);
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

  test("all formal public surfaces avoid horizontal overflow at mobile, tablet and desktop", async ({
    page,
  }) => {
    for (const route of routes) {
      await page.setViewportSize({ width: 390, height: 844 });
      const response = await page.goto(route);
      expect(response?.status(), route).toBeLessThan(500);

      for (const [width, height] of [
        [390, 844],
        [1024, 768],
        [1440, 900],
      ] as const) {
        await page.setViewportSize({ width, height });
        await noOverflow(page);
      }
    }
  });
});
