import { expect, test } from "@playwright/test";

const startupBadgeSelector = "[data-home-startup-fame-badge]";
const betterLaunchBadgeSelector = "[data-home-better-launch-badge]";
const footerSelector = "[data-site-footer]";
const badgeAfterFooterSelector =
  "xpath=//*[@data-site-footer]/following::*[@data-home-startup-fame-badge]";
const startupBadgeLink = "https://startupfa.me/s/wyrplay?utm_source=www.wyrplay.com";
const startupBadgeImage = "https://startupfa.me/badge?t=small&theme=default";
const betterLaunchLink = "https://www.betterlaunch.co/product/wyr-play";
const betterLaunchImage = "https://www.betterlaunch.co/badge-live-gradient.svg";
const shipstryLink = "https://shipstry.com/";
const shipstryImage = "https://shipstry.com/badges/featured.svg";
const startupBaseLink =
  "https://startupbase.io/products/wyr-play?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light";
const startupBaseImage = "https://statics.startupbase.io/site/badges/launched-on-sb.svg";

test("homepage badges are server-rendered below footer only", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.locator(footerSelector)).toHaveCount(1);
  await expect(page.locator(badgeAfterFooterSelector)).toHaveCount(1);

  const badgeRow = page.locator(startupBadgeSelector);
  await expect(badgeRow).toBeVisible();

  const startupLink = badgeRow.locator(`a[href="${startupBadgeLink}"]`);
  await expect(startupLink).toHaveAttribute("target", "_blank");
  await expect(startupLink).toHaveAttribute("rel", "noopener noreferrer");

  const startupImage = startupLink.locator("img");
  await expect(startupImage).toHaveAttribute("src", startupBadgeImage);
  await expect(startupImage).toHaveAttribute("alt", "WYR Play - Featured on Startup Fame");
  await expect(startupImage).toHaveAttribute("width", "240");
  await expect(startupImage).toHaveAttribute("height", "36");

  const betterLaunchLinkElement = page.locator(betterLaunchBadgeSelector);
  await expect(betterLaunchLinkElement).toBeVisible();
  await expect(betterLaunchLinkElement).toHaveAttribute("href", betterLaunchLink);
  await expect(betterLaunchLinkElement).toHaveAttribute("target", "_blank");
  await expect(betterLaunchLinkElement).toHaveAttribute("rel", "noopener noreferrer");

  const betterLaunchImageElement = betterLaunchLinkElement.locator("img");
  await expect(betterLaunchImageElement).toHaveAttribute("src", betterLaunchImage);
  await expect(betterLaunchImageElement).toHaveAttribute("alt", "Launching on Better Launch");
  await expect(betterLaunchImageElement).toHaveAttribute("width", "200");
  await expect(betterLaunchImageElement).toHaveAttribute("height", "56");

  const shipstryLinkElement = badgeRow.locator(`a[href="${shipstryLink}"]`);
  await expect(shipstryLinkElement).toHaveAttribute("target", "_blank");
  await expect(shipstryLinkElement).toHaveAttribute("rel", "noopener noreferrer");

  const shipstryImageElement = shipstryLinkElement.locator("img");
  await expect(shipstryImageElement).toHaveAttribute("src", shipstryImage);
  await expect(shipstryImageElement).toHaveAttribute("alt", "Featured on Shipstry");
  await expect(shipstryImageElement).toHaveAttribute("width", "220");
  await expect(shipstryImageElement).toHaveAttribute("height", "52");

  const startupBaseLinkElement = badgeRow.locator(`a[href="${startupBaseLink}"]`);
  await expect(startupBaseLinkElement).toHaveAttribute("target", "_blank");
  await expect(startupBaseLinkElement).toHaveAttribute("rel", "noopener noreferrer");

  const startupBaseImageElement = startupBaseLinkElement.locator("img");
  await expect(startupBaseImageElement).toHaveAttribute("src", startupBaseImage);
  await expect(startupBaseImageElement).toHaveAttribute("alt", "Launched on StartupBase");
  await expect(startupBaseImageElement).toHaveAttribute("height", "55");
  expect(await startupBaseImageElement.evaluate((image) => image.style.width)).toBe("auto");

  const badgeHrefs = await badgeRow.locator(":scope > a").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  );
  expect(badgeHrefs).toEqual([startupBadgeLink, betterLaunchLink, shipstryLink, startupBaseLink]);

  for (const route of ["/find-questions", "/would-you-rather-questions-for-kids"]) {
    await page.goto(route);
    await expect(page.locator(startupBadgeSelector)).toHaveCount(0);
    await expect(page.locator(`a[href="${startupBadgeLink}"]`)).toHaveCount(0);
    await expect(page.locator(`a[href="${betterLaunchLink}"]`)).toHaveCount(0);
    await expect(page.locator(`a[href="${shipstryLink}"]`)).toHaveCount(0);
    await expect(page.locator(`a[href="${startupBaseLink}"]`)).toHaveCount(0);
  }

  await context.close();
});
