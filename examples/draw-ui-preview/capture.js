const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:8089";
const OUT_DIR = path.join(__dirname, "screenshots");
const ARTIFACT_DIR =
  "/Users/milushangdi/.gemini/antigravity/brain/f6718398-202c-4e90-9cc5-7cb6e6d3427f/screenshots";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function saveScreenshot(page, filename) {
  const p1 = path.join(OUT_DIR, filename);
  const p2 = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: p1, fullPage: false });
  fs.copyFileSync(p1, p2);
  console.log(`Saved screenshot: ${filename}`);
}

async function run() {
  console.log("Launching Chromium for visual inspection...");
  const browser = await chromium.launch({ headless: true });

  const errors = [];

  // ==========================================
  // 1. DESKTOP VIEWPORT (1440x900)
  // ==========================================
  console.log("\n--- Testing Desktop (1440x900) ---");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await desktopContext.newPage();
  page.on("pageerror", (err) => errors.push(`Desktop Page Error: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`Desktop Console Error: ${msg.text()}`);
  });

  // 1.1 Homepage
  await page.goto(`${BASE_URL}/#home`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await saveScreenshot(page, "01_home_desktop.png");

  // 1.2 Category Page (Kids)
  await page.click('button[data-view="view-category"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "02_category_kids_desktop.png");

  // 1.3 Play / Duel Arena Page (Pre-vote)
  await page.click('button[data-view="view-play"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "03_play_arena_desktop.png");

  // 1.4 Click Option A (Simulate Live Vote with percentage expansion)
  await page.click("#playCardA");
  await page.waitForTimeout(600);
  await saveScreenshot(page, "04_play_voted_desktop.png");

  // 1.5 Full Vote Results Analysis View
  await page.click('button[data-view="view-results"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "05_results_breakdown_desktop.png");

  // 1.6 Login / Magic Link Auth
  await page.click('button[data-view="view-auth"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "06_auth_login_desktop.png");

  // 1.7 Account & Profile Dashboard
  await page.click('button[data-view="view-account"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "07_account_profile_desktop.png");

  // 1.8 Design System Preview
  await page.click('button[data-view="view-design-system"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "08_design_system_desktop.png");

  // 1.9 Light Theme Switch Check (Homepage in Light Theme)
  await page.click('button[data-view="view-home"]');
  await page.waitForTimeout(200);
  await page.click('button[onclick="toggleTheme()"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "09_home_light_desktop.png");

  await desktopContext.close();

  // ==========================================
  // 2. MOBILE VIEWPORT (390x844 - iPhone 14/15)
  // ==========================================
  console.log("\n--- Testing Mobile (390x844) ---");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  mobilePage.on("pageerror", (err) => errors.push(`Mobile Page Error: ${err.message}`));

  // 2.1 Mobile Homepage
  await mobilePage.goto(`${BASE_URL}/#home`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(500);
  await saveScreenshot(mobilePage, "10_home_mobile.png");

  // 2.2 Mobile Duel Arena (Play)
  await mobilePage.click('button[data-view="view-play"]');
  await mobilePage.waitForTimeout(400);
  await saveScreenshot(mobilePage, "11_play_arena_mobile.png");

  // 2.3 Mobile Vote Interaction
  await mobilePage.click("#playCardA");
  await mobilePage.waitForTimeout(600);
  await saveScreenshot(mobilePage, "12_play_voted_mobile.png");

  // 2.4 Mobile Category Page
  await mobilePage.click('button[data-view="view-category"]');
  await mobilePage.waitForTimeout(400);
  await saveScreenshot(mobilePage, "13_category_kids_mobile.png");

  // 2.5 Mobile Account Page
  await mobilePage.click('button[data-view="view-account"]');
  await mobilePage.waitForTimeout(400);
  await saveScreenshot(mobilePage, "14_account_mobile.png");

  await mobileContext.close();
  await browser.close();

  console.log("\nInspection complete!");
  if (errors.length > 0) {
    console.error("Captured errors during inspection:", errors);
    process.exit(1);
  } else {
    console.log("Zero errors detected! All pages and states rendered with perfect stability.");
  }
}

run().catch((err) => {
  console.error("Capture execution failed:", err);
  process.exit(1);
});
