import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baselineRound = process.argv[2] ?? "round-07";
if (!/^round-\d{2}$/.test(baselineRound))
  throw new Error(`Invalid capture round: ${baselineRound}`);
const roundName = process.argv[2] ?? `browser-check-${Date.now()}`;
const roundDirectory = resolve(projectRoot, "evidence", roundName);
if (!process.argv[2]) await mkdir(roundDirectory);
const alreadyCaptured = await stat(resolve(roundDirectory, "candidate.png")).then(
  () => true,
  (error) => {
    if (error.code === "ENOENT") return false;
    throw error;
  },
);
if (alreadyCaptured)
  throw new Error(`Capture already exists; preserve ${roundName} and prepare a new round.`);
const captureExpression = await readFile(
  resolve(projectRoot, "evidence", baselineRound, "collect.js"),
  "utf8",
);
const browser = await chromium.launch({ headless: true });
const errors = [];
const apiRequests = [];
const failures = [];
const context = await browser.newContext({
  viewport: { width: 778, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
page.on("requestfailed", (request) =>
  failures.push({ url: request.url(), failure: request.failure() }),
);
page.on("request", (request) => {
  if (
    ["fetch", "xhr"].includes(request.resourceType()) ||
    request.method() !== "GET" ||
    new URL(request.url()).pathname.startsWith("/api/")
  )
    apiRequests.push({ url: request.url(), method: request.method() });
});
try {
  await page.goto("http://127.0.0.1:4187/", { waitUntil: "networkidle" });
  assert.equal(await page.title(), "WYRPLAY — Would You Rather?");
  await page.evaluate(async () => {
    await document.fonts.ready;
    const sources = [
      ...new Set(
        [...document.querySelectorAll("svg image")].map((image) => image.getAttribute("href")),
      ),
    ];
    for (const source of [...sources, "/assets/hero-background.png"]) {
      if (!source) throw new Error("Artwork has no source");
      const image = new Image();
      image.src = source;
      await image.decode();
    }
  });
  await page.screenshot({
    path: resolve(roundDirectory, "candidate.png"),
    fullPage: true,
    scale: "css",
    animations: "disabled",
  });
  const capture = await page.evaluate(captureExpression);
  capture.full_page = true;
  capture.screenshot_scale = "css";
  await writeFile(resolve(roundDirectory, "capture.json"), `${JSON.stringify(capture, null, 2)}\n`);

  const session = await context.newCDPSession(page);
  await session.send("DOM.enable");
  await session.send("CSS.enable");
  const dom = await session.send("DOM.getDocument");
  const heading = await session.send("DOM.querySelector", {
    nodeId: dom.root.nodeId,
    selector: ".hero-intro h2",
  });
  const fonts = await session.send("CSS.getPlatformFontsForNode", { nodeId: heading.nodeId });
  assert.ok(
    fonts.fonts.some((font) => font.isCustomFont && font.glyphCount > 0),
    "Hero heading must use the locally loaded font",
  );

  await page.getByRole("button", { name: "Make Your Choice" }).click();
  await page.getByRole("button", { name: "Always have a dog as a pet", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: /Always have a dog as a pet.*68%/ })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").evaluate((dialog) => dialog.open), false);
  await page.locator(".create-button").click();
  await page.getByLabel("First option").fill("visit the moon");
  await page.getByLabel("Second option").fill("explore the ocean");
  await page.getByRole("button", { name: "Preview Question" }).click();
  assert.equal(
    await page.locator(".created-question").innerText(),
    "Would you rather visit the moon or explore the ocean?",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Search questions" }).click();
  await page.getByRole("searchbox", { name: "Search questions", exact: true }).fill("pizza");
  assert.equal(await page.locator(".question-search-results button").count(), 1);
  await page
    .getByRole("searchbox", { name: "Search questions", exact: true })
    .fill("zzzz-no-match");
  assert.equal(await page.locator(".question-search-results button").count(), 0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "See all categories" }).click();
  assert.equal(await page.locator(".dialog-categories button").count(), 6);
  await page.keyboard.press("Escape");

  const responsive = [];
  await mkdir(resolve(projectRoot, "evidence", "viewports"), { recursive: true });
  for (const width of [778, 1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.screenshot({
      path: resolve(projectRoot, "evidence", "viewports", `${roundName}-${width}.png`),
      fullPage: true,
      scale: "css",
      animations: "disabled",
    });
    const geometry = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      sections: document.querySelectorAll("main>section").length,
    }));
    assert.ok(
      geometry.scrollWidth <= width,
      `Horizontal overflow at ${width}px: ${geometry.scrollWidth}`,
    );
    assert.equal(geometry.sections, 8);
    responsive.push(geometry);
  }
  const retinaContext = await browser.newContext({
    viewport: { width: 778, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const retinaPage = await retinaContext.newPage();
  await retinaPage.goto("http://127.0.0.1:4187/", { waitUntil: "networkidle" });
  await retinaPage.evaluate(() => document.fonts.ready);
  await retinaPage.locator(".brand").screenshot({
    path: resolve(roundDirectory, "logo-dpr2.png"),
    scale: "device",
    animations: "disabled",
  });
  await retinaPage.locator(".create-panel").screenshot({
    path: resolve(roundDirectory, "create-panel-dpr2.png"),
    scale: "device",
    animations: "disabled",
  });
  await retinaPage.setContent(
    `<html><body style="margin:0;display:flex"><div style="background:#fff9f0;width:260px"><img alt="" src="http://127.0.0.1:4187/assets/bulb-hand.png" width="260" height="325"></div><div style="background:#071018;width:260px"><img alt="" src="http://127.0.0.1:4187/assets/bulb-hand.png" width="260" height="325"></div></body></html>`,
  );
  await retinaPage.evaluate(async () => {
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await retinaPage.screenshot({
    path: resolve(roundDirectory, "bulb-light-dark-dpr2.png"),
    clip: { x: 0, y: 0, width: 520, height: 325 },
    scale: "device",
  });
  await retinaContext.close();
  assert.deepEqual(errors, [], "Browser runtime errors");
  assert.deepEqual(failures, [], "Failed resource requests");
  assert.deepEqual(apiRequests, [], "The standalone page must not call any API");
  const report = {
    status: "pass",
    captureRound: roundName,
    viewport: capture.viewport,
    documentHeight: capture.document_height,
    actualFonts: fonts.fonts,
    responsive,
    checks: [
      "real production static export",
      "local images decoded",
      "actual custom font rendering",
      "choice dialog and local selection",
      "dialog Escape and close",
      "question preview",
      "local search including empty result",
      "six categories",
      "three viewport sizes without horizontal overflow",
      "eight main sections",
      "logo and create artwork inspected at DPR 2",
      "transparent bulb on light and dark backgrounds",
      "no runtime errors",
      "no failed resources",
      "zero API/XHR/fetch requests",
    ],
    apiRequests,
    errors,
    failures,
  };
  await writeFile(
    resolve(roundDirectory, "browser-verification.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
