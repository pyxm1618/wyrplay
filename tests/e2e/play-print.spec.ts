import { expect, test } from "@playwright/test";

import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import { filterPrintQuestions } from "@/modules/would-you-rather/domain/print-question-pool";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("creat-web:analytics-consent:v1", "denied");
    } catch {
      // ignore storage restrictions in unusual browser contexts
    }
  });
});
test("selected set survives play, voting, presentation and return", async ({ page }) => {
  await page.goto("/find-questions");
  await page.getByRole("searchbox").fill("plans");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".panel-heading")).toContainText("matching questions");
  await page.locator(".select-button").nth(0).click();
  await page.locator(".select-button").nth(1).click();
  await page.getByRole("button", { name: "Play these questions" }).click();
  await expect(page).toHaveURL(/\/play\?/);
  await expect(page.locator(".question-navigation")).toContainText("1 / 2");
  const optA = page.getByRole("button", { name: "Choose option A" });
  await expect(optA).toBeVisible();
  await expect(optA).toHaveText("Choose This");
  await optA.click();
  await expect(optA).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Choose option B" }).click();
  await expect(page.getByRole("button", { name: "Choose option B" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  let presentationVotes = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/wyr/vote")) presentationVotes++;
  });
  await page.getByRole("button", { name: "Present", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator(".presenter-header")).toContainText("2 / 2");
  await expect(dialog.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  expect(presentationVotes).toBe(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page.getByRole("link", { name: "Back to questions" }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("plans");
  await expect(page.locator(".selection-bar h3")).toHaveText("2 selected questions");
});
test("both print formats produce a PDF with matching pages and paper size", async ({ page }) => {
  await page.goto("/print");
  await expect(page.locator(".preview-paper")).toBeVisible();
  await expect(page.locator(".print-preview")).toContainText("457 questions");
  await page.getByRole("button", { name: "Question Sheet", exact: false }).click();
  await expect(page.locator(".print-preview h2")).toContainText("Question Sheet");
  await page.getByRole("radio", { name: "A4" }).check();
  await expect(page.locator(".preview-paper")).toBeVisible();
  await page.getByRole("switch").uncheck();
  await expect(page.getByRole("switch")).not.toBeChecked();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  const result = await download;
  await result.saveAs(".artifacts/play-migration/sheet-output.pdf");
  expect(result.suggestedFilename()).toBe("wyrplay-sheet-a4.pdf");
  await page.getByRole("button", { name: "Cut-out Cards", exact: false }).click();
  await expect(page.locator(".print-preview h2")).toContainText("Cut-out Cards");
  const cards = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  await (await cards).saveAs(".artifacts/play-migration/cards-output.pdf");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".print-workspace")).not.toBeVisible();
  await expect(page.locator(".print-output")).toHaveCount(0);
  const pageText = await page.locator(".print-preview header p").textContent();
  const expectedPages = Number(pageText?.match(/of (\d+)/)?.[1]);
  await expect(page.locator(".print-document .print-page-sheet:visible")).toHaveCount(
    expectedPages,
  );
});
test("direct print entry builds a set by theme, audience and scenario", async ({ page }) => {
  const funnyCount = filterPrintQuestions(QUESTIONS_DATABASE, { collection: "funny" }).length;
  const kidsCount = filterPrintQuestions(QUESTIONS_DATABASE, { age: "kids" }).length;
  const partyCount = filterPrintQuestions(QUESTIONS_DATABASE, { occasion: "party" }).length;

  expect(funnyCount).toBeGreaterThan(0);
  expect(kidsCount).toBeGreaterThan(0);
  expect(partyCount).toBeGreaterThan(0);

  await page.goto("/print");
  await expect(page.getByRole("heading", { name: "Choose Questions" })).toBeVisible();
  await expect(page.getByLabel("Theme")).toBeVisible();
  await expect(page.getByLabel("Audience / Age")).toBeVisible();
  await expect(page.getByLabel("Scenario")).toBeVisible();

  await page.getByLabel("Theme").selectOption("funny");
  await page.getByRole("button", { name: "Generate question set" }).click();
  await expect(page.locator(".print-pool")).toContainText(`${funnyCount} questions`);

  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByLabel("Audience / Age").selectOption("kids");
  await page.getByRole("button", { name: "Generate question set" }).click();
  await expect(page.locator(".print-pool")).toContainText(`${kidsCount} questions`);

  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByLabel("Scenario").selectOption("party");
  await page.getByRole("button", { name: "Generate question set" }).click();
  await expect(page.locator(".print-pool")).toContainText(`${partyCount} questions`);
  await expect(page.locator(".preview-paper")).toBeVisible();
});

test("finder print set stays exact until the user chooses a different set", async ({ page }) => {
  await page.goto("/print?set=1,2");
  await expect(page.locator(".print-pool")).toContainText("2 questions from your selected set");
  await expect(page.getByText("Using your exact Finder selection.")).toBeVisible();
  await expect(page.getByLabel("Theme")).toHaveCount(0);

  await page.getByRole("button", { name: "Choose a different set" }).click();
  await expect(page.getByLabel("Theme")).toBeVisible();
  await expect(page.locator(".print-pool")).toContainText("457 questions in this generated set");
});

test("invalid sets and small screens remain usable", async ({ page }) => {
  await page.goto("/play?set=unknown");
  await expect(page.locator("#play")).toContainText("No approved questions in this set");
  await page.goto("/print?set=unknown");
  await expect(page.getByRole("status")).toContainText("No approved questions");
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeDisabled();
  for (const path of ["/play", "/print"]) {
    await page.goto(path);
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test("play saves persist and shared links identify the actual question", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => Object.defineProperty(navigator, "share", { value: undefined }));
  await page.goto("/play");
  const save = page.getByRole("button", { name: "Save", exact: false }).first();
  await save.click();
  await expect(save).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByRole("button", { name: "Saved", exact: false })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Share", exact: false }).click();
  await expect(page.getByRole("status")).toContainText("Question link copied");
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(shared).searchParams.get("question")).toBe("wyr-000001");
});

test("native sharing receives the current question link", async ({ page }) => {
  let sharedUrl = "";
  await page.exposeFunction("captureNativeShare", (payload: { url: string }) => {
    sharedUrl = payload.url;
  });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "share", {
      value: (payload: ShareData) =>
        (
          window as unknown as { captureNativeShare: (payload: ShareData) => Promise<void> }
        ).captureNativeShare(payload),
    }),
  );
  await page.goto("/play");
  await page.getByRole("button", { name: "Share", exact: false }).click();
  await expect.poll(() => sharedUrl).toContain("question=wyr-000001");
});

