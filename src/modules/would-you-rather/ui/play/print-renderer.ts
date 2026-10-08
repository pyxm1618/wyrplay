import QRCode from "qrcode";
import type { Question } from "../../types";
import type { PrintLayout, PrintFormat } from "../../domain/print-layout";
import { wrapPrintText } from "../../domain/print-layout";
import { questionPoolUrl } from "../../domain/question-pool";

export const PRINT_QR_CONFIG = {
  margin: 4,
  errorCorrectionLevel: "M" as const,
  cards: {
    sizePt: 34,
  },
  sheet: {
    sizePt: 52,
  },
} as const;

export function getCardPlayUrl(question: { id: string }, origin?: string): string {
  const path = questionPoolUrl("/play", [question as Question]);
  return origin ? new URL(path, origin).href : path;
}

export function getSheetPagePlayUrl(
  items: readonly { readonly question: Question }[] | readonly Question[],
  origin?: string,
): string {
  const questions: Question[] = items.map((item) =>
    "optionA" in item ? (item as Question) : (item.question as Question),
  );
  const path = questionPoolUrl("/play", questions);
  return origin ? new URL(path, origin).href : path;
}

export function calculateQrModuleSizeMm(
  matrixModules: number,
  sizePt: number,
  margin: number = PRINT_QR_CONFIG.margin,
): number {
  const physicalSizeMm = (sizePt * 25.4) / 72;
  const totalModules = matrixModules + margin * 2;
  return physicalSizeMm / totalModules;
}

const qrDataUrlCache = new Map<string, string>();
export async function getQrDataUrl(
  url: string,
  margin: number = PRINT_QR_CONFIG.margin,
  width = 256,
): Promise<string> {
  const key = `${margin}:${width}:${url}`;
  const cached = qrDataUrlCache.get(key);
  if (cached) return cached;
  const dataUrl = await QRCode.toDataURL(url, {
    margin,
    errorCorrectionLevel: PRINT_QR_CONFIG.errorCorrectionLevel,
    width,
  });
  qrDataUrlCache.set(key, dataUrl);
  return dataUrl;
}

const qrImageCache = new Map<string, HTMLImageElement>();
export async function getQrImage(
  url: string,
  margin: number = PRINT_QR_CONFIG.margin,
  width = 256,
): Promise<HTMLImageElement> {
  const key = `${margin}:${width}:${url}`;
  const cached = qrImageCache.get(key);
  if (cached) return cached;
  const dataUrl = await getQrDataUrl(url, margin, width);
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  qrImageCache.set(key, img);
  return img;
}

export type QrSource =
  | HTMLImageElement
  | null
  | undefined
  | Map<string, HTMLImageElement>
  | ((question: Question, placementIndex: number) => HTMLImageElement | null | undefined);

export interface RenderPrintOptions {
  readonly showNumbers?: boolean | undefined;
  readonly qrCode?: boolean | undefined;
  readonly dpi?: number;
  readonly transparent?: boolean;
  readonly siteUrl?: string | undefined;
}

