import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { inflateSync } from "node:zlib";
import { expect, test } from "@playwright/test";

type DecodedPng = {
  width: number;
  height: number;
  channels: number;
  data: Uint8Array;
};

function paethPredictor(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function decodePng(png: Buffer): DecodedPng {
  const signature = png.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") throw new Error("Expected a PNG image");

  let offset = 8;
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat: Buffer[] = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const body = png.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      const bitDepth = body[8];
      const colorType = body[9];
      const interlace = body[12];
      if (bitDepth !== 8 || interlace !== 0)
        throw new Error("Pixel evidence decoder requires non-interlaced 8-bit PNGs");
      channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0;
      if (!channels) throw new Error(`Unsupported PNG color type ${colorType}`);
    } else if (type === "IDAT") {
      idat.push(body);
    } else if (type === "IEND") {
      break;
    }
  }
  if (!width || !height || !channels) throw new Error("PNG is missing IHDR metadata");

  const inflated = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const data = new Uint8Array(height * stride);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset++];
    if (filter === undefined) throw new Error("Unexpected end of PNG scanline data");
    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[sourceOffset++];
      if (raw === undefined) throw new Error("Unexpected end of PNG pixel data");
      const left = x >= channels ? data[y * stride + x - channels]! : 0;
      const up = y > 0 ? data[(y - 1) * stride + x]! : 0;
      const upperLeft = y > 0 && x >= channels ? data[(y - 1) * stride + x - channels]! : 0;
      const recon =
        filter === 0
          ? raw
          : filter === 1
            ? raw + left
            : filter === 2
              ? raw + up
              : filter === 3
                ? raw + Math.floor((left + up) / 2)
                : filter === 4
                  ? raw + paethPredictor(left, up, upperLeft)
                  : Number.NaN;
      if (!Number.isFinite(recon)) throw new Error(`Unsupported PNG filter ${filter}`);
      data[y * stride + x] = recon & 0xff;
    }
  }
  return { width, height, channels, data };
}

function rgbAt(image: DecodedPng, pixel: number): readonly [number, number, number] {
  const base = pixel * image.channels;
  if (image.channels === 1) {
    const value = image.data[base]!;
    return [value, value, value];
  }
  return [image.data[base]!, image.data[base + 1]!, image.data[base + 2]!];
}

function comparePngs(reference: Buffer, candidate: Buffer) {
  const expected = decodePng(reference);
  const actual = decodePng(candidate);
  if (expected.width !== actual.width || expected.height !== actual.height) {
    throw new Error(
      `Pixel evidence size mismatch: reference ${expected.width}x${expected.height}, candidate ${actual.width}x${actual.height}`,
    );
  }

  const pixels = expected.width * expected.height;
  let changedPixels = 0;
  let totalAbsoluteDelta = 0;
  let maxChannelDelta = 0;
  for (let pixel = 0; pixel < pixels; pixel += 1) {
    const a = rgbAt(expected, pixel);
    const b = rgbAt(actual, pixel);
    let pixelChanged = false;
    for (let channel = 0; channel < 3; channel += 1) {
      const delta = Math.abs(a[channel]! - b[channel]!);
      totalAbsoluteDelta += delta;
      maxChannelDelta = Math.max(maxChannelDelta, delta);
      if (delta > 8) pixelChanged = true;
    }
    if (pixelChanged) changedPixels += 1;
  }
  return {
    width: expected.width,
    height: expected.height,
    changedPixels,
    changedPixelRatio: changedPixels / pixels,
    meanAbsoluteChannelDelta: totalAbsoluteDelta / (pixels * 3),
    maxChannelDelta,
  };
}

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

