import { expect, test } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { readFile } from "node:fs/promises";

for (const format of ["cards", "sheet"] as const) {
  for (const paper of ["letter", "a4"] as const) {
    test(`actual browser print and vector PDF preserve ${format}/${paper} pages`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        (window as unknown as { __printCalled?: boolean }).__printCalled = false;
        window.print = () => {
          (window as unknown as { __printCalled?: boolean }).__printCalled = true;
        };
      });
      await page.goto(`/print?format=${format}`);
      await page.getByLabel("Number of questions").fill("24");
      if (paper === "a4") await page.getByRole("radio", { name: "A4" }).check();
      await expect(page.getByRole("button", { name: "Download PDF" })).toBeEnabled();
      await expect(page.locator(".print-preview header p")).toContainText("24 questions");
      const expectedPages = Number(
        (await page.locator(".print-preview header p").textContent())?.match(/of (\d+)/)?.[1],
      );
      expect(expectedPages).toBeGreaterThan(1);
      await expect(page.locator(".print-document .print-page-sheet")).toHaveCount(expectedPages);

      // 点击 Print 之前，Browser Print DOM 中尚未预生成 QR
      expect(await page.locator('.print-document img[alt="Play this set QR code"]').count()).toBe(
        0,
      );

      // 点击 Print 触发按需生成与 flushSync 挂载
      await page.getByRole("button", { name: "Print" }).click();
      await expect
        .poll(() =>
          page.evaluate(() => (window as unknown as { __printCalled?: boolean }).__printCalled),
        )
        .toBe(true);

      const qr = page.locator('.print-document img[alt="Play this set QR code"]').first();
      const url = new URL((await qr.getAttribute("data-play-url"))!);
      expect(url.pathname).toBe("/play");
      if (format === "cards") {
        expect(url.searchParams.get("set")!.split(",")).toHaveLength(1);
      } else {
        const pageCount = url.searchParams.get("set")!.split(",").length;
        expect(pageCount).toBeGreaterThan(0);
        expect(pageCount).toBeLessThan(24);
      }
      expect(await qr.getAttribute("src")).toMatch(/^data:image\/png;base64,/);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          Array.from(document.querySelectorAll<HTMLImageElement>(".print-document img")).map(
            (image) => image.decode(),
          ),
        );
      });
      const browserBytes = await page.pdf({
        preferCSSPageSize: true,
        printBackground: true,
        path: `.artifacts/closeout/browser-${format}-${paper}.pdf`,
      });
      const browserPdf = await PDFDocument.load(browserBytes);
      expect(browserPdf.getPageCount()).toBe(expectedPages);
      const isLandscape = format === "cards" && paper === "a4";
      const expectedWidth = isLandscape ? 841.89 : paper === "a4" ? 595.28 : 612;
      const expectedHeight = isLandscape ? 595.28 : paper === "a4" ? 841.89 : 792;
      expect(size.width).toBeCloseTo(expectedWidth, 0);
      expect(size.height).toBeCloseTo(expectedHeight, 0);
      await page.emulateMedia({ media: "screen" });
      const download = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download PDF" }).click();
      const output = await download;
      const path = `.artifacts/closeout/vector-${format}-${paper}.pdf`;
      await output.saveAs(path);
      const pdf = await PDFDocument.load(await readFile(path));
      expect(pdf.getPageCount()).toBe(expectedPages);
      expect(pdf.getPage(0).getWidth()).toBeCloseTo(expectedWidth, 2);
      expect(pdf.getPage(0).getHeight()).toBeCloseTo(expectedHeight, 2);
    });
  }
}

test("failed PDF asset download reports failure and never downloads a partial PDF", async ({
  page,
}) => {
  await page.goto("/print");
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeEnabled();
  await page.route("**/finder/fonts/roboto-700.ttf", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  let downloads = 0;
  page.on("download", () => downloads++);
  await page.getByRole("button", { name: "Download PDF" }).click();
  await expect(page.locator(".print-preview [role=alert]")).toContainText(
    "PDF export failed. No file was downloaded.",
  );
  expect(downloads).toBe(0);
});

test("PNG export has 300 DPI pixel dimensions and transparent corners", async ({ page }) => {
  await page.goto("/print");
  await expect(page.getByRole("button", { name: "PNG", exact: true })).toBeEnabled();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  const path = ".artifacts/closeout/page-300dpi.png";
  await (await download).saveAs(path);
  const metadata = await sharp(path).metadata();
  expect(metadata.width).toBe(2550);
  expect(metadata.height).toBe(3300);
  expect(metadata.density).toBe(300);
  const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true });
  expect(info.channels).toBe(4);
  expect(data[3]).toBe(0);
});

test("browser fullscreen exit closes Presenter and restores focus", async ({ page }) => {
  await page.goto("/play");
  const present = page.getByRole("button", { name: "Present", exact: true });
  await present.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await page.evaluate(() => document.exitFullscreen());
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(present).toBeFocused();
});