async function fetchPrintAsset(path: string): Promise<ArrayBuffer> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Print asset ${path} returned HTTP ${response.status}`);
  return response.arrayBuffer();
}

let fontCache: {
  playHand: ArrayBuffer;
  playBody: ArrayBuffer;
  playBodyBold: ArrayBuffer;
} | null = null;

export async function loadPrintFonts(): Promise<{
  playHand: ArrayBuffer;
  playBody: ArrayBuffer;
  playBodyBold: ArrayBuffer;
}> {
  if (fontCache) return fontCache;
  const [playHand, playBody, playBodyBold] = await Promise.all([
    fetchPrintAsset("/finder/fonts/lilita-one.ttf"),
    fetchPrintAsset("/finder/fonts/roboto-400.ttf"),
    fetchPrintAsset("/finder/fonts/roboto-700.ttf"),
  ]);
  fontCache = { playHand, playBody, playBodyBold };
  return fontCache;
}

let logoCache: ArrayBuffer | null = null;
export async function loadLogoBytes(): Promise<ArrayBuffer> {
  if (logoCache) return logoCache;
  const bytes = await fetchPrintAsset("/play-art/logo.png");
  logoCache = bytes;
  return bytes;
}

/**
 * 按需预览默认144 DPI；独立PNG导出可指定300 DPI与透明底
 */
export function renderSinglePrintPage(
  layout: PrintLayout,
  pageIndex: number,
  format: PrintFormat,
  marks: boolean,
  logo: HTMLImageElement,
  options: RenderPrintOptions = {},
  qrSource?: QrSource,
): HTMLCanvasElement {
  const placements = layout.pages[pageIndex] ?? [];
  const canvas = document.createElement("canvas");
  const scale = (options.dpi ?? 144) / 72;
  canvas.width = Math.round(layout.width * scale);
  canvas.height = Math.round(layout.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser does not support printable canvas output");

  ctx.scale(scale, scale);
  if (!options.transparent) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, layout.width, layout.height);
  }
  ctx.fillStyle = "#090e20";

  const showNumbers = options.showNumbers !== false;

  const text = (value: string, x: number, y: number, width: number, size = 11) => {
    ctx.font = `${size}px PlayBody, Arial`;
    const lines = wrapPrintText(value, width, (t) => ctx.measureText(t).width);
    lines.forEach((line, i) => ctx.fillText(line, x, y + i * 14));
  };

  if (format === "sheet") {
    ctx.drawImage(logo, 30, 22, 120, 40);
    ctx.fillStyle = "#090e20";
    ctx.font = "26px PlayHand";
    ctx.fillText("Would You Rather?", 30, 86);

    if (options.qrCode && qrSource) {
      let sheetQr: HTMLImageElement | null = null;
      if (qrSource instanceof HTMLImageElement) {
        sheetQr = qrSource;
      } else if (qrSource instanceof Map) {
        const pageUrl = getSheetPagePlayUrl(placements, options.siteUrl);
        sheetQr = qrSource.get(pageUrl) ?? qrSource.get(getSheetPagePlayUrl(placements)) ?? null;
      } else if (typeof qrSource === "function" && placements[0]) {
        sheetQr = qrSource(placements[0].question, 0) ?? null;
      }
      if (sheetQr) {
        const qrSize = PRINT_QR_CONFIG.sheet.sizePt;
        const qrX = layout.width - 30 - qrSize;
        const qrY = 16;
        ctx.drawImage(sheetQr, qrX, qrY, qrSize, qrSize);
        ctx.font = "8px PlayBody, Arial";
        ctx.fillStyle = "#666";
        const label = "Play Online";
        const labelWidth = ctx.measureText(label).width;
        ctx.fillText(label, qrX + (qrSize - labelWidth) / 2, qrY + qrSize + 10);
      }
    }
  }

  placements.forEach((p, pIndex) => {
    if (format === "cards") {
      if (marks) {
        ctx.strokeStyle = "#a7a1a0";
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(p.x, p.y, p.width, p.height);
        ctx.setLineDash([]);
        ctx.font = "11px Arial";
        ctx.fillStyle = "#68544b";
        ctx.fillText("✂", p.x - 4, p.y);
      }
      ctx.drawImage(logo, p.x + p.width / 2 - 40, p.y + 10, 80, 26);
      ctx.fillStyle = "#090e20";
      ctx.font = "19px PlayHand";
      ctx.textAlign = "center";
      ctx.fillText("Would you rather", p.x + p.width / 2, p.y + 57);
      ctx.textAlign = "left";

      if (showNumbers) {
        ctx.font = "bold 9px PlayBody, Arial";
        ctx.fillStyle = "#9ba3af";
        ctx.fillText(`#${p.number}`, p.x + 12, p.y + 20);
      }

      if (options.qrCode && qrSource) {
        let cardQr: HTMLImageElement | null = null;
        if (qrSource instanceof HTMLImageElement) {
          cardQr = qrSource;
        } else if (qrSource instanceof Map) {
          const cardUrl = getCardPlayUrl(p.question, options.siteUrl);
          cardQr = qrSource.get(cardUrl) ?? qrSource.get(p.question.id) ?? null;
        } else if (typeof qrSource === "function") {
          cardQr = qrSource(p.question, pIndex) ?? null;
        }
        if (cardQr) {
          const qrSize = PRINT_QR_CONFIG.cards.sizePt;
          const qrX = p.x + p.width - qrSize - 10;
          const qrY = p.y + 8;
          ctx.drawImage(cardQr, qrX, qrY, qrSize, qrSize);
        }
      }

      const a = wrapPrintText(p.question.optionA, p.width - 55, (t) => {
        ctx.font = "11px PlayBody";
        return ctx.measureText(t).width;
      });
      const ay = p.y + 80;
      const by = ay + a.length * 14 + 24;
      [
        ["A", ay, "#ff3457", p.question.optionA],
        ["B", by, "#008cff", p.question.optionB],
      ].forEach(([label, yPos, color, option]) => {
        const yy = Number(yPos);
        ctx.fillStyle = String(color);
        ctx.beginPath();
        ctx.arc(p.x + 20, yy - 4, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 11px Arial";
        ctx.fillText(String(label), p.x + 16, yy);
        ctx.fillStyle = "#090e20";
        text(String(option), p.x + 40, yy, p.width - 55);
      });
    } else {
      ctx.fillStyle = "#090e20";
      if (showNumbers) {
        ctx.font = "bold 11px PlayBody, Arial";
        ctx.fillText(String(p.number).padStart(2, "0"), p.x, p.y + 15);
      }
      const textOffset = showNumbers ? 40 : 0;
      text(p.question.question, p.x + textOffset, p.y + 15, p.width - (showNumbers ? 110 : 70));
      if (marks) {
        ["A", "B"].forEach((option, i) => {
          ctx.strokeStyle = "#a9b8cf";
          ctx.beginPath();
          ctx.arc(layout.width - 95 + i * 45, p.y + 12, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#090e20";
          ctx.font = "11px PlayBody, Arial";
          ctx.fillText(option, layout.width - 83 + i * 45, p.y + 16);
        });
      }
      ctx.strokeStyle = "#e7e9ed";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + p.height);
      ctx.lineTo(p.x + p.width, p.y + p.height);
      ctx.stroke();
    }
  });

  return canvas;
}