test("homepage global brand runtime never requests the frozen reference artwork", async ({
  page,
}) => {
  const requestedPaths: string[] = [];

  page.on("request", (request) => {
    requestedPaths.push(new URL(request.url()).pathname);
  });

  await page.goto("/");
  const logo = page.locator("[data-site-header] img[src='/brand/logo.svg']");
  await expect(logo).toBeVisible();
  await page.waitForLoadState("networkidle");

  const resourcePaths = await page.evaluate(() =>
    (performance.getEntriesByType("resource") as PerformanceResourceTiming[]).map(
      (entry) => new URL(entry.name).pathname,
    ),
  );

  const runtimePaths = [...requestedPaths, ...resourcePaths];
  expect(runtimePaths.filter((path) => path === "/home-art/reference-art.png")).toEqual([]);
  expect(runtimePaths.some((path) => path === "/brand/logo.svg")).toBe(true);
  expect(runtimePaths.some((path) => path === "/home-art/home-logo.webp")).toBe(false);
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

test("778px reference Hero keeps the frozen reconstruction geometry below SiteHeader", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 778, height: 1000 });
  await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator("[data-site-header]")).toHaveCount(1);
  await expect(page.locator("[data-home-design-header]")).toHaveCount(0);

  const headerBox = await page.locator("[data-site-header]").boundingBox();
  const root = await page.locator(".illustrated-home.homepage").boundingBox();
  if (!headerBox || !root) throw new Error("SiteHeader and homepage root must have bounding boxes");
  expect(
    root.y - (headerBox.y + headerBox.height),
    "SiteHeader and homepage root must be vertically adjacent",
  ).toBeCloseTo(0, 1);

  const rectRelativeToRoot = async (selector: string) => {
    const box = await page.locator(selector).first().boundingBox();
    if (!box) throw new Error(`${selector} must have a bounding box`);
    return { ...box, y: box.y - root.y };
  };

  const selectors = {
    hero: ".illustrated-home .hero",
    title: ".illustrated-home .hero-title-img",
    grid: ".illustrated-home .hero #play .choice-grid",
    cta: ".illustrated-home .hero #play .choice-cta",
  } as const;
  const boxes = Object.fromEntries(
    await Promise.all(
      Object.entries(selectors).map(async ([name, selector]) => [
        name,
        await rectRelativeToRoot(selector),
      ]),
    ),
  ) as Record<keyof typeof selectors, Awaited<ReturnType<typeof rectRelativeToRoot>>>;

  const expectBox = (
    name: keyof typeof selectors,
    expected: readonly [number, number, number, number],
  ) => {
    const box = boxes[name];
    expect(box.x, `${name} x`).toBeCloseTo(expected[0], 1);
    expect(box.y, `${name} y relative to homepage root`).toBeCloseTo(expected[1], 1);
    expect(box.width, `${name} width`).toBeCloseTo(expected[2], 1);
    expect(box.height, `${name} height`).toBeCloseTo(expected[3], 1);
  };

  expectBox("hero", [0, 0, 778, 572]);
  expectBox("title", [209.5, -17, 359, 190]);
  expectBox("grid", [125, 225, 525, 180]);
  expectBox("cta", [262, 451, 254, 51]);

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

