import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getQuestionsByCollection } from "../../src/modules/would-you-rather/data/questions";
const kidsCount = getQuestionsByCollection("kids").length;
const route = "/would-you-rather-questions-for-kids";
const sizes = [
  [375, 812],
  [390, 844],
  [430, 932],
  [620, 900],
  [621, 900],
  [768, 1024],
  [820, 1180],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
] as const;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("creat-web:analytics-consent:v1", "denied"));
});
for (const [width, height] of sizes)
  test(`${width}×${height}: sections, expanded cards, navigation, demo and real choices`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto(route);
    await expect(page.locator(".kids-page")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    for (const section of [
      "header",
      ".kids-hero",
      "#play",
      "#questions",
      ".kids-uses",
      ".kids-faq",
      ".kids-related",
      ".kids-closing",
      "footer",
    ]) {
      await page.locator(section).scrollIntoViewIfNeeded();
      await expect(page.locator(section)).toBeVisible();
    }
    const metrics = await page.evaluate(() => ({
      viewport: innerWidth,
      scroll: document.documentElement.scrollWidth,
      minBody: Math.min(
        ...[...document.querySelectorAll(".kids-page p,.kids-page a,.kids-page button")].map((e) =>
          parseFloat(getComputedStyle(e).fontSize),
        ),
      ),
    }));
    expect(metrics.scroll).toBe(metrics.viewport);
    expect(metrics.minBody).toBeGreaterThanOrEqual(14);
    await page.locator(".kids-choice-a").click();
    await expect(page.locator(".kids-choice-a")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".kids-example-status")).toContainText("no vote is saved");
    await page.locator(".kids-choice-b").click();
    await expect(page.locator(".kids-choice-b")).toHaveAttribute("aria-pressed", "true");
    const before = await page.locator(".kids-choice-a").boundingBox();
    await page.getByRole("button", { name: "Next question", exact: true }).click();
    await expect(page.locator(".kids-question-label")).toHaveText(`Question 1 of ${kidsCount}`);
    await expect(page.locator(".kids-vote-arena")).toBeVisible();
    const after = await page.locator(".kids-choice-a").boundingBox();
    expect(after?.width).toBe(before?.width);
    expect(after?.height).toBe(before?.height);
    await page.locator(".kids-choice-a").click();
    await expect(page.locator(".kids-choice-a")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".kids-choice-b")).toBeDisabled();
    await page.getByRole("button", { name: "Next question", exact: true }).click();
    await page.locator(".kids-choice-b").click();
    await expect(page.locator(".kids-choice-b")).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Browse more kids questions", exact: true }).click();
    await expect(page.locator(".kids-reviewed-card")).toHaveCount(kidsCount);
    await expect(page.locator(".kids-reviewed-card .kids-motif")).toHaveCount(kidsCount);
    await expect(page.getByText("Reviewed question", { exact: true })).toHaveCount(0);
    await page.locator(".kids-reviewed-card").last().scrollIntoViewIfNeeded();
    await expect(page.locator(".kids-reviewed-card").last()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.getByRole("button", { name: "Show fewer questions", exact: true }).click();
    await expect(page.locator(".kids-reviewed-card")).toHaveCount(0);
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(page.locator(".kids-header,.kids-footer")).toHaveCount(0);
    for (const summary of await page.locator(".kids-faq summary").all()) {
      await summary.click();
      await expect(summary.locator("..")).not.toHaveAttribute("open", "");
      await summary.press("Enter");
      await expect(summary.locator("..")).toHaveAttribute("open", "");
    }
    await page.getByRole("button", { name: "Jump to kids arena" }).click();
    await expect(page.locator("#play")).toBeFocused();
    await page.getByRole("button", { name: "Present", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Present", exact: true })).toBeFocused();
    await page.getByRole("button", { name: "Play kids dilemmas", exact: true }).click();
    await expect(page.locator(".kids-question-label")).toHaveText(`Question 1 of ${kidsCount}`);
    await page.getByRole("link", { name: "Browse all questions", exact: true }).click();
    await expect(page).toHaveURL(/\/find-questions$/);
  });
test("aggregate voting, no persistent identity, age filters, retry, shortcuts and theme", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Next question", exact: true }).click();
  await page.locator(".kids-choice-b").click();
  await expect(page.locator(".kids-choice-b")).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await page.getByRole("button", { name: "Next question", exact: true }).click();
  await expect(page.locator(".kids-choice-b")).toHaveAttribute("aria-pressed", "false");
  expect((await page.context().cookies()).some((cookie) => cookie.name === "wyr_vid")).toBe(false);
  await page.locator("#play").focus();
  await page.keyboard.press("a");
  await expect(page.locator(".kids-choice-a")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Browse more kids questions", exact: true }).click();
  for (const age of ["4–6", "7–9", "10–12"]) {
    await page.getByRole("button", { name: `Ages ${age}`, exact: true }).click();
    const badges = await page.locator(".kids-reviewed-card .kids-age-tag").allTextContents();
    expect(badges.length).toBeGreaterThan(0);
    expect(badges.every((b) => b.trim() === `Ages ${age}`)).toBe(true);
  }
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.route("**/api/wyr/kids-vote?*", (r) =>
    r.fulfill({ status: 500, json: { error: "Test unavailable" } }),
  );
  await page.getByRole("button", { name: "Next question", exact: true }).click();
  await expect(page.locator(".kids-vote-error")).toContainText("Voting is unavailable");
  await page.unroute("**/api/wyr/kids-vote?*");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".kids-vote-error")).toHaveCount(0);
  await page.locator(".kids-choice-a").click();
  await expect(page.locator(".kids-choice-a")).toHaveAttribute("aria-pressed", "true");
  const foreground = await page.locator(".kids-page").evaluate((e) => getComputedStyle(e).color);
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  expect(await page.locator(".kids-page").evaluate((e) => getComputedStyle(e).color)).toBe(
    foreground,
  );
  const axe = await new AxeBuilder({ page })
    .include(".kids-page")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
});
test("620 to 621 has continuous container geometry", async ({ page }) => {
  const samples: { columns: number; fonts: string[]; arena: number }[] = [];
  for (const width of [620, 621]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    samples.push(
      await page.evaluate(() => ({
        columns: getComputedStyle(
          document.querySelector(".kids-question-grid")!,
        ).gridTemplateColumns.split(" ").length,
        fonts: [...document.querySelectorAll("h1,h2,.kids-card h3")].map(
          (e) => getComputedStyle(e).fontSize,
        ),
        arena: document.querySelector("#play")!.getBoundingClientRect().width,
      })),
    );
  }
  expect(samples[0]?.columns).toBe(samples[1]?.columns);
  samples[0]!.fonts.forEach((font, i) =>
    expect(Math.abs(parseFloat(font) - parseFloat(samples[1]!.fonts[i]!))).toBeLessThan(0.1),
  );
  expect(samples[1]!.arena - samples[0]!.arena).toBe(1);
});
