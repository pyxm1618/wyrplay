import { expect, test } from "@playwright/test";

const badgeSelector = "[data-home-startup-fame-badge]";
const footerSelector = "[data-site-footer]";

test("Startup Fame badge is server-rendered below footer only", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/");

  const footer = page.locator(footerSelector);
  const badge = page.locator(badgeSelector);
  await expect(footer).toBeVisible();
  await expect(badge).toBeVisible();

  expect(
    await badge.evaluate((badgeElement) => {
      const footerElement = document.querySelector("[data-site-footer]");
      return (
        footerElement !== null &&
        Boolean(
          footerElement.compareDocumentPosition(badgeElement) & Node.DOCUMENT_POSITION_FOLLOWING,
        )
      );
    }),
  ).toBe(true);

  for (const route of ["/find-questions", "/would-you-rather-questions-for-kids"]) {
    await page.goto(route);
    await expect(page.locator(badgeSelector)).toHaveCount(0);
  }

  await context.close();
});

test("Startup Fame badge has the required link and image", async ({ page }) => {
  await page.goto("/");

  const badge = page.locator(badgeSelector);
  await expect(badge).toBeVisible();

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
});
