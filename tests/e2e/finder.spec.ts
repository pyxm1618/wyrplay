import { expect, test } from "@playwright/test";

async function openFinder(page: import("@playwright/test").Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".panel-heading")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".question-stats")
        .evaluateAll(
          (nodes) =>
            nodes.length > 0 && nodes.every((node) => !node.textContent?.includes("Loading")),
        ),
    )
    .toBe(true);
}

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
  await expect(page.locator(".panel-heading")).toContainText("512 curated questions");
  await expect(page.locator(".question-card").first()).toContainText(
    "hear a squirrel tell stories",
  );
  await expect(page.locator(".question-stats").first()).not.toContainText("Loading");
  await page.getByRole("button", { name: "Save question 1", exact: true }).click();
  await expect(page.getByRole("button", { name: "Unsave question 1", exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Unsave question 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".select-button").first().click();
  await expect(page.locator(".selection-bar h3")).toHaveText("1 selected question");
  await page.getByRole("button", { name: "Page 52", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(2);
  await expect(page.locator(".question-number").first()).toHaveText("511");
  await expect(page.locator(".selection-bar h3")).toHaveText("1 selected question");
  await page.getByRole("searchbox").fill("hear");
  await expect(page.locator(".question-number").first()).toHaveText("511");
  await expect(page.locator(".question-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(10);
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("1");
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await page.getByRole("button", { name: "Hard", exact: true }).click();
  await expect(page.locator(".panel-heading")).toContainText("512");
  await page.getByRole("button", { name: "Apply Filters" }).click();
  await expect(page.locator(".panel-heading")).toContainText("297 matching questions");
  await page.getByRole("searchbox").fill("no-such-question-xyz");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.getByRole("button", { name: "Clear selected" }).click();
  await expect(page.getByRole("button", { name: "Play these questions" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Present", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Print / Customize" })).toBeDisabled();
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
  await b.focus();
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
  await page.route(/\/api\/wyr\/vote-stats\?/, (route) =>
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
  await expect(page.locator("h1")).toHaveAccessibleName("Would You Rather Questions");
  await page.getByRole("link", { name: "Find Questions", exact: true }).first().click();
  await expect(page).toHaveURL(/\/find-questions$/);
});

test("Review selected restores the prior browse page, keyword, filter and URL state", async ({
  page,
}) => {
  await openFinder(page, "/find-questions?q=have&age=kids&page=7");
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("7");
  await expect(page.getByRole("searchbox")).toHaveValue("have");
  await expect(page.getByRole("button", { name: "Kids", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.locator(".select-button").first().click();
  await page.getByRole("button", { name: "Page 8", exact: true }).click();
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("8");
  await page.locator(".select-button").first().click();
  await expect(page.locator(".selection-bar h3")).toHaveText("2 selected questions");

  const beforeReview = new URL(page.url());
  expect(beforeReview.searchParams.get("q")).toBe("have");
  expect(beforeReview.searchParams.get("age")).toBe("kids");
  expect(beforeReview.searchParams.get("page")).toBe("8");

  await page.getByRole("button", { name: "Review selected", exact: true }).click();
  await expect(page.locator("#questions-title")).toHaveText("Selected Questions");
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("1");

  await page.getByRole("button", { name: "Back to browsing", exact: true }).click();
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("8");
  await expect(page.getByRole("searchbox")).toHaveValue("have");
  await expect(page.getByRole("button", { name: "Kids", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  const afterReview = new URL(page.url());
  expect(afterReview.searchParams.get("q")).toBe("have");
  expect(afterReview.searchParams.get("age")).toBe("kids");
  expect(afterReview.searchParams.get("page")).toBe("8");
  await expect(page.locator(".question-number").first()).toHaveText("71");
  await expect(page.locator(".question-card")).toHaveCount(10);
  console.log("review-page-restore", {
    before: beforeReview.searchParams.get("page"),
    during: 1,
    after: afterReview.searchParams.get("page"),
    url: afterReview.pathname + afterReview.search,
  });
});

test("finder restore keeps back and forward synchronized after new history states", async ({
  page,
}) => {
  const searchbox = page.getByRole("searchbox");
  const kidsFilter = page.getByRole("button", { name: "Kids", exact: true });
  const teensFilter = page.getByRole("button", { name: "Teens", exact: true });
  const currentPage = page.locator(".pagination [aria-current=page]");
  const visibleQuestionIds = () =>
    page
      .locator(".question-card")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-question-id")));

  await openFinder(page, "/find-questions?q=have&age=kids&page=7");
  await expect(searchbox).toHaveValue("have");
  await expect(kidsFilter).toHaveAttribute("aria-pressed", "true");
  await expect(currentPage).toHaveText("7");

  const beforeRestoreIds = await visibleQuestionIds();
  await page.locator(".select-button").first().click();
  await teensFilter.click();
  await expect(teensFilter).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Play these questions" }).click();
  await expect(page).toHaveURL(/\/play\?/);
  await page.getByRole("link", { name: "Back to questions" }).click();
  await expect(page).toHaveURL(/\/find-questions\?restore=1$/);

  await expect(searchbox).toHaveValue("have");
  await expect(teensFilter).toHaveAttribute("aria-pressed", "true");
  await expect(currentPage).toHaveText("7");
  await expect(page.locator(".selection-bar h3")).toHaveText("1 selected question");
  expect(await visibleQuestionIds()).toEqual(beforeRestoreIds);

  await page.getByRole("button", { name: "Apply Filters" }).click();
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(currentPage).toHaveText("2");
  const backStateIds = await visibleQuestionIds();

  await searchbox.fill("one afternoon each week");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(1);
  const forwardStateIds = await visibleQuestionIds();

  await page.goBack();
  const backUrl = new URL(page.url());
  expect(backUrl.searchParams.get("q")).toBe("have");
  expect(backUrl.searchParams.get("age")).toBe("teens");
  expect(backUrl.searchParams.get("page")).toBe("2");
  await expect(searchbox).toHaveValue("have");
  await expect(teensFilter).toHaveAttribute("aria-pressed", "true");
  await expect(currentPage).toHaveText("2");
  expect(await visibleQuestionIds()).toEqual(backStateIds);

  await page.goForward();
  const forwardUrl = new URL(page.url());
  expect(forwardUrl.searchParams.get("q")).toBe("one afternoon each week");
  expect(forwardUrl.searchParams.get("age")).toBe("teens");
  expect(forwardUrl.searchParams.has("page")).toBe(false);
  await expect(searchbox).toHaveValue("one afternoon each week");
  await expect(teensFilter).toHaveAttribute("aria-pressed", "true");
  await expect(currentPage).toHaveText("1");
  await expect(page.locator(".question-card")).toHaveCount(1);
  expect(await visibleQuestionIds()).toEqual(forwardStateIds);
});

test("Finder batch stats preserve aggregate privacy for Kids and General pages", async ({
  page,
  context,
}) => {
  for (const pageNumber of [1, 6]) {
    const responsePromise = page.waitForResponse(
      (response) => new URL(response.url()).pathname === "/api/wyr/vote-stats",
    );
    await openFinder(page, `/find-questions?page=${pageNumber}`);
    const response = await responsePromise;
    expect(response.ok()).toBe(true);
    const ids = await page
      .locator(".question-card")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-question-id")));
    const summaries = await response.json();
    expect(Object.keys(summaries).sort()).toEqual(ids.sort());
    for (const stats of Object.values(summaries))
      expect(stats).toMatchObject({ hasVoted: false, selectedOption: null });
    expect((await response.request().allHeaders()).cookie ?? "").not.toContain("wyr_vid=");
    expect((await response.allHeaders())["set-cookie"]).toBeUndefined();
    await expect(page.locator(".stats-retry")).toHaveCount(0);
  }
  expect((await context.cookies()).some((cookie) => cookie.name === "wyr_vid")).toBe(false);
});

for (const exitAction of ["Clear selected", "Unselect question 1"] as const) {
  test(`review exits at the browse page after ${exitAction}`, async ({ page }) => {
    await page.goto("/find-questions?q=have&age=kids&page=8");
    await expect(page.locator(".pagination [aria-current=page]")).toHaveText("8");
    await page.locator(".select-button").first().click();
    await page.getByRole("button", { name: "Review selected", exact: true }).click();
    await expect(page.locator(".question-card")).toHaveCount(1);
    await page.getByRole("button", { name: exitAction, exact: true }).click();
    await expect(page.locator(".pagination [aria-current=page]")).toHaveText("8");
    await expect(page.locator(".selection-bar h3")).toHaveText("0 selected questions");
    await expect(page).toHaveURL(/q=have&age=kids&page=8$/);
  });
}

test("review respects filter changes, clear filters and browser history", async ({ page }) => {
  await page.goto("/find-questions?q=have&age=kids&page=7");
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("7");
  await page.locator(".select-button").first().click();
  await page.getByRole("button", { name: "Page 8", exact: true }).click();
  await page.getByRole("button", { name: "Review selected", exact: true }).click();
  await expect(page.locator("#questions-title")).toHaveText("Selected Questions");
  await page.goBack();
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("7");
  await expect(page.locator("#questions-title")).toHaveText("Your Questions");
  await page.goForward();
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("8");
  await page.getByRole("button", { name: "Review selected", exact: true }).click();
  await page.getByRole("searchbox").fill("squirrel tell stories");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(1);
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("1");
  await page.getByRole("button", { name: "Review selected", exact: true }).click();
  await page.getByRole("button", { name: "Back to browsing", exact: true }).click();
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("1");
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await page.getByRole("button", { name: "Review selected", exact: true }).click();
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page.locator("#questions-title")).toHaveText("Browse Questions");
  await expect(page.locator(".question-card")).toHaveCount(10);
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(page).toHaveURL(/\/find-questions$/);
});

test("review restores a valid page when the incoming browse page exceeds the filtered pool", async ({
  page,
}) => {
  await page.goto("/find-questions?q=squirrel%20tell%20stories&page=999");
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("1");
  await page.locator(".select-button").first().click();
  await page.getByRole("button", { name: "Review selected", exact: true }).click();
  await page.getByRole("button", { name: "Back to browsing", exact: true }).click();
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("1");
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
});
