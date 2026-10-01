import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const round = process.argv[2] ?? "round-01";
if (!/^round-\d{2}$/.test(round)) throw new Error(`Invalid round: ${round}`);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1024, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [],
  failures = [],
  apiRequests = [],
  results = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("requestfailed", (request) => failures.push(request.url()));
page.on("request", (request) => {
  if (
    ["xhr", "fetch"].includes(request.resourceType()) ||
    request.method() !== "GET" ||
    new URL(request.url()).pathname.startsWith("/api/")
  )
    apiRequests.push(request.url());
});
try {
  for (const mode of ["login", "signup"]) {
    await page.setViewportSize({ width: 1024, height: 900 });
    const url = `http://127.0.0.1:4189/${mode === "signup" ? "sign-up/" : ""}`;
    await page.goto(url, { waitUntil: "networkidle" });
    assert.equal(
      await page.title(),
      mode === "signup" ? "WYRPLAY — Create Your Account" : "WYRPLAY — Sign In",
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode()));
      window.scrollTo(0, 0);
    });
    const directory = resolve(root, "evidence", mode, round);
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
    const document = await session.send("DOM.getDocument");
    const node = await session.send("DOM.querySelector", {
      nodeId: document.root.nodeId,
      selector: ".auth-card h2",
    });
    const fonts = await session.send("CSS.getPlatformFontsForNode", { nodeId: node.nodeId });
    assert.ok(fonts.fonts.some((font) => font.isCustomFont && font.glyphCount > 0));
    await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
    assert.match(await page.locator("dialog").innerText(), /No sign-in or account creation/);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Continue with Magic Link", exact: true }).click();
    await page.getByLabel("Email address").fill("designer@example.com");
    await page.getByRole("button", { name: "Preview Magic Link", exact: true }).click();
    assert.match(await page.getByRole("status").innerText(), /no email was sent/);
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.getByRole("button", { name: "Search questions", exact: true }).click();
    await page.getByLabel("Search demo questions").fill("pizza");
    assert.equal(await page.locator(".search-results li").count(), 1);
    await page.getByLabel("Search demo questions").fill("zz-no-result");
    assert.match(await page.locator("dialog").innerText(), /No matching/);
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.getByRole("button", { name: "Questions", exact: true }).click();
    assert.match(await page.locator("dialog").innerText(), /isn’t included/);
    await page.keyboard.press("Escape");
    const responsive = [];
    await mkdir(resolve(root, "evidence/viewports"), { recursive: true });
    for (const width of [390, 700, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: resolve(root, "evidence/viewports", `${mode}-${round}-${width}.png`),
        fullPage: true,
        scale: "css",
        animations: "disabled",
      });
      const geometry = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      assert.ok(
        geometry.scrollWidth <= width,
        `Overflow: ${mode} at ${width}: ${geometry.scrollWidth}`,
      );
      await page.getByRole("button", { name: "Continue with Magic Link", exact: true }).click();
      assert.equal(await page.locator("dialog").evaluate((dialog) => dialog.open), true);
      await page.keyboard.press("Escape");
      responsive.push(geometry);
    }
    results.push({ mode, url, actualFonts: fonts.fonts, responsive });
  }
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await page.waitForURL("http://127.0.0.1:4189/");
  await page.locator(".signup-prompt a").click();
  await page.waitForURL("http://127.0.0.1:4189/sign-up/");
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  assert.deepEqual(apiRequests, []);
  const report = {
    status: "pass",
    round,
    results,
    checks: [
      "static export routes",
      "images decoded",
      "actual custom heading font",
      "Google demo boundary",
      "Magic Link local email form",
      "search and empty result",
      "navigation demo boundary",
      "Escape and close",
      "route switching",
      "three responsive widths per page",
      "zero API requests",
      "zero runtime errors",
    ],
    errors,
    failures,
    apiRequests,
  };
  await writeFile(
    resolve(root, "evidence", `browser-${round}.json`),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
