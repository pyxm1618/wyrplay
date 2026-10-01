import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const round = process.argv[2] || "round-01";
if (!/^round-\d{2}$/.test(round)) throw new Error("Invalid round");
const directory = resolve(root, "evidence", round);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 868, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
const failures = [];
const apiRequests = [];
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
    apiRequests.push(request.url());
});
try {
  await page.goto("http://127.0.0.1:4188/", { waitUntil: "networkidle" });
  assert.equal(await page.title(), "WYRPLAY — Leaderboards");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
    const image = new Image();
    image.src = "/assets/edge-decoration.png";
    await image.decode();
  });
  const capture = await page.evaluate(await readFile(resolve(directory, "collect.js"), "utf8"));
  await page.screenshot({
    path: resolve(directory, "candidate.png"),
    fullPage: true,
    scale: "css",
    animations: "disabled",
  });
  capture.full_page = true;
  capture.screenshot_scale = "css";
  await writeFile(resolve(directory, "capture.json"), JSON.stringify(capture, null, 2));
  const session = await context.newCDPSession(page);
  await session.send("DOM.enable");
  await session.send("CSS.enable");
  const dom = await session.send("DOM.getDocument");
  const heading = await session.send("DOM.querySelector", {
    nodeId: dom.root.nodeId,
    selector: "#hero-title",
  });
  const fonts = await session.send("CSS.getPlatformFontsForNode", { nodeId: heading.nodeId });
  assert.ok(fonts.fonts.some((font) => font.isCustomFont && font.glyphCount > 0));
  await page.getByRole("button", { name: "Save question 4", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Unsave question 4", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: "Like question 4", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Like question 4", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.locator(".category-tabs").getByRole("button", { name: "Trending" }).click();
  assert.equal(
    await page
      .locator(".sidebar")
      .getByRole("button", { name: "Trending", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.match(await page.locator(".question-card.travel h3").innerText(), /Explore space/);
  await page.locator(".category-tabs").getByRole("button", { name: "Most Popular" }).click();
  await page
    .locator(".period-tabs")
    .getByRole("button", { name: "This Month", exact: true })
    .click();
  assert.equal(
    await page
      .locator(".period-tabs")
      .getByRole("button", { name: "This Month", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.locator(".period-tabs").getByRole("button", { name: "All Time", exact: true }).click();
  await page.getByRole("button", { name: "Search questions", exact: true }).click();
  await page.getByRole("searchbox").fill("pizza");
  assert.equal(await page.locator(".search-results button").count(), 1);
  await page.getByRole("searchbox").fill("zzz-no-match");
  assert.match(await page.locator(".search-results").innerText(), /No matching/);
  await page.getByRole("searchbox").blur();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.locator(".footer-cta").getByRole("button", { name: "Create a Question" }).click();
  await page.getByLabel("First option").fill("visit the moon");
  await page.getByLabel("Second option").fill("explore the ocean");
  await page.getByRole("button", { name: "Preview Question" }).click();
  assert.equal(
    await page.locator(".question-preview").innerText(),
    "Would you rather visit the moon or explore the ocean?",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.locator(".question-card.travel .question-open").click();
  await page.locator(".choice-buttons button").first().click();
  assert.match(await page.locator(".choice-feedback").innerText(), /You chose/);
  await page.keyboard.press("Escape");
  await page.locator(".pagination").getByRole("button", { name: "2", exact: true }).click();
  assert.match(await page.locator("dialog").innerText(), /not connected/);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  assert.match(await page.locator("dialog").innerText(), /not connected/);
  await page.keyboard.press("Escape");
  const viewports = [];
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `Overflow at ${width}`,
    );
    await page.screenshot({
      path: resolve(directory, `viewport-${width}.png`),
      fullPage: true,
      scale: "css",
      animations: "disabled",
    });
    viewports.push({ width, overflow: false });
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  assert.deepEqual(apiRequests, []);
  const report = {
    status: "passed",
    viewports,
    errors,
    failures,
    apiRequests,
    fonts: fonts.fonts,
    operations: [
      "save",
      "like",
      "category sorting",
      "time-period demo sorting",
      "search results",
      "search empty state",
      "create local preview",
      "question choice",
      "pagination scope feedback",
      "account scope feedback",
      "Escape dismissal",
    ],
  };
  await writeFile(resolve(directory, "browser-checks.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
