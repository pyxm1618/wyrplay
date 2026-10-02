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

test("finder uses the source bank, draft filters, real pagination and persistent local saves", async ({
  page,
}) => {
  await page.goto("/find-questions");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Find Would You Rather Questions");
  await expect(page.locator(".question-card")).toHaveCount(10);
  await expect(page.locator(".panel-heading")).toContainText("116 curated questions");
  await expect(page.locator(".question-card").first()).toContainText(
    "hear a squirrel tell stories",
  );
  await expect(page.locator(".question-stats").first()).not.toContainText("Loading");
  await page.getByRole("button", { name: "Save question 1", exact: true }).click();
  await page.getByRole("button", { name: "Unsave question 1", exact: true }).isVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Unsave question 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".select-button").first().click();
  await expect(page.locator(".selection-bar h3")).toHaveText("1 selected questions");
  await page.getByRole("button", { name: "Page 12", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(6);
  await expect(page.locator(".question-number").first()).toHaveText("111");
  await expect(page.locator(".selection-bar h3")).toHaveText("1 selected questions");
  await page.getByRole("searchbox").fill("hear");
  await expect(page.locator(".question-number").first()).toHaveText("111");
  await expect(page.locator(".question-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(6);
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("1");
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await page.getByRole("button", { name: "Hard", exact: true }).click();
  await expect(page.locator(".panel-heading")).toContainText("116");
  await page.getByRole("button", { name: "Apply Filters" }).click();
  await expect(page.locator(".panel-heading")).toContainText("73 matching questions");
  await page.getByRole("searchbox").fill("no-such-question-xyz");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.getByRole("button", { name: "Clear search & filters" }).click();
  await expect(page.locator(".question-card")).toHaveCount(10);
});

test("finder retains actual A/B voting, changing choices, keyboard shortcuts and API failure feedback", async ({
  page,
}) => {
  await page.goto("/find-questions");
  await page.getByRole("searchbox").fill("one afternoon each week");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Play these questions" }).click();
  await expect(page).toHaveURL(/\/play\?/);
  const dialog = page.locator("#play");
  const a = page.getByRole("button", { name: "Choose option A" });
  const b = page.getByRole("button", { name: "Choose option B" });
  await expect(a).toHaveAttribute("aria-pressed", "false");
  await a.click();
  await expect(a).toHaveAttribute("aria-pressed", "true");
  await b.click();
  await expect(b).toHaveAttribute("aria-pressed", "true");
  await expect(a).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("link", { name: "Back to questions" }).click();
  await expect(page).toHaveURL(/\/find-questions/);
  await page.reload();
  await page.getByRole("button", { name: "Play these questions" }).click();
  await expect(b).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("KeyA");
  await expect(a).toHaveAttribute("aria-pressed", "true");
  await page.route("**/api/wyr/vote", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Controlled voting failure" }),
    }),
  );
  await b.click();
  await expect(dialog).toContainText("Controlled voting failure");
  await expect(a).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Back to questions" }).click();
  await expect(page).toHaveURL(/\/find-questions/);
});

test("finder presents only selected questions, handles unavailable stats honestly and fits narrow screens", async ({
  page,
}) => {
  await page.route(/\/api\/wyr\/(?:kids-)?vote\?/, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Controlled unavailable statistics" }),
    }),
  );
  await page.goto("/find-questions");
  await expect(page.locator(".stats-retry")).toHaveCount(10);
  await expect(page.locator(".question-stats").first()).not.toContainText("%");
  await page.locator(".select-button").nth(1).click();
  await page.getByRole("button", { name: "Present", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("1");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: "Back to questions" }).click();
  await page.getByRole("button", { name: "Print / Customize" }).click();
  await expect(page).toHaveURL(/\/print\?/);
  await expect(page.locator(".preview-paper")).toBeVisible();
  await expect(page.locator(".print-preview")).toContainText("1 questions");
  await page.getByRole("link", { name: "Back to questions" }).click();
  for (const width of [375, 700, 849, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await expect(page.locator(".finder-categories a")).toHaveCount(5);
});

test("finder is an independent noindex utility route and retains a real home navigation", async ({
  page,
}) => {
  await page.goto("/find-questions");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /noindex/);
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".finder-page")).toHaveCount(0);
  await expect(page.locator("h1")).toHaveText("Would You Rather Questions");
  await page.getByRole("link", { name: "Find Questions", exact: true }).first().click();
  await expect(page).toHaveURL(/\/find-questions$/);
});
