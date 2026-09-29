import { expect, test } from "@playwright/test";

import { homeConfig } from "@/config/home.config";
import { routeRegistry } from "@/config/routes.config";

test("homepage has server-rendered purpose, one H1 and meaningful navigation", async ({ page }) => {
  const home = routeRegistry.get("/");
  if (home.class !== "public_indexable") throw new Error("homepage must be indexable");

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(home.h1);
  await expect(page.locator("a[href='/pricing']").first()).toBeVisible();
  await expect(page.getByText(/best online tool/i)).toHaveCount(0);

  const html = await response?.text();
  expect(html).toContain(home.h1);

  // The configured hero copy must be present in the server response rather than
  // injected on the client. Compare against the longest fragment that carries no
  // HTML-escapable character, so this holds for any product's wording.
  const hero = homeConfig.sections.find((section) => section.type === "hero");
  if (!hero) throw new Error("homepage must configure a hero section");
  const serverRenderedFragment = hero.lead
    .split(/[&<>"']/)
    .reduce((longest, part) => (part.length > longest.length ? part : longest), "")
    .trim();
  expect(serverRenderedFragment.length).toBeGreaterThan(20);
  expect(html).toContain(serverRenderedFragment);
});


test("homepage primary keyword word-share stays near three percent", async ({ page }) => {
  await page.goto("/");

  const phrase = "would you rather questions";
  const phraseWordCount = phrase.split(" ").length;
  const mainText = (await page.locator("main").innerText())
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9'\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = mainText.match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g) ?? [];
  const occurrences = mainText.match(new RegExp(phrase, "g"))?.length ?? 0;
  const density = words.length === 0 ? 0 : (occurrences * phraseWordCount * 100) / words.length;

  console.info(
    `homepage keyword density: ${density.toFixed(2)}% (${occurrences} exact phrases / ${words.length} words)`,
  );

  expect(
    density,
    `expected "${phrase}" word-share density to be 2.8%-3.2%, observed ${density.toFixed(2)}%`,
  ).toBeGreaterThanOrEqual(2.8);
  expect(density).toBeLessThanOrEqual(3.2);
});

test("homepage does not overflow a 375px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
