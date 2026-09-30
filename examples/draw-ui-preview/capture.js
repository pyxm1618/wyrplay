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

async function checkHorizontalScroll(page, label) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  if (scrollWidth > clientWidth) {
    console.warn(
      `[WARNING] Horizontal scroll detected on ${label}: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`,
    );
  } else {
    console.log(`[PASS] Responsive layout clean (no overflow) on ${label}`);
  }
}

async function run() {
  console.log("Launching Chromium for visual inspection of Preview V2...");
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
  await checkHorizontalScroll(page, "Desktop Homepage");
  await saveScreenshot(page, "01_home_desktop.png");

  // 1.2 Universal SEO Collection Template (Kids)
  await page.click('button[data-view="view-collection-template"]');
  await page.waitForTimeout(400);
  await checkHorizontalScroll(page, "Desktop Collection Template (Kids)");
  await saveScreenshot(page, "02_tpl_seo_collection_desktop.png");

  // 1.3 Universal SEO Collection Template Switch to Friends
  await page.evaluate(() => window.loadCollectionTemplate("friends"));
  await page.waitForTimeout(300);
  await saveScreenshot(page, "03_tpl_seo_friends_desktop.png");

  // 1.4 Play Arena (Pre-vote state with genuine question)
  await page.click('button[data-view="view-play"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "04_play_arena_desktop.png");

  // 1.5 Click Option A (Choose stance & debate prompt, no fake stats)
  await page.click("#playCardA");
  await page.waitForTimeout(400);
  await saveScreenshot(page, "05_play_voted_desktop.png");

  // 1.6 Results Breakdown View (with explicit Concept tag)
  await page.click('button[data-view="view-results"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "06_results_concept_desktop.png");

  // 1.7 Universal Account Subpage Template (Credits Ledger & 5 Metrics)
  await page.click('button[data-view="view-account"]');
  await page.waitForTimeout(300);
  await page.evaluate(() => window.switchAccountSubTab("credits"));
  await page.waitForTimeout(400);
  await checkHorizontalScroll(page, "Desktop Account Credits Ledger");
  await saveScreenshot(page, "07_tpl_account_credits_desktop.png");

  // 1.8 Universal Account Subpage Template (Billing & Orders)
  await page.evaluate(() => window.switchAccountSubTab("billing"));
  await page.waitForTimeout(400);
  await saveScreenshot(page, "08_tpl_account_billing_desktop.png");

  // 1.9 Universal Legal / Utility Template (Privacy Notice)
  await page.click('button[data-view="view-legal-template"]');
  await page.waitForTimeout(400);
  await checkHorizontalScroll(page, "Desktop Legal Template");
  await saveScreenshot(page, "09_tpl_legal_privacy_desktop.png");

  // 1.10 Auth View (Magic Link)
  await page.click('button[data-view="view-auth"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "10_auth_login_desktop.png");

  // 1.11 Design System Tokens & Components
  await page.click('button[data-view="view-design-system"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "11_design_system_desktop.png");

  // 1.12 Light Theme Switch Check (Homepage in Light Theme)
  await page.click('button[data-view="view-home"]');
  await page.waitForTimeout(200);
  await page.click('button[onclick="toggleTheme()"]');
  await page.waitForTimeout(400);
  await saveScreenshot(page, "12_home_light_desktop.png");

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
  await checkHorizontalScroll(mobilePage, "Mobile Homepage");
  await saveScreenshot(mobilePage, "13_home_mobile.png");

  // 2.2 Mobile Universal Collection Template
  await mobilePage.click('button[data-view="view-collection-template"]');
  await mobilePage.waitForTimeout(400);
  await checkHorizontalScroll(mobilePage, "Mobile Collection Template");
  await saveScreenshot(mobilePage, "14_tpl_collection_mobile.png");

  // 2.3 Mobile Play Arena
  await mobilePage.click('button[data-view="view-play"]');
  await mobilePage.waitForTimeout(400);
  await checkHorizontalScroll(mobilePage, "Mobile Play Arena");
  await saveScreenshot(mobilePage, "15_play_mobile.png");

  // 2.4 Mobile Account Template (Overview & Credits)
  await mobilePage.click('button[data-view="view-account"]');
  await mobilePage.waitForTimeout(400);
  await checkHorizontalScroll(mobilePage, "Mobile Account Template");
  await saveScreenshot(mobilePage, "16_tpl_account_mobile.png");

  // 2.5 Mobile Legal Template
  await mobilePage.click('button[data-view="view-legal-template"]');
  await mobilePage.waitForTimeout(400);
  await checkHorizontalScroll(mobilePage, "Mobile Legal Template");
  await saveScreenshot(mobilePage, "17_tpl_legal_mobile.png");

  await mobileContext.close();
  await browser.close();

  console.log("\n--- Visual & Error Summary ---");
  if (errors.length === 0) {
    console.log("SUCCESS: 0 Console/Page errors detected!");
  } else {
    console.error(`Detected ${errors.length} errors:`, errors);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
