import { expect, test } from "@playwright/test";

test("Startup Fame badge is server-rendered below the homepage footer only", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);

  const html = await response.text();
  const footerHtmlIndex = html.indexOf("data-site-footer");
  const badgeHtmlIndex = html.indexOf("data-home-startup-fame-badge");
  expect(footerHtmlIndex).toBeGreaterThan(-1);
  expect(badgeHtmlIndex).toBeGreaterThan(footerHtmlIndex);

  await page.goto("/");

  const footer = page.locator("[data-site-footer]");
  const badge = page.locator("[data-home-startup-fame-badge]");
  await expect(footer).toHaveCount(1);
  await expect(badge).toBeVisible();

  expect(
    await footer.evaluate((footerElement, badgeSelector) => {
      const badgeElement = document.querySelector(badgeSelector);
      return (
        badgeElement !== null &&
        Boolean(footerElement.compareDocumentPosition(badgeElement) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    }, "[data-home-startup-fame-badge]"),
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
    const routeResponse = await request.get(route);
    expect(routeResponse.ok(), route).toBe(true);
    expect((await routeResponse.text()).includes("data-home-startup-fame-badge"), route).toBe(false);

    await page.goto(route);
    await expect(page.locator("[data-home-startup-fame-badge]"), route).toHaveCount(0);
  }
});
