import { expect, test } from "@playwright/test";

test("Startup Fame badge appears only below the homepage footer", async ({ page }) => {
  await page.goto("/");

  const footer = page.locator("[data-site-footer]");
  const badge = page.locator("[data-home-startup-fame-badge]");
  await expect(footer).toHaveCount(1);
  await expect(badge).toBeVisible();

  expect(
    await badge.evaluate((element) => element.previousElementSibling?.matches("[data-site-footer]")),
  ).toBe(true);

  const link = badge.locator("a");
  await expect(link).toHaveAttribute(
    "href",
    "https://startupfa.me/s/wyrplay?utm_source=www.wyrplay.com",
  );
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");

  const image = badge.locator("img");
  await expect(image).toHaveAttribute("src", "https://startupfa.me/badge?t=small&theme=default");
  await expect(image).toHaveAttribute("alt", "WYR Play - Featured on Startup Fame");
  await expect(image).toHaveAttribute("width", "240");
  await expect(image).toHaveAttribute("height", "36");

  for (const route of ["/find-questions", "/would-you-rather-questions-for-kids"]) {
    await page.goto(route);
    await expect(page.locator("[data-home-startup-fame-badge]"), route).toHaveCount(0);
  }
});
