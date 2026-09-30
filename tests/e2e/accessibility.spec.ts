import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("creat-web:analytics-consent:v1", "denied");
    } catch {
      // ignore
    }
  });
});

for (const route of ["/", "/would-you-rather-questions-for-kids", "/privacy"] as const) {
  test(`${route} has no serious or critical automated accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    expect(blocking).toEqual([]);
  });
}

test("keyboard reaches primary navigation, CTA and footer", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveAttribute("href", "/");

  let reachedTopic = false;
  let reachedFooter = false;
  for (let index = 0; index < 100; index += 1) {
    const focused = page.locator(":focus");
    const href = await focused.getAttribute("href").catch(() => null);
    if (href === "/would-you-rather-questions-for-kids") reachedTopic = true;
    if (href === "/privacy") reachedFooter = true;
    if (reachedTopic && reachedFooter) break;
    await page.keyboard.press("Tab");
  }

  expect(reachedTopic).toBe(true);
  expect(reachedFooter).toBe(true);
});

test("unknown route returns a real 404", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-real-route");
  expect(response?.status()).toBe(404);
});
