import { expect, test } from "@playwright/test";

for (const route of ["/", "/funny-would-you-rather-questions", "/play?set=1,2"]) {
  test(`presenter owns styles and restores overlay state on ${route}`, async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        value: () => Promise.reject(new DOMException("Denied", "NotAllowedError")),
      });
    });
    await page.goto(route);
    const previousOverflow = await page.evaluate(() => document.body.style.overflow);
    const trigger = page.getByRole("button", {
      name: route.startsWith("/play") ? "Present" : "Presenter Mode",
      exact: true,
    });
    await trigger.click();
    const presenter = page.getByRole("dialog");
    await expect(presenter).toBeVisible();
    await expect(presenter).toHaveCSS("position", "fixed");
    await expect(presenter).toHaveCSS("font-family", "PlayBody, Arial, sans-serif");
    await expect(presenter.locator(".play-options")).toHaveCSS("display", "grid");
    await expect(page.locator("[data-site-header]")).toBeHidden();
    await expect(page.locator("[data-site-footer]")).toBeHidden();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expect(presenter.locator(".option-panel h2").first()).toHaveCSS(
      "font-family",
      "PlayHand",
    );
    await page.screenshot({ path: test.info().outputPath("presenter.png") });
    await page.setViewportSize({ width: 375, height: 900 });
    await expect(presenter.locator(".option-panel h2").first()).toHaveCSS(
      "font-family",
      "PlayHand",
    );
    expect(await presenter.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath("presenter-mobile.png") });
    await presenter.getByRole("button", { name: "Exit Presenter" }).click();
    await expect(presenter).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(previousOverflow);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(presenter).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(previousOverflow);
  });
}

test("direct print entry loads its actual preview fonts and keeps privacy footer accessible", async ({
  page,
}) => {
  await page.goto("/print?set=1");
  await expect(page.locator(".preview-paper")).toBeVisible();
  const fonts = await page.evaluate(async () => {
    const hand = await document.fonts.load("26px PlayHand");
    const body = await document.fonts.load("11px PlayBody");
    return { hand: hand.length, body: body.length };
  });
  expect(fonts.hand).toBeGreaterThan(0);
  expect(fonts.body).toBeGreaterThan(0);
  await expect(page.locator("[data-site-footer]")).toBeVisible();
  await expect(
    page.locator("[data-site-footer]").getByRole("button", { name: /Privacy.*cookie settings/i }),
  ).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("print-direct.png"), fullPage: true });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("[data-site-footer]")).toBeHidden();
});

test("single question play exposes the end of the set and retains the site footer", async ({
  page,
}) => {
  await page.goto("/play?set=1");
  await expect(page.locator(".question-navigation")).toContainText("Last question");
  await expect(page.getByRole("button", { name: "Previous question", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next question", exact: true })).toBeDisabled();
  await expect(page.locator("[data-site-footer]")).toBeVisible();
});
