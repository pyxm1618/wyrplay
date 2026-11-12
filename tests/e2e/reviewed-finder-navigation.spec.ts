import { expect, test } from "@playwright/test";

test("homepage hands off to the dedicated Finder and Finder retains URL filters", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "See all categories", exact: true }).click();
  await expect(page).toHaveURL(/\/find-questions$/);

  const filters = page.locator('aside[aria-label="Question filters"]');
  await filters.getByRole("button", { name: "Adults", exact: true }).click();
  await filters.getByRole("button", { name: "Couples", exact: true }).click();
  await filters.getByRole("button", { name: "Apply Filters" }).click();
  await expect(page).toHaveURL(/\/find-questions\?age=adults&relationship=couples$/);
  await expect(page.locator("#questions .question-card").first()).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Search questions" });
  await search.fill("xyznonexistentkeyword123456789");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByText("No questions found", { exact: true })).toBeVisible();
});
test("document boundaries reload while ordinary routes retain SPA navigation", async ({ page }) => {
  await page.goto("/find-questions");
  await page.evaluate(() => {
    (window as Window & { boundaryMarker?: boolean }).boundaryMarker = true;
  });
  await page
    .locator("[data-site-header]")
    .getByRole("link", { name: "WYRPlay Home", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  expect(
    await page.evaluate(() => (window as Window & { boundaryMarker?: boolean }).boundaryMarker),
  ).toBeUndefined();
  await expect(page.getByRole("button", { name: "Toggle theme" })).toHaveCount(0);
  await page.goto("/funny-would-you-rather-questions");
  await page.evaluate(() => {
    (window as Window & { boundaryMarker?: boolean }).boundaryMarker = true;
  });
  await page
    .locator("[data-site-header]")
    .getByRole("link", { name: "Find Questions", exact: true })
    .click();
  await expect(page).toHaveURL(/\/find-questions$/);
  expect(
    await page.evaluate(() => (window as Window & { boundaryMarker?: boolean }).boundaryMarker),
  ).toBe(true);
});
