import { expect, test } from "@playwright/test";

const badgeSelector = "[data-home-startup-fame-badge]";
const footerSelector = "[data-site-footer]";
const badgeLink = "https://startupfa.me/s/wyrplay?utm_source=www.wyrplay.com";
const badgeImage = "https://startupfa.me/badge?t=small&theme=default";

test("Startup Fame badge is server-rendered below footer only", async ({ page, request }) => {
  const homeResponse = await request.get("/");
  expect(homeResponse.ok()).toBe(true);

  const html = await homeResponse.text();
  expect(html.indexOf(footerSelector)).toBeGreaterThan(-1);
  expect(html.indexOf(badgeSelector)).toBeGreaterThan(html.indexOf(footerSelector));

  await page.goto("/");
  await expect(page.locator(footerSelector)).toHaveCount(1);

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
    const response = await request.get(route);
    expect(response.ok()).toBe(true);
    expect((await response.text()).includes(badgeSelector)).toBe(false);

    await page.goto(route);
    await expect(page.locator(badgeSelector)).toHaveCount(0);
  }
});
