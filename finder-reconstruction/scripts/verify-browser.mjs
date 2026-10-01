import { chromium, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const round = process.argv[2] ?? "round-01";
if (!/^round-\d{2}$/.test(round)) throw Error("Invalid round");
const folder = new URL(`../evidence/${round}/`, import.meta.url);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 849, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const errors = [];
const requests = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (["fetch", "xhr"].includes(r.resourceType()) || r.url().includes("/api/"))
    requests.push(r.url());
});
try {
  await page.goto("http://127.0.0.1:4191/", { waitUntil: "networkidle" });
  assert.equal(await page.title(), "WYRPLAY — Find Questions");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.decode()));
  });
  await page.screenshot({
    path: new URL("candidate.png", folder).pathname,
    fullPage: true,
    scale: "css",
    animations: "disabled",
  });
  const capture = await page.evaluate(await readFile(new URL("collect.js", folder), "utf8"));
  capture.full_page = true;
  capture.screenshot_scale = "css";
  await writeFile(new URL("capture.json", folder), JSON.stringify(capture, null, 2));
  await expect(page.locator(".question-card")).toHaveCount(10);
  await page.locator(".select-button").first().click();
  await expect(page.locator(".selection-bar h3")).toHaveText("1 selected questions");
  await page.locator(".bookmark").first().click();
  await expect(page.locator(".bookmark").first()).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Play these questions" }).click();
  assert.equal(await page.locator("dialog").evaluate((d) => d.open), true);
  await page.getByRole("button", { name: "Pause time", exact: true }).click();
  await expect(page.locator(".demo-result")).toContainText("You chose A");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").evaluate((d) => d.open), false);
  await page.getByRole("button", { name: "Present", exact: true }).click();
  assert.equal(await page.locator("dialog").getAttribute("class"), "play-dialog presenter");
  await page.getByRole("button", { name: "Close player" }).click();
  await page.getByRole("searchbox").fill("dragon");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(1);
  await page.getByRole("searchbox").fill("no-match-xyz");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".empty-state")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear search & filters" }).click();
  await page.locator(".filter-options").getByRole("button", { name: "Kids", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(10);
  await page.getByRole("button", { name: "Apply Filters" }).click();
  await expect(page.locator(".question-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(10);
  for (const width of [390, 700, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({
      path: new URL(`viewport-${width}.png`, folder).pathname,
      fullPage: true,
      scale: "css",
      animations: "disabled",
    });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      `Overflow at ${width}`,
    );
  }
  await page.emulateMedia({ media: "print" });
  assert.equal(await page.locator(".question-card:visible").count(), 1);
  await page.emulateMedia({ media: "screen" });
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  await writeFile(
    new URL("interactions.json", folder),
    JSON.stringify(
      {
        status: "passed",
        viewports: [849, 390, 700, 1024],
        checks: [
          "10 original questions",
          "selection counter",
          "save toggle",
          "play and choose",
          "Escape closes dialog",
          "presentation mode",
          "keyword search",
          "empty state",
          "filters apply on request",
          "clear filters",
          "no horizontal overflow",
          "print selected only",
          "no JS errors",
          "no API requests",
        ],
        errors,
        requests,
      },
      null,
      2,
    ),
  );
  console.log("Browser capture and 14 interaction checks passed.");
} finally {
  await browser.close();
}