test("778×2021 lower page matches Authority geometry and emits pixel evidence", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 778, height: 2021 });
  await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");

  const root = await page.locator(".illustrated-home.homepage").boundingBox();
  if (!root) throw new Error("homepage root must have a bounding box");

  const expected = {
    categories: { selector: "#categories", box: [0, 572, 778, 218] },
    highlights: { selector: ".highlights-section", box: [0, 790, 778, 240] },
    how: { selector: "#how-it-works", box: [0, 1030, 778, 140] },
    trending: { selector: "#trending", box: [0, 1170, 778, 290] },
    statistics: { selector: "#statistics", box: [0, 1460, 778, 73] },
    community: { selector: "#community", box: [0, 1533, 778, 273] },
    together: { selector: "#play-together", box: [0, 1806, 778, 155] },
    categoryOne: {
      selector: "#categories .category-card:nth-child(1)",
      box: [33, 626, 106, 135],
    },
    categoryTwo: {
      selector: "#categories .category-card:nth-child(2)",
      box: [144, 626, 112, 135],
    },
    highlightOne: {
      selector: ".highlight-card:nth-child(1)",
      box: [41, 845, 219, 157],
    },
    highlightTwo: {
      selector: ".highlight-card:nth-child(2)",
      box: [274, 845, 226, 157],
    },
    create: { selector: "#trending .create-panel", box: [432, 1214, 314, 237] },
  } as const;

  const measured: Record<string, [number, number, number, number]> = {};
  let maxDeviation = 0;
  for (const [name, contract] of Object.entries(expected)) {
    const locator = page.locator(contract.selector);
    await expect(locator).toHaveCount(1);
    const box = await locator.boundingBox();
    if (!box) throw new Error(`${contract.selector} must have a bounding box`);
    const actual: [number, number, number, number] = [box.x, box.y - root.y, box.width, box.height];
    measured[name] = actual.map((value) => Number(value.toFixed(3))) as [
      number,
      number,
      number,
      number,
    ];
    actual.forEach((value, index) => {
      maxDeviation = Math.max(maxDeviation, Math.abs(value - contract.box[index]!));
    });
  }
  expect(maxDeviation, "maximum lower-page geometry deviation").toBeLessThanOrEqual(0.05);
  expect((await page.locator("#play-together").boundingBox())!.y - root.y + 155).toBeCloseTo(
    1961,
    5,
  );

  await expect(page.locator("#categories .category-card")).toHaveCount(6);
  await expect(page.locator(".highlight-card")).toHaveCount(3);
  await expect(page.locator(".steps-grid > li")).toHaveCount(4);
  await expect(page.locator("#statistics .statistic")).toHaveCount(4);
  await expect(page.locator("#community blockquote")).toHaveCount(4);
  await expect(page.locator("#play-together .occasion-card")).toHaveCount(5);
  await expect(page.locator(".home-live-experience")).toHaveCount(0);
  await expect(page.locator("#question-search")).toHaveCount(0);
  await expect(page.locator(".home-faq")).toHaveCount(0);
  await expect(page.getByText("Real votes from real people around the world.")).toHaveCount(0);
  await expect(page.locator("#community .community-subtitle")).toContainText(
    "not user testimonials",
  );
  await expect(page.locator(".create-button")).toBeDisabled();

  const screenshot = await page.screenshot({
    fullPage: false,
    animations: "disabled",
  });
  await info.attach("home-authority-current-778x2021.png", {
    body: screenshot,
    contentType: "image/png",
  });
  const reference = readFileSync(
    resolve(process.cwd(), "home-reconstruction/evidence/reference.png"),
  );
  const pixelDiff = comparePngs(reference, screenshot);
  const evidence = {
    viewport: [778, 2021],
    measured,
    maxGeometryDeviation: Number(maxDeviation.toFixed(3)),
    pixelDiff,
  };
  console.info(`[HOME-LOWER-AUTHORITY-EVIDENCE] ${JSON.stringify(evidence)}`);
  await info.attach("home-authority-evidence.json", {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: "application/json",
  });
});

const homeViewports = [
  [375, 812],
  [390, 844],
  [393, 852],
  [414, 896],
  [768, 1024],
  [778, 2021],
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
      "#how-it-works",
      "#trending",
      ".create-panel",
      "#statistics",
      "#community",
      "#play-together",
      "footer",
    ]) {
      await expect(page.locator(selector)).toBeVisible();
    }
    await expect(page.locator("[data-home-design-header]")).toHaveCount(0);
    await expect(page.locator("[data-site-header]")).toHaveCount(1);
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
    await expect(page.locator(".home-live-experience")).toHaveCount(0);
    await expect(page.locator("#question-search")).toHaveCount(0);
    await expect(page.locator(".home-faq")).toHaveCount(0);
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

test("presenter remains available on the dedicated play route", async ({ page }) => {
  await page.goto("/play?set=1,2");

  const presenterTrigger = page.getByRole("button", { name: "Present", exact: true });
  await expect(presenterTrigger).toBeVisible();
  await presenterTrigger.click();

  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal.locator(".presenter-header")).toContainText("1 / 2");

  await page.keyboard.press("Escape");
  await expect(modal).toHaveCount(0);
  await expect(presenterTrigger).toBeFocused();
});

test("finder filters remain available on the dedicated Finder route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/find-questions");

  const filterContainer = page.locator('aside[aria-label="Question filters"]');
  await expect(filterContainer).toBeVisible();
  const toggle = filterContainer.getByRole("button", { name: "Filter options" });
  if (await toggle.isVisible()) await toggle.click();

  const filterButtons = filterContainer.locator(".filter-options button");
  expect(await filterButtons.count()).toBeGreaterThan(15);

  const teenBtn = filterContainer.getByRole("button", { name: "Teens", exact: true });
  await teenBtn.click();
  await expect(teenBtn).toHaveAttribute("aria-pressed", "true");
  await filterContainer.getByRole("button", { name: "Apply Filters" }).click();
  await expect(page).toHaveURL(/\/find-questions\?age=teens$/);

  const clearBtn = filterContainer.getByRole("button", { name: "Clear all" });
  await expect(clearBtn).toBeVisible();
  await clearBtn.click();
  await expect(page).toHaveURL(/\/find-questions$/);
});
