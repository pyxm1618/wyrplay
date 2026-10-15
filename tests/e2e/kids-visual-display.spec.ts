import { expect, test } from "@playwright/test";

for (const [width, height] of [
  [1440, 900],
  [1280, 720],
  [390, 844],
] as const) {
  test(`illustrations dominate Kids cards at ${width}×${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.goto("/would-you-rather-questions-for-kids");
    const arena = page.locator(".kids-vote-arena");
    await expect(arena.locator(".kids-choice")).toHaveCount(2);
    for (const card of await arena.locator(".kids-choice").all()) {
      const image = await card.locator(".kids-choice-visual").boundingBox();
      const caption = await card.locator(".kids-choice-text").boundingBox();
      const box = await card.boundingBox();
      expect(image).not.toBeNull();
      expect(image!.width).toBeGreaterThan(box!.width * 0.9);
      expect(image!.height).toBeCloseTo(image!.width, 0);
      expect(caption!.y).toBeGreaterThanOrEqual(image!.y + image!.height - 1);
      expect(image!.height).toBeGreaterThan(caption!.height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await arena.screenshot({ path: info.outputPath("normal.png") });
  });
}
for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
] as const) {
  test(`Present uses projector-sized artwork at ${width}×${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    await page.goto("/would-you-rather-questions-for-kids");
    const normal = await page.locator(".kids-vote-arena .kids-choice-visual").first().boundingBox();
    await page.getByRole("button", { name: "Present", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator(".kids-choice-visual")).toHaveCount(2);
    const image = await dialog.locator(".kids-choice-visual").first().boundingBox();
    expect(image!.width).toBeGreaterThan(normal!.width * 1.2);
    expect(image!.width).toBeGreaterThan(420);
    await expect(dialog.getByRole("button", { name: "Next question →" })).toBeInViewport();
    await page.screenshot({ path: info.outputPath("present.png") });
  });
}