/**
 * 原有的 renderPrintPages 兼容实现
 */
export function renderPrintPages(
  layout: PrintLayout,
  format: PrintFormat,
  marks: boolean,
  logo: HTMLImageElement,
  options: RenderPrintOptions = {},
): HTMLCanvasElement[] {
  return layout.pages.map((_, i) => renderSinglePrintPage(layout, i, format, marks, logo, options));
}

/**
 * 使用 pdf-lib 与 fontkit 生成纯正矢量 PDF
 * 文本为真实 PDF text，字体嵌入 Roboto & Lilita One，支持无限放大无损且可搜索复制
 */
export async function createVectorPdf(
  layout: PrintLayout,
  format: PrintFormat,
  marks: boolean,
  options: RenderPrintOptions = {},
): Promise<Blob> {
  const [{ PDFDocument, rgb }, { default: fontkit }] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit"),
  ]);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const [fonts, logoBytes] = await Promise.all([loadPrintFonts(), loadLogoBytes()]);
  const playHandFont = await doc.embedFont(fonts.playHand, { subset: true });
  const playBodyFont = await doc.embedFont(fonts.playBody, { subset: true });
  const playBodyBoldFont = await doc.embedFont(fonts.playBodyBold, { subset: true });
  const embeddedLogo = await doc.embedPng(logoBytes);

  const embeddedQrMap = new Map<string, Awaited<ReturnType<typeof doc.embedPng>>>();
  if (options.qrCode) {
    const origin = options.siteUrl ?? "https://wyrplay.com";
    const urlsToEmbed = new Set<string>();
    if (format === "sheet") {
      layout.pages.forEach((pagePlacements) => {
        urlsToEmbed.add(getSheetPagePlayUrl(pagePlacements, origin));
      });
    } else {
      layout.pages.forEach((pagePlacements) => {
        pagePlacements.forEach((p) => {
          urlsToEmbed.add(getCardPlayUrl(p.question, origin));
        });
      });
    }
    await Promise.all(
      Array.from(urlsToEmbed).map(async (url) => {
        const qrDataUrl = await getQrDataUrl(url, PRINT_QR_CONFIG.margin, 256);
        const qrBytes = Uint8Array.from(atob(qrDataUrl.split(",")[1]!), (c) => c.charCodeAt(0));
        const embedded = await doc.embedPng(qrBytes);
        embeddedQrMap.set(url, embedded);
      }),
    );
  }

  const showNumbers = options.showNumbers !== false;
  const inkColor = rgb(9 / 255, 14 / 255, 32 / 255);
  const colorA = rgb(255 / 255, 52 / 255, 87 / 255);
  const colorB = rgb(0, 140 / 255, 255 / 255);
  const markLineColor = rgb(167 / 255, 161 / 255, 160 / 255);
  const circleColor = rgb(169 / 255, 184 / 255, 207 / 255);
  const rowDividerColor = rgb(231 / 255, 233 / 255, 237 / 255);

  layout.pages.forEach((placements) => {
    const page = doc.addPage([layout.width, layout.height]);
    const { height } = page.getSize();

    if (format === "sheet") {
      // Logo (30, 22, 120, 40)
      page.drawImage(embeddedLogo, {
        x: 30,
        y: height - 22 - 40,
        width: 120,
        height: 40,
      });

      page.drawText("Would You Rather?", {
        x: 30,
        y: height - 86,
        size: 26,
        font: playHandFont,
        color: inkColor,
      });

      if (options.qrCode) {
        const origin = options.siteUrl ?? "https://wyrplay.com";
        const pageUrl = getSheetPagePlayUrl(placements, origin);
        const embeddedQr = embeddedQrMap.get(pageUrl);
        if (embeddedQr) {
          const qrSize = PRINT_QR_CONFIG.sheet.sizePt;
          const qrX = layout.width - 30 - qrSize;
          const qrY = 16;
          page.drawImage(embeddedQr, {
            x: qrX,
            y: height - qrY - qrSize,
            width: qrSize,
            height: qrSize,
          });
          const label = "Play Online";
          const labelWidth = playBodyFont.widthOfTextAtSize(label, 8);
          page.drawText(label, {
            x: qrX + (qrSize - labelWidth) / 2,
            y: height - (qrY + qrSize + 9),
            size: 8,
            font: playBodyFont,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      }
    }

    placements.forEach((p) => {
      if (format === "cards") {
        if (marks) {
          // 裁剪框
          page.drawRectangle({
            x: p.x,
            y: height - p.y - p.height,
            width: p.width,
            height: p.height,
            borderColor: markLineColor,
            borderWidth: 0.8,
            borderDashArray: [4, 3],
          });
          page.drawText("✂", {
            x: p.x - 4,
            y: height - p.y,
            size: 10,
            font: playBodyFont,
            color: rgb(104 / 255, 84 / 255, 75 / 255),
          });
        }

        // Logo
        page.drawImage(embeddedLogo, {
          x: p.x + p.width / 2 - 40,
          y: height - (p.y + 10) - 26,
          width: 80,
          height: 26,
        });

        // "Would you rather"
        const titleText = "Would you rather";
        const titleWidth = playHandFont.widthOfTextAtSize(titleText, 19);
        page.drawText(titleText, {
          x: p.x + p.width / 2 - titleWidth / 2,
          y: height - (p.y + 57),
          size: 19,
          font: playHandFont,
          color: inkColor,
        });

        if (showNumbers) {
          page.drawText(`#${p.number}`, {
            x: p.x + 12,
            y: height - (p.y + 20),
            size: 9,
            font: playBodyBoldFont,
            color: rgb(155 / 255, 163 / 255, 175 / 255),
          });
        }

        if (options.qrCode) {
          const origin = options.siteUrl ?? "https://wyrplay.com";
          const cardUrl = getCardPlayUrl(p.question, origin);
          const embeddedQr = embeddedQrMap.get(cardUrl);
          if (embeddedQr) {
            const qrSize = PRINT_QR_CONFIG.cards.sizePt;
            const qrX = p.x + p.width - qrSize - 10;
            const qrY = p.y + 8;
            page.drawImage(embeddedQr, {
              x: qrX,
              y: height - qrY - qrSize,
              width: qrSize,
              height: qrSize,
            });
          }
        }

        // Options
        const linesA = wrapPrintText(p.question.optionA, p.width - 55, (t) =>
          playBodyFont.widthOfTextAtSize(t, 11),
        );
        const ay = p.y + 80;
        const by = ay + linesA.length * 14 + 24;

        // Draw Option A Circle & Text
        page.drawCircle({
          x: p.x + 20,
          y: height - (ay - 4),
          size: 10,
          color: colorA,
        });
        page.drawText("A", {
          x: p.x + 16,
          y: height - ay,
          size: 11,
          font: playBodyBoldFont,
          color: rgb(1, 1, 1),
        });
        linesA.forEach((line, i) => {
          page.drawText(line, {
            x: p.x + 40,
            y: height - (ay + i * 14),
            size: 11,
            font: playBodyFont,
            color: inkColor,
          });
        });

        // Draw Option B Circle & Text
        const linesB = wrapPrintText(p.question.optionB, p.width - 55, (t) =>
          playBodyFont.widthOfTextAtSize(t, 11),
        );
        page.drawCircle({
          x: p.x + 20,
          y: height - (by - 4),
          size: 10,
          color: colorB,
        });
        page.drawText("B", {
          x: p.x + 16,
          y: height - by,
          size: 11,
          font: playBodyBoldFont,
          color: rgb(1, 1, 1),
        });
        linesB.forEach((line, i) => {
          page.drawText(line, {
            x: p.x + 40,
            y: height - (by + i * 14),
            size: 11,
            font: playBodyFont,
            color: inkColor,
          });
        });
      } else {
        // Sheet format
        if (showNumbers) {
          page.drawText(String(p.number).padStart(2, "0"), {
            x: p.x,
            y: height - (p.y + 15),
            size: 11,
            font: playBodyBoldFont,
            color: inkColor,
          });
        }

        const textOffsetX = showNumbers ? 40 : 0;
        const maxTextWidth = p.width - (showNumbers ? 110 : 70);
        const qLines = wrapPrintText(p.question.question, maxTextWidth, (t) =>
          playBodyFont.widthOfTextAtSize(t, 11),
        );
        qLines.forEach((line, i) => {
          page.drawText(line, {
            x: p.x + textOffsetX,
            y: height - (p.y + 15 + i * 14),
            size: 11,
            font: playBodyFont,
            color: inkColor,
          });
        });

        if (marks) {
          ["A", "B"].forEach((optionLabel, i) => {
            const circleX = layout.width - 95 + i * 45;
            page.drawCircle({
              x: circleX,
              y: height - (p.y + 12),
              size: 6,
              borderColor: circleColor,
              borderWidth: 1,
            });
            page.drawText(optionLabel, {
              x: layout.width - 83 + i * 45,
              y: height - (p.y + 16),
              size: 11,
              font: playBodyFont,
              color: inkColor,
            });
          });
        }

        // Row bottom divider
        page.drawLine({
          start: { x: p.x, y: height - (p.y + p.height) },
          end: { x: p.x + p.width, y: height - (p.y + p.height) },
          color: rowDividerColor,
          thickness: 1,
        });
      }
    });
  });

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
}

// Canvas encoders default to 96 DPI metadata. Match PNG physical size to its export pixels.
export async function pngWithDpi(blob: Blob, dpi: number): Promise<Blob> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([112, 72, 89, 115], 4); // pHYs
  const pixelsPerMeter = Math.round(dpi / 0.0254);
  view.setUint32(8, pixelsPerMeter);
  view.setUint32(12, pixelsPerMeter);
  chunk[16] = 1;
  let crc = 0xffffffff;
  for (const byte of chunk.subarray(4, 17)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  view.setUint32(17, (crc ^ 0xffffffff) >>> 0);
  const parts: BlobPart[] = [bytes.slice(0, 33), chunk];
  for (let offset = 33; offset < bytes.length; ) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error("Malformed PNG chunk");
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    if (type !== "pHYs") parts.push(bytes.slice(offset, end));
    offset = end;
  }
  return new Blob(parts, { type: "image/png" });
}
