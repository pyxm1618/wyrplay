import { expect, test } from "@playwright/test";

const badgeSelector = "[data-home-startup-fame-badge]";
const footerSelector = "[data-site-footer]";
const badgeAfterFooterSelector =
  "xpath=//*[@data-site-footer]/following::*[@data-home-startup-fame-badge]";
const badgeLink = "https://startupfa.me/s/wyrplay?utm_source=www.wyrplay.com";
const badgeImage = "https://startupfa.me/badge?t=small&theme=default";

test("Startup Fame badge is server-rendered below footer only", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.locator(footerSelector)).toHaveCount(1);
  await expect(page.locator(badgeAfterFooterSelector)).toHaveCount(1);

  const badge = page.locator(badgeSelector);
  await expect(badge).toBeVisible();

  const link = badge.locator("a");
  await expect(link).toHaveAttribute("href", badgeLink);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");

  const image = badge.locator("img");
  await expect(image).toHaveAttribute("src", badgeImage);
  await expect(image).toHaveAttribute("alt", "WYR Play - Featured on Startup Fame");
  await expect(image).toHaveAttribute("width", "240");
  await expect(image).toHaveAttribute("height", "36");

  for (const route of ["/find-questions", "/would-you-rather-questions-for-kids"]) {
    await page.goto(route);
    await expect(page.locator(badgeSelector)).toHaveCount(0);
  }

  await context.close();
});
