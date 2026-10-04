import { expect, test } from "@playwright/test";
import { QUESTIONS_DATABASE } from "../../src/modules/would-you-rather/data/questions";
import { isKidsCollectionQuestion } from "../../src/modules/would-you-rather/domain/filter-questions";

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

  await page.goto("/find-questions?q=have&age=kids&page=7", { waitUntil: "networkidle" });
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
  await expect(page.locator(".selection-bar h3")).toHaveText("1 selected questions");
  expect(await visibleQuestionIds()).toEqual(beforeRestoreIds);

  await kidsFilter.click();
  await page.getByRole("button", { name: "Apply Filters" }).click();
  await page.getByRole("button", { name: "Page 8", exact: true }).click();
  await expect(currentPage).toHaveText("8");
  const backStateIds = await visibleQuestionIds();

  await searchbox.fill("squirrel tell stories");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(1);
  const forwardStateIds = await visibleQuestionIds();

  await page.goBack();
  const backUrl = new URL(page.url());
  expect(backUrl.searchParams.get("q")).toBe("have");
  expect(backUrl.searchParams.get("age")).toBe("kids");
  expect(backUrl.searchParams.get("page")).toBe("8");
  await expect(searchbox).toHaveValue("have");
  await expect(kidsFilter).toHaveAttribute("aria-pressed", "true");
  await expect(currentPage).toHaveText("8");
  expect(await visibleQuestionIds()).toEqual(backStateIds);

  await page.goForward();
  const forwardUrl = new URL(page.url());
  expect(forwardUrl.searchParams.get("q")).toBe("squirrel tell stories");
  expect(forwardUrl.searchParams.get("age")).toBe("kids");
  expect(forwardUrl.searchParams.has("page")).toBe(false);
  await expect(searchbox).toHaveValue("squirrel tell stories");
  await expect(kidsFilter).toHaveAttribute("aria-pressed", "true");
  await expect(currentPage).toHaveText("1");
  await expect(page.locator(".question-card")).toHaveCount(1);
  expect(await visibleQuestionIds()).toEqual(forwardStateIds);
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
    if (questionId) {
      responses.push({ endpoint: url.pathname, questionId, status: response.status() });
    }
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
  const visibleIds = await page
    .locator(".question-card")
    .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-question-id")));
  expect(requests.map(({ questionId }) => questionId).sort()).toEqual(visibleIds.sort());
  console.log("real-network-sanity", {
    total: requests.length,
    kids: kidsRequests.length,
    general: generalRequests.length,
    unique: new Set(requests.map(({ questionId }) => questionId)).size,
    successful: responses.filter(({ status }) => status >= 200 && status < 300).length,
    duplicates: requests.length - new Set(requests.map(({ questionId }) => questionId)).size,
    retryUI: await page.locator(".stats-retry").count(),
  });
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
    if (questionId) {
      observed.push({ endpoint: url.pathname, questionId, status: response.status() });
    }
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

test("random Finder Kids and General cards use their real privacy endpoints", async ({
  page,
  context,
}) => {
  const approved = QUESTIONS_DATABASE.filter((question) => question.reviewStatus === "approved");
  const observed: Array<{ endpoint: string; questionId: string }> = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/api/wyr/vote" || url.pathname === "/api/wyr/kids-vote") {
      observed.push({
        endpoint: url.pathname,
        questionId: url.searchParams.get("questionId") ?? "",
      });
    }
  });
  // Visit General first so the subsequent Kids request must respect its cookie scope.
  for (const kids of [false, true]) {
    const candidates = approved.filter((question) => isKidsCollectionQuestion(question) === kids);
    expect(candidates.length).toBeGreaterThan(0);
    const question = candidates[Math.floor(Math.random() * candidates.length)]!;
    const browsePage = Math.floor(approved.findIndex((entry) => entry.id === question.id) / 10) + 1;
    const endpoint = kids ? "/api/wyr/kids-vote" : "/api/wyr/vote";
    const targetResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === endpoint && url.searchParams.get("questionId") === question.id;
    });
    await page.goto(`/find-questions?page=${browsePage}`, { waitUntil: "networkidle" });
    const response = await targetResponse;
    expect(response.ok()).toBe(true);
    const card = page.locator(`[data-question-id="${question.id}"]`);
    await expect(card).toBeVisible();
    await expect(card.locator(".question-stats")).not.toContainText("Loading");
    await expect(card.locator(".stats-retry")).toHaveCount(0);
    expect(
      observed
        .filter((request) => request.questionId === question.id)
        .every((request) => request.endpoint === endpoint),
    ).toBe(true);
    if (kids) {
      expect(await response.json()).toMatchObject({ hasVoted: false, selectedOption: null });
      expect((await response.request().allHeaders()).cookie ?? "").not.toContain("wyr_vid=");
      const cookieHeader = (await response.allHeaders())["set-cookie"] ?? "";
      expect(cookieHeader).toContain("Max-Age=0");
      expect(cookieHeader).not.toMatch(/wyr_vid=[^;]/);
    }
    expect(
      (await context.cookies())
        .filter((cookie) => cookie.name === "wyr_vid")
        .every((cookie) => cookie.path === "/api/wyr/vote"),
    ).toBe(true);
    console.log("random-privacy-boundary", {
      questionId: question.id,
      endpoint,
      status: response.status(),
    });
  }
});
