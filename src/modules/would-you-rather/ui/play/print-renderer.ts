import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import type { PrintLayout, PrintFormat } from "../../domain/print-layout";
import { wrapPrintText } from "../../domain/print-layout";

export interface RenderPrintOptions {
  readonly showNumbers?: boolean | undefined;
  readonly qrCode?: boolean | undefined;
  readonly siteUrl?: string | undefined;
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
    fetch("/finder/fonts/lilita-one.ttf").then((r) => r.arrayBuffer()),
    fetch("/finder/fonts/roboto-400.ttf").then((r) => r.arrayBuffer()),
    fetch("/finder/fonts/roboto-700.ttf").then((r) => r.arrayBuffer()),
  ]);
  fontCache = { playHand, playBody, playBodyBold };
  return fontCache;
}

let logoCache: ArrayBuffer | null = null;
export async function loadLogoBytes(): Promise<ArrayBuffer> {
  if (logoCache) return logoCache;
  const bytes = await fetch("/finder/assets/logo.png").then((r) => r.arrayBuffer());
  logoCache = bytes;
  return bytes;
}

/**
 * 产生单页按需预览的 Canvas (300 DPI 级别高清渲染)
 */
export function renderSinglePrintPage(
  layout: PrintLayout,
  pageIndex: number,
  format: PrintFormat,
  marks: boolean,
  logo: HTMLImageElement,
  options: RenderPrintOptions = {},
  qrImage?: HTMLImageElement | null,
): HTMLCanvasElement {
  const placements = layout.pages[pageIndex] ?? [];
  const canvas = document.createElement("canvas");
  const scale = 2; // Preview scale
  canvas.width = Math.ceil(layout.width * scale);
  canvas.height = Math.ceil(layout.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser does not support printable canvas output");

  ctx.scale(scale, scale);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, layout.width, layout.height);
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

    if (options.qrCode && qrImage) {
      ctx.drawImage(qrImage, layout.width - 70, 20, 42, 42);
      ctx.font = "8px PlayBody, Arial";
      ctx.fillStyle = "#666";
      ctx.fillText("Play Online", layout.width - 70, 70);
    }
  }

  placements.forEach((p) => {
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

      if (options.qrCode && qrImage) {
        ctx.drawImage(qrImage, p.x + p.width - 36, p.y + 8, 26, 26);
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
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const [fonts, logoBytes] = await Promise.all([loadPrintFonts(), loadLogoBytes()]);
  const playHandFont = await doc.embedFont(fonts.playHand, { subset: true });
  const playBodyFont = await doc.embedFont(fonts.playBody, { subset: true });
  const playBodyBoldFont = await doc.embedFont(fonts.playBodyBold, { subset: true });
  const embeddedLogo = await doc.embedPng(logoBytes);

  let embeddedQr: Awaited<ReturnType<typeof doc.embedPng>> | null = null;
  if (options.qrCode) {
    try {
      const qrDataUrl = await QRCode.toDataURL(options.siteUrl ?? "https://wyrplay.com/play", {
        margin: 1,
        width: 120,
      });
      const qrBytes = Uint8Array.from(atob(qrDataUrl.split(",")[1]!), (c) => c.charCodeAt(0));
      embeddedQr = await doc.embedPng(qrBytes);
    } catch {
      // 容错处理
    }
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

      if (embeddedQr) {
        page.drawImage(embeddedQr, {
          x: layout.width - 70,
          y: height - 20 - 42,
          width: 42,
          height: 42,
        });
        page.drawText("Play Online", {
          x: layout.width - 70,
          y: height - 70,
          size: 8,
          font: playBodyFont,
          color: rgb(0.4, 0.4, 0.4),
        });
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

        if (embeddedQr) {
          page.drawImage(embeddedQr, {
            x: p.x + p.width - 36,
            y: height - (p.y + 8) - 26,
            width: 26,
            height: 26,
          });
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

/**
 * 旧版本低 DPI Canvas PDF 生成器 (兼容测试用途)
 */
export function pdfFromCanvases(
  canvases: readonly HTMLCanvasElement[],
  width: number,
  height: number,
): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let position = 0;
  const offsets: number[] = [0];
  const append = (value: string | Uint8Array) => {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    chunks.push(bytes);
    position += bytes.length;
  };
  append("%PDF-1.4\n");
  const object = (id: number, body: string) => {
    offsets[id] = position;
    append(`${id} 0 obj\n${body}\nendobj\n`);
  };
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(
    2,
    `<< /Type /Pages /Count ${canvases.length} /Kids [${canvases.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] >>`,
  );
  canvases.forEach((canvas, i) => {
    const id = 3 + i * 3;
    const jpeg = Uint8Array.from(atob(canvas.toDataURL("image/jpeg", 0.98).split(",")[1]!), (c) =>
      c.charCodeAt(0),
    );
    object(
      id,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im ${id + 1} 0 R >> >> /Contents ${id + 2} 0 R >>`,
    );
    offsets[id + 1] = position;
    append(
      `${id + 1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    );
    append(jpeg);
    append("\nendstream\nendobj\n");
    const content = `q ${width} 0 0 ${height} 0 0 cm /Im Do Q`;
    object(
      id + 2,
      `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`,
    );
  });
  const start = position;
  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((offset) => append(`${String(offset).padStart(10, "0")} 00000 n \n`));
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);
  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}
