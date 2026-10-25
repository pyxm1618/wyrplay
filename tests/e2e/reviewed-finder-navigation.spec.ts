import { expect, test } from "@playwright/test";

test("home Finder uses the approved bank independently of its hero and retains URL filters", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("[data-home-ready=true]")).toBeVisible();
  const hero = await page.locator("#play h2").first().innerText();
  const finder = page.locator(".home-live-experience");
  await finder.getByRole("button", { name: "Adults 18+", exact: true }).click();
  await finder.getByRole("button", { name: "couples", exact: true }).click();
  await expect(finder.locator("#questions article").first()).toBeVisible();
  await expect(page.locator("#play h2").first()).toHaveText(hero);
  await expect(finder.getByRole("link", { name: "Browse all questions" })).toHaveAttribute(
    "href",
    "/find-questions?age=adults&relationship=couples",
  );
  await finder
    .getByRole("textbox", { name: "Search questions by keyword" })
    .fill("xyznonexistentkeyword123456789");
  await expect(finder.getByText("No questions found", { exact: true })).toBeVisible();
  await expect(page.locator("#play h2").first()).toHaveText(hero);
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
