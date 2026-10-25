import { expect, test } from "@playwright/test";

const emptyStats = {
  hasVoted: false,
  selectedOption: null,
  votesA: 0,
  votesB: 0,
  total: 0,
  percentageA: 50,
  percentageB: 50,
};

test("a Kids-safe homepage question uses general voting and permits changing A to B", async ({
  page,
}) => {
  const posts: string[] = [];
  await page.route("**/api/wyr/vote**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: emptyStats });
    } else {
      const { option } = route.request().postDataJSON() as { option: string };
      posts.push(option);
      await route.fulfill({
        json: {
          ...emptyStats,
          hasVoted: true,
          selectedOption: option,
          votesA: option === "A" ? 1 : 0,
          votesB: option === "B" ? 1 : 0,
          percentageA: option === "A" ? 100 : 0,
          percentageB: option === "B" ? 100 : 0,
          total: 1,
        },
      });
    }
  });
  await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  const choices = page.locator("#play .choice-card");
  await choices.nth(0).click();
  await expect(choices.nth(0)).toHaveAttribute("aria-pressed", "true");
  await choices.nth(1).click();
  await expect(choices.nth(1)).toHaveAttribute("aria-pressed", "true");
  expect(posts).toEqual(["A", "B"]);
});

test("GET errors belong to the current question, retry works and switching clears the previous error", async ({
  page,
}) => {
  let fail = true;
  await page.route("**/api/wyr/vote**", async (route) => {
    await route.fulfill(
      fail ? { status: 500, json: { error: "Unavailable" } } : { json: emptyStats },
    );
  });
  await page.goto("/");
  const alert = page.locator("#play [role=alert]");
  await expect(alert).toContainText("Voting is unavailable");
  fail = false;
  await alert.getByRole("button", { name: "Retry" }).click();
  await expect(alert).toHaveCount(0);
  fail = true;
  await page.getByRole("button", { name: "Next Question", exact: true }).click();
  await expect(alert).toContainText("Voting is unavailable");
  fail = false;
  await page.getByRole("button", { name: "Next Question", exact: true }).click();
  await expect(alert).toHaveCount(0);
});

test("a late POST error cannot leak into the next question", async ({ page }) => {
  let release: (() => void) | undefined;
  const posted = new Promise<void>((resolve) => {
    release = resolve;
  });
  let finish: (() => void) | undefined;
  const wait = new Promise<void>((resolve) => {
    finish = resolve;
  });
  await page.route("**/api/wyr/vote**", async (route) => {
    if (route.request().method() === "POST") {
      release?.();
      await wait;
      await route.fulfill({ status: 500, json: { error: "Late previous question failure" } });
    } else await route.fulfill({ json: emptyStats });
  });
  await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  await page.locator("#play .choice-card").first().click();
  await posted;
  await page.getByRole("button", { name: "Next Question", exact: true }).click();
  finish?.();
  await expect(page.locator("#play [role=alert]")).toHaveCount(0);
  await expect(page.locator("#play .choice-card").first()).toBeEnabled();
});