test("preview fits both dimensions at 100 percent across requested viewports", async ({ page }) => {
  await page.goto("/print?format=sheet");
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeEnabled();
  for (const [width, height] of [
    [390, 844],
    [800, 900],
    [1200, 900],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
    [2560, 1440],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    await expect
      .poll(() =>
        page
          .locator(".preview-paper-viewport")
          .evaluate(
            (el) => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight + 1,
          ),
      )
      .toBe(true);
    await page.screenshot({
      path: `.artifacts/closeout/sheet-${width}x${height}.png`,
      fullPage: true,
    });
  }
  await page.goto("/play?present=1");
  for (const [width, height] of [
    [390, 844],
    [1366, 768],
    [1920, 1080],
    [2560, 1440],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.screenshot({ path: `.artifacts/closeout/presenter-${width}x${height}.png` });
  }
});

test("disabling Include QR Code removes QR from Browser Print, PDF, and PNG", async ({ page }) => {
  await page.goto("/print");
  await expect(page.getByRole("button", { name: "Download PDF" })).toBeEnabled();

  const qrCheckbox = page.getByLabel("Include QR Code");
  await qrCheckbox.uncheck();
  await expect(qrCheckbox).not.toBeChecked();

  // 1. Browser Print DOM has no QR code images
  await expect(page.locator('.print-document img[alt="Play this set QR code"]')).toHaveCount(0);

  // 2. Download PDF without QR code succeeds
  const pdfDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  const pdf = await pdfDownload;
  const pdfPath = ".artifacts/closeout/qr-off.pdf";
  await pdf.saveAs(pdfPath);
  const pdfDoc = await PDFDocument.load(await readFile(pdfPath));
  expect(pdfDoc.getPageCount()).toBeGreaterThan(0);

  // 3. PNG without QR code succeeds
  const pngDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  const png = await pngDownload;
  const pngPath = ".artifacts/closeout/qr-off.png";
  await png.saveAs(pngPath);
  const metadata = await sharp(pngPath).metadata();
  expect(metadata.width).toBe(2550);
});

test("Browser Print lazy generation prepares DOM and images before calling window.print", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (
      window as unknown as {
        __printCheck?: {
          called: boolean;
          qrCount: number;
          allDecoded: boolean;
          allHaveValidSrc: boolean;
          allHaveValidUrl: boolean;
        };
      }
    ).__printCheck = {
      called: false,
      qrCount: 0,
      allDecoded: false,
      allHaveValidSrc: false,
      allHaveValidUrl: false,
    };

    window.print = () => {
      const imgs = Array.from(
        document.querySelectorAll<HTMLImageElement>(
          '.print-document img[alt="Play this set QR code"]',
        ),
      );
      (
        window as unknown as {
          __printCheck: {
            called: boolean;
            qrCount: number;
            allDecoded: boolean;
            allHaveValidSrc: boolean;
            allHaveValidUrl: boolean;
          };
        }
      ).__printCheck = {
        called: true,
        qrCount: imgs.length,
        allDecoded: imgs.length > 0 && imgs.every((img) => img.complete && img.naturalWidth > 0),
        allHaveValidSrc:
          imgs.length > 0 && imgs.every((img) => img.src.startsWith("data:image/png;base64,")),
        allHaveValidUrl:
          imgs.length > 0 &&
          imgs.every((img) => {
            const url = img.getAttribute("data-play-url");
            return url !== null && url.includes("/play?set=");
          }),
      };
    };
  });

  await page.goto("/print?format=cards");
  await expect(page.getByRole("button", { name: "Print" })).toBeEnabled();

  // 1. 在未点击 Print 前，Browser Print DOM 中没有预先生成全部 512 个 QR
  const preQrCount = await page.locator('.print-document img[alt="Play this set QR code"]').count();
  expect(preQrCount).toBe(0);

  // 2. 点击 Print 触发按需生成与 flushSync 挂载
  await page.getByRole("button", { name: "Print" }).click();

  // 3. 验证 window.print 已经被调用，且在被调用的瞬间，所有检查项均已就绪
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as {
              __printCheck?: { called: boolean };
            }
          ).__printCheck?.called,
      ),
    )
    .toBe(true);

  const checkResult = await page.evaluate(
    () =>
      (
        window as unknown as {
          __printCheck: {
            called: boolean;
            qrCount: number;
            allDecoded: boolean;
            allHaveValidSrc: boolean;
            allHaveValidUrl: boolean;
          };
        }
      ).__printCheck,
  );

  expect(checkResult.called).toBe(true);
  expect(checkResult.qrCount).toBe(512);
  expect(checkResult.allHaveValidSrc).toBe(true);
  expect(checkResult.allHaveValidUrl).toBe(true);
  expect(checkResult.allDecoded).toBe(true);
});
