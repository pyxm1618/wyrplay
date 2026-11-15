import { expect, test } from "@playwright/test";

const INNER_ROUTES = ["/find-questions", "/would-you-rather-questions-for-kids"] as const;

test("Startup Fame badge is present in the server HTML after the footer", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);

  const html = await response.text();
  const footerIndex = html.indexOf("data-site-footer");
  const badgeIndex = html.indexOf("data-home-startup-fame-badge");

  expect(footerIndex).toBeGreaterThan(-1);
  expect(badgeIndex).toBeGreaterThan(footerIndex);

  for (const route of INNER_ROUTES) {
    const routeResponse = await request.get(route);
    expect(routeResponse.ok(), route).toBe(true);
    expect((await routeResponse.text()).includes("data-home-startup-fame-badge"), route).toBe(false);
  }
});

test("Startup Fame badge appears only on the homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("[data-site-footer]")).toHaveCount(1);

  const badge = page.locator("[data-home-startup-fame-badge]");
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

  for (const route of INNER_ROUTES) {
    await page.goto(route);
    await expect(page.locator("[data-home-startup-fame-badge]"), route).toHaveCount(0);
  }
});