test("presenter scales properly on 4K/2K and fits within 1024x768 projector without clipping", async ({
  page,
}) => {
  await page.goto("/play");
  await page.getByRole("button", { name: "Present", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // 4K 大屏测试
  await page.setViewportSize({ width: 3840, height: 2160 });
  const optionsBox4k = await dialog.locator(".play-options").boundingBox();
  expect(optionsBox4k).not.toBeNull();
  // 验证突破了旧版 1385px 限制，适度放大成为视觉主体
  expect(optionsBox4k!.width).toBeGreaterThan(1600);
  await expect(dialog.locator(".presenter-shortcuts")).toBeVisible();

  // 1024x768 4:3 投影测试
  await page.setViewportSize({ width: 1024, height: 768 });
  const exitBtn = dialog.getByRole("button", { name: "Exit Presenter" });
  await expect(exitBtn).toBeVisible();
  const exitBox = await exitBtn.boundingBox();
  expect(exitBox!.y).toBeGreaterThanOrEqual(0);
  expect(exitBox!.y + exitBox!.height).toBeLessThanOrEqual(768);

  const nextBtn = dialog.getByRole("button", { name: "Next", exact: true });
  await expect(nextBtn).toBeVisible();
  const nextBox = await nextBtn.boundingBox();
  expect(nextBox!.y + nextBox!.height).toBeLessThanOrEqual(768);
});

test("space key on Exit button triggers exit rather than advancing question", async ({ page }) => {
  await page.goto("/play");
  await page.getByRole("button", { name: "Present", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".presenter-header")).toContainText("1 /");

  const exitBtn = dialog.getByRole("button", { name: "Exit Presenter" });
  await exitBtn.focus();
  await expect(exitBtn).toBeFocused();

  // 焦点在 Exit 按钮上按 Space，必须退出 Presenter，绝不能前进到下一题
  await page.keyboard.press("Space");
  await expect(dialog).toHaveCount(0);
});

test("print preview adapts without horizontal overflow and supports PNG download", async ({
  page,
}) => {
  await page.goto("/print");
  await expect(page.locator(".preview-paper")).toBeVisible();

  // 验证预览视口在桌面视口下无横向滚动条溢出
  const hasOverflow = await page.locator(".preview-paper-viewport").evaluate((el) => {
    return el.scrollWidth > el.clientWidth;
  });
  expect(hasOverflow).toBe(false);

  // 验证 PNG 导出
  const pngDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  const result = await pngDownload;
  expect(result.suggestedFilename()).toBe("wyrplay-cards-letter-page-1.png");
});
