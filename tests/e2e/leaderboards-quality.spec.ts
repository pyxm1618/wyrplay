import { expect, test, type Page } from "@playwright/test";
import { QUESTIONS_DATABASE } from "../../src/modules/would-you-rather/data/questions";
import { isKidsCollectionQuestion } from "../../src/modules/would-you-rather/domain/filter-questions";

const ordinaryQuestion = QUESTIONS_DATABASE.find(
  (question) => question.reviewStatus === "approved" && !isKidsCollectionQuestion(question),
);
if (!ordinaryQuestion) throw new Error("Leaderboard E2E requires an approved non-Kids question");

async function openOrdinaryQuestion(page: Page) {
  await page.getByRole("button", { name: "Search ranked questions", exact: true }).click();
  await page.getByRole("searchbox").fill(ordinaryQuestion!.question);
  const stats = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === "/api/wyr/vote" &&
      url.searchParams.get("questionId") === ordinaryQuestion!.id &&
      response.request().method() === "GET" &&
      response.ok()
    );
  });
  await page.locator(".search-results button").click();
  return (await stats).json();
}

// Run against a disposable local database. All observations use the real voting API.
// Test votes are never popularity claims or production data.
test.beforeAll(async ({ request }, info) => {
  const origin = new URL(info.project.use.baseURL!);
  expect(["localhost", "127.0.0.1"]).toContain(origin.hostname);
  const questions = QUESTIONS_DATABASE.filter((q) => q.reviewStatus === "approved").slice(0, 14);
  if (!questions.some((question) => question.id === ordinaryQuestion.id)) {
    questions.push(ordinaryQuestion);
  }
  for (const question of questions) {
    const endpoint = isKidsCollectionQuestion(question) ? "/api/wyr/kids-vote" : "/api/wyr/vote";
    const response = await request.post(endpoint, {
      data: { questionId: question.id, option: "A" },
    });
    expect(response.ok()).toBeTruthy();
  }
});

test("one real period control, search, pagination and working entrances", async ({ page }) => {
  await page.goto("/leaderboards");
  await expect(page.locator(".question-open")).toHaveCount(3);
  await expect(page.getByText("Hall of Fame")).toHaveCount(0);
  await expect(page.getByText("Create a Question")).toHaveCount(0);
  for (const name of ["All Time", "This Month", "This Week"]) {
    const button = page.getByRole("button", { name, exact: true });
    await expect(button).toHaveCount(1);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".question-open")).toHaveCount(3);
  }
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await expect(page.locator(".rank-number").first()).toHaveText("11");
  await page.getByRole("button", { name: "All Time", exact: true }).click();
  await expect(page.getByRole("button", { name: "Page 1", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.getByRole("button", { name: "Search ranked questions", exact: true }).click();
  await page.getByRole("searchbox").fill("squirrel");
  await expect(page.locator(".search-results button")).toHaveCount(1);
  await page.locator(".search-results button").click();
  await expect(page.getByRole("dialog", { name: "Vote on a ranked question" })).toBeVisible();
  await page.getByRole("button", { name: "Close voting", exact: true }).click();
  await expect(page.locator(".footer-cta a")).toHaveAttribute("href", "/play");
});

test("real A/B writes, switching does not add a vote, keyboard, Next, Random and reopen", async ({
  page,
}) => {
  await page.goto("/leaderboards");
  const initial = await openOrdinaryQuestion(page);
  const vote = async (option: "A" | "B", keyboard = false) => {
    const response = page.waitForResponse(
      (r) => r.url().endsWith("/api/wyr/vote") && r.request().method() === "POST",
    );
    if (keyboard) await page.keyboard.press(option.toLowerCase());
    else await page.getByRole("button", { name: `Choose option ${option}`, exact: true }).click();
    const result = await response;
    expect(result.ok()).toBeTruthy();
    const body = await result.json();
    expect(body.selectedOption).toBe(option);
    await expect(
      page.getByRole("button", { name: `Choose option ${option}`, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".play-vote-result")).toHaveCount(2);
    return body;
  };
  const first = await vote("A");
  expect(first.total).toBe(initial.total + (initial.hasVoted ? 0 : 1));
  expect((await vote("B")).total).toBe(first.total);
  expect((await vote("A", true)).total).toBe(first.total);
  expect((await vote("B", true)).total).toBe(first.total);
  await page.reload();
  const restored = await openOrdinaryQuestion(page);
  expect(restored.selectedOption).toBe("B");
  expect(restored.total).toBe(first.total);
  await expect(page.getByRole("button", { name: "Choose option B", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const question = page.locator(".leaderboard-vote-dialog .play-heading p");
  const oldTitle = await question.textContent();
  await page.getByRole("button", { name: "Next Question →", exact: true }).click();
  await expect(question).not.toHaveText(oldTitle!);
  const nextTitle = await question.textContent();
  await page.getByRole("button", { name: "Random", exact: true }).click();
  await expect(question).not.toHaveText(nextTitle!);
  await page.keyboard.press("Escape");
  await expect(page.locator(".leaderboard-vote-dialog")).not.toBeVisible();
  await page.locator(".row-title").first().click();
  await expect(page.locator(".leaderboard-vote-dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close voting", exact: true }).click();
  await page.reload();
  await expect(page.locator(".ranking-row")).toHaveCount(7);
});

test("seven responsive sizes, loaded assets, clean console and mobile voting", async ({
  page,
}, info) => {
  const errors: string[] = [];
  const failedResponses: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("/leaderboards");
  for (const [width, height] of [
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1280, 800],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.locator(".footer-cta").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.evaluate(() =>
          [...document.images].every((image) => image.complete && image.naturalWidth > 0),
        ),
      )
      .toBeTruthy();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    const hero = await page.locator(".hero").boundingBox();
    expect(hero!.width).toBeLessThanOrEqual(width!);
    const dialogStats = page.waitForResponse(
      (r) => /\/api\/wyr\/(kids-vote|vote)\?/.test(r.url()) && r.ok(),
    );
    await page.locator(".question-open").first().click();
    await dialogStats;
    const dialog = page.locator(".leaderboard-vote-dialog");
    const bounds = await dialog.boundingBox();
    expect(bounds!.width).toBeLessThan(width!);
    expect(bounds!.height).toBeLessThan(height!);
    expect(
      await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBeTruthy();
    await page.getByRole("button", { name: "Close voting", exact: true }).click();
    await expect(page.locator(".leaderboard-page")).toHaveAttribute("aria-busy", "false");
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);
    await page.screenshot({ path: info.outputPath(`leaderboards-${width}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open mobile menu" }).click();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open mobile menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await openOrdinaryQuestion(page);
  const vote = page.waitForResponse(
    (r) => r.request().method() === "POST" && r.url().endsWith("/api/wyr/vote"),
  );
  await page.getByRole("button", { name: "Choose option A", exact: true }).click();
  expect((await vote).ok()).toBeTruthy();
  await expect(page.locator(".choose-a")).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
  expect(failedResponses).toEqual([]);
});
