import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { PDFDocument, PDFName, PDFNumber, PDFRawStream } from "pdf-lib";

test.setTimeout(90_000);

// Uses the approved R2 masters and the real image optimizer; no image response mocks.
test("approved artwork loads in Normal Kids and Present at mobile and desktop sizes", async ({
  page,
}) => {
  await page.goto("/would-you-rather-questions-for-kids");
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const arena = page.locator(".kids-vote-arena");
    const images = arena.locator(".question-visual-img");
    await expect(images).toHaveCount(2);
    for (const image of await images.all()) {
      await expect
        .poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
    await expect(arena.locator('[data-mode="option-a"]')).toHaveCount(1);
    await expect(arena.locator('[data-mode="option-b"]')).toHaveCount(1);
    await page.getByRole("button", { name: "Present", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator(".question-visual-img")).toHaveCount(2);
    for (const image of await dialog.locator(".question-visual-img").all()) {
      await expect
        .poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
    await page.screenshot({ path: `.artifacts/kids-visual-v1/present-${width}.png` });
    await dialog.getByRole("button", { name: "Close ×" }).click();
    await arena.screenshot({ path: `.artifacts/kids-visual-v1/normal-${width}.png` });
  }
});

test("R2 masters survive A4 2x2 browser print, PNG and vector PDF export", async ({ page }) => {
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") warnings.push(message.text());
  });
  await page.goto("/print?format=cards&set=wyr-000001,wyr-000002,wyr-000003,wyr-000004");
  await page.getByRole("radio", { name: "A4" }).check();
  await expect(page.getByRole("img", { name: "Print preview page 1" })).toBeVisible();
  await expect(page.locator(".print-document .print-page-sheet")).toHaveCount(1);
  const masters = page.locator('.print-document img[src^="https://media.wyrplay.com/"]');
  await expect(masters).toHaveCount(8);
  for (const image of await masters.all())
    await expect(image).toHaveAttribute("crossorigin", "anonymous");
  await masters.evaluateAll(async (images) => {
    await Promise.all(images.map((image) => (image as HTMLImageElement).decode()));
  });
  const pngPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  const png = await pngPromise;
  await png.saveAs(".artifacts/kids-visual-v1/cards.png");
  expect((await readFile(".artifacts/kids-visual-v1/cards.png")).subarray(1, 4).toString()).toBe(
    "PNG",
  );
  const pdfPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  const pdf = await pdfPromise;
  await pdf.saveAs(".artifacts/kids-visual-v1/cards.pdf");
  const document = await PDFDocument.load(await readFile(".artifacts/kids-visual-v1/cards.pdf"));
  expect(document.getPageCount()).toBe(1);
  expect(document.getPage(0).getWidth()).toBeCloseTo(841.89, 1);
  expect(document.getPage(0).getHeight()).toBeCloseTo(595.28, 1);
  const embeddedMasters = document.context
    .enumerateIndirectObjects()
    .filter(
      ([, object]) =>
        object instanceof PDFRawStream &&
        object.dict.get(PDFName.of("Subtype")) === PDFName.of("Image") &&
        (object.dict.get(PDFName.of("Width")) as PDFNumber | undefined)?.asNumber() === 1774 &&
        (object.dict.get(PDFName.of("Height")) as PDFNumber | undefined)?.asNumber() === 887,
    );
  expect(embeddedMasters, warnings.join("\n")).toHaveLength(4);
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
    path: ".artifacts/kids-visual-v1/browser-print.pdf",
  });
  expect(
    warnings.filter((warning) => /visual|cors|content security policy/i.test(warning)),
  ).toEqual([]);
});
