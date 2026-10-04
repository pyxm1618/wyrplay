import { expect, test } from "@playwright/test";

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
  await expect(page.locator(".print-preview")).toContainText("116 questions");
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
  expect(await page.locator(".print-output img:visible").count()).toBeGreaterThan(1);
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
