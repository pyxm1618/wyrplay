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
  await expect(page.locator(".panel-heading")).toContainText("457 curated questions");
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
  await page.getByRole("button", { name: "Page 46", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(7);
  await expect(page.locator(".question-number").first()).toHaveText("451");
  await expect(page.locator(".selection-bar h3")).toHaveText("1 selected questions");
  await page.getByRole("searchbox").fill("hear");
  await expect(page.locator(".question-number").first()).toHaveText("451");
  await expect(page.locator(".question-card")).toHaveCount(7);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(10);
  await expect(page.locator(".pagination [aria-current=page]")).toHaveText("1");
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await page.getByRole("button", { name: "Hard", exact: true }).click();
  await expect(page.locator(".panel-heading")).toContainText("457");
  await page.getByRole("button", { name: "Apply Filters" }).click();
  await expect(page.locator(".panel-heading")).toContainText("271 matching questions");
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
  await expect(page.locator("h1")).toHaveAccessibleName("Would You Rather Questions");
  await page.getByRole("link", { name: "Find Questions", exact: true }).first().click();
  await expect(page).toHaveURL(/\/find-questions$/);
});

test("Review selected restores the prior browse page, keyword, filter and URL state", async ({
  page,
}) => {
  await page.goto("/find-questions?q=have&age=kids&page=7", { waitUntil: "networkidle" });
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
  await expect(page.getByRole("heading", { name: "Selected Questions" })).toBeVisible();
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
});

test("finder real network sanity uses one live vote-stat request per visible question", async ({
  page,
}) => {
  const requests: Array<{ endpoint: string; questionId: string }> = [];
  const responses: Array<{ endpoint: string; questionId: string; status: number }> = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== "/api/wyr/vote" && url.pathname !== "/api/wyr/kids-vote") return;
    const questionId = url.searchParams.get("questionId");
    if (questionId) requests.push({ endpoint: url.pathname, questionId });
  });
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.pathname !== "/api/wyr/vote" && url.pathname !== "/api/wyr/kids-vote") return;
    const questionId = url.searchParams.get("questionId");
    if (questionId)\n      responses.push({ endpoint: url.pathname, questionId, status: response.status() });
  });

  await page.goto("/find-questions", { waitUntil: "networkidle" });
  await expect(page.locator(".question-card")).toHaveCount(10);
  await expect
    .poll(async () =>
      page
        .locator(".question-stats")
        .evaluateAll((nodes) => nodes.every((node) => !node.textContent?.includes("Loading"))),
    )
    .toBe(true);
  await expect(page.locator(".stats-retry")).toHaveCount(0);

  expect(requests).toHaveLength(10);
  expect(new Set(requests.map(({ questionId }) => questionId)).size).toBe(10);
  expect(responses).toHaveLength(10);
  expect(responses.filter(({ status }) => status >= 200 && status < 300)).toHaveLength(10);

  const kidsRequests = requests.filter(({ endpoint }) => endpoint === "/api/wyr/kids-vote");
  const generalRequests = requests.filter(({ endpoint }) => endpoint === "/api/wyr/vote");
  expect(kidsRequests.length + generalRequests.length).toBe(10);
});

test("finder card stats preserve the Kids aggregate-only privacy boundary", async ({
  page,
  context,
}) => {
  await context.clearCookies();
  await context.addCookies([
    {
      name: "wyr_vid",
      value: "legacy-root-voter",
      url: "http://127.0.0.1:3000",
    },
  ]);

  const observed: Array<{ endpoint: string; questionId: string; status: number }> = [];
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.pathname !== "/api/wyr/vote" && url.pathname !== "/api/wyr/kids-vote") return;
    const questionId = url.searchParams.get("questionId");
    if (questionId)\n      observed.push({ endpoint: url.pathname, questionId, status: response.status() });
  });

  await page.goto("/find-questions", { waitUntil: "networkidle" });
  await expect(page.locator('[data-question-id="wyr-000001"]')).toBeVisible();
  expect(
    observed.some(
      ({ endpoint, questionId, status }) =>
        endpoint === "/api/wyr/kids-vote" &&
        questionId === "wyr-000001" &&
        status >= 200 &&
        status < 300,
    ),
  ).toBe(true);
  expect(
    observed.some(
      ({ endpoint, questionId }) => endpoint === "/api/wyr/vote" && questionId === "wyr-000001",
    ),
  ).toBe(false);
  expect((await context.cookies()).some((cookie) => cookie.name === "wyr_vid")).toBe(false);

  observed.length = 0;
  await page.goto("/find-questions?page=6", { waitUntil: "networkidle" });
  await expect(page.locator('[data-question-id="wyr-000059"]')).toBeVisible();
  expect(
    observed.some(
      ({ endpoint, questionId, status }) =>
        endpoint === "/api/wyr/vote" &&
        questionId === "wyr-000059" &&
        status >= 200 &&
        status < 300,
    ),
  ).toBe(true);
  expect(
    observed.some(
      ({ endpoint, questionId }) =>
        endpoint === "/api/wyr/kids-vote" && questionId === "wyr-000059",
    ),
  ).toBe(false);
});

