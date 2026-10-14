import { expect, test } from "@playwright/test";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("creat-web:analytics-consent:v1", "denied"));
});

test("home never outputs the full bank in DOM, RSC or downloaded scripts", async ({ page }) => {
  const scripts: Promise<string>[] = [];
  page.on("response", (response) => {
    if (new URL(response.url()).pathname.endsWith(".js")) scripts.push(response.text());
  });
  const response = await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".home-directory,.home-directory-semantic-item")).toHaveCount(0);
  const payload = [await response!.text(), ...(await Promise.all(scripts))].join("\n");
  const downloadedQuestions = QUESTIONS_DATABASE.filter((q) => payload.includes(q.question));
  expect(downloadedQuestions.length).toBeLessThanOrEqual(15);
  await expect(page.locator("header a[href='/leaderboards']")).toBeVisible();
});

test("Finder uses one aggregate batch for ten cards and for the next page", async ({
  page,
  context,
}) => {
  const reads: string[] = [];
  page.on("request", (request) => {
    if (/\/api\/wyr\/(vote|kids-vote|vote-stats)/.test(request.url())) reads.push(request.url());
  });
  const batch = () =>
    page.waitForResponse((response) => new URL(response.url()).pathname === "/api/wyr/vote-stats");
  let response = batch();
  await page.goto("/find-questions");
  expect((await response).ok()).toBe(true);
  await expect(page.locator(".question-card")).toHaveCount(10);
  await expect
    .poll(() => page.locator(".question-stats").allTextContents())
    .not.toContain("Loading vote stats…");
  expect(reads).toHaveLength(1);
  expect(new URL(reads[0]!).pathname).toBe("/api/wyr/vote-stats");
  expect(new URL(reads[0]!).searchParams.getAll("questionId")).toHaveLength(10);
  reads.length = 0;
  response = batch();
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  expect((await response).ok()).toBe(true);
  await expect(page.locator(".question-number").first()).toHaveText("11");
  await expect
    .poll(() => page.locator(".question-stats").allTextContents())
    .not.toContain("Loading vote stats…");
  expect(reads).toHaveLength(1);
  expect((await context.cookies()).some((cookie) => cookie.name === "wyr_vid")).toBe(false);
});

test("Kids displayed cards, arena and presenter all use approved canonical questions", async ({
  page,
}) => {
  const approved = QUESTIONS_DATABASE.filter((q) => q.reviewStatus === "approved");
  await page.goto("/would-you-rather-questions-for-kids");
  await expect(page.locator(".kids-question-label")).toContainText("Question 1 of");
  const html = await page.content();
  expect(html).not.toMatch(/example-(?:pets|home|food|trip|dinosaur|talents|explore|hobbies|time)/);
  for (const heading of await page.locator(".kids-card h3").allTextContents())
    expect(approved.some((q) => q.question === heading)).toBe(true);
  const first = page.locator(".kids-reviewed-card").first();
  const question = await first.locator("h3").textContent();
  await first.getByRole("button").click();
  const formal = approved.find((q) => q.question === question)!;
  await expect(page.locator(".kids-choice-a")).toContainText(formal.optionA);
  await expect(page.locator(".kids-choice-b")).toContainText(formal.optionB);
});
