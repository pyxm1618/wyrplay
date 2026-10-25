import type { Question } from "../types";

export type PrintFormat = "cards" | "sheet";
export type PaperSize = "letter" | "a4";

export interface PrintPlacement {
  readonly question: Question;
  readonly number: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface PrintLayout {
  readonly width: number;
  readonly height: number;
  readonly pages: readonly (readonly PrintPlacement[])[];
}

export interface PrintLayoutOptions {
  readonly itemsPerPage?: number | undefined;
  readonly showNumbers?: boolean | undefined;
}

export function getPrintSheetRowContent(question: Question) {
  return {
    question: question.question,
    optionA: `A: ${question.optionA}`,
    optionB: `B: ${question.optionB}`,
  } as const;
}

// Points (72/inch). Text wraps into these measured boxes in preview, print and PDF.
export function wrapPrintText(
  text: string,
  maxWidth: number,
  measure: (text: string) => number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (measure(word) > maxWidth) {
      if (line) {
        lines.push(line);
        line = "";
      }
      let part = "";
      for (const char of word) {
        if (part && measure(part + char) > maxWidth) {
          lines.push(part);
          part = "";
        }
        part += char;
      }
      line = part;
    } else if (line && measure(`${line} ${word}`) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

export function createPrintLayout(
  questions: readonly Question[],
  format: PrintFormat,
  paper: PaperSize,
  measure: (text: string) => number,
  options?: PrintLayoutOptions,
): PrintLayout {
  const isA4Cards = format === "cards" && paper === "a4";
  const width = isA4Cards ? 841.89 : paper === "a4" ? 595.28 : 612;
  const height = isA4Cards ? 595.28 : paper === "a4" ? 841.89 : 792;
  const pages: PrintPlacement[][] = [];
  let page: PrintPlacement[] = [];
  let y = format === "cards" ? 30 : 105;
  const maxPerPage =
    options?.itemsPerPage && options.itemsPerPage > 0
      ? isA4Cards
        ? Math.min(options.itemsPerPage, 4)
        : options.itemsPerPage
      : isA4Cards
        ? 4
        : null;

  if (isA4Cards) {
    const marginX = 30;
    const marginY = 30;
    const gapX = 20;
    const gapY = 16;
    const cardWidth = (width - marginX * 2 - gapX) / 2;
    const cardHeight = (height - marginY * 2 - gapY) / 2;

    questions.forEach((question, index) => {
      const pageIndex = page.length;
      if (pageIndex >= (maxPerPage ?? 4)) {
        pages.push(page);
        page = [];
      }
      const col = page.length % 2;
      const row = Math.floor(page.length / 2);
      const cardX = marginX + col * (cardWidth + gapX);
      const cardY = marginY + row * (cardHeight + gapY);

      page.push({
        question,
        number: index + 1,
        x: cardX,
        y: cardY,
        width: cardWidth,
        height: cardHeight,
      });
    });
    if (page.length) pages.push(page);
    return { width, height, pages };
  }

  questions.forEach((question, index) => {
    if (format === "cards") {
      const cardWidth = (width - 72) / 2;
      const cardHeight = Math.max(
        236,
        70 +
          (wrapPrintText(question.optionA, cardWidth - 55, measure).length +
            wrapPrintText(question.optionB, cardWidth - 55, measure).length) *
            14,
      );
      const previous = page[page.length - 1];
      const second = Boolean(page.length % 2);
      const rowY = second ? previous!.y : y;
      const reachedPageLimit = maxPerPage !== null && page.length >= maxPerPage;
      if (reachedPageLimit || rowY + cardHeight > height - 30) {
        if (page.length) pages.push(page);
        page = [];
        y = 30;
      }
      const col = page.length % 2;
      const last = page[page.length - 1];
      const nextY = col ? last!.y : y;
      page.push({
        question,
        number: index + 1,
        x: col ? width / 2 + 6 : 30,
        y: nextY,
        width: cardWidth,
        height: cardHeight,
      });
      if (col) y = nextY + Math.max(last!.height, cardHeight) + 12;
      else y = nextY;
    } else {
      const content = getPrintSheetRowContent(question);
      const contentWidth = width - 170;
      const optionGap = 12;
      const optionWidth = (contentWidth - optionGap) / 2;
      const questionLines = wrapPrintText(content.question, contentWidth, measure).length;
      const optionLines = Math.max(
        wrapPrintText(content.optionA, optionWidth, measure).length,
        wrapPrintText(content.optionB, optionWidth, measure).length,
      );
      const rowHeight = Math.max(60, questionLines * 14 + optionLines * 14 + 12);
      const reachedPageLimit = maxPerPage !== null && page.length >= maxPerPage;
      if (reachedPageLimit || y + rowHeight > height - 30) {
        if (page.length) pages.push(page);
        page = [];
        y = 105;
      }
      page.push({ question, number: index + 1, x: 30, y, width: width - 60, height: rowHeight });
      y += rowHeight;
    }
  });
  if (page.length) pages.push(page);
  return { width, height, pages };
}

/** Shared point geometry for Canvas, vector PDF and native browser print. */
export function getPrintVisualGeometry(p: PrintPlacement) {
  const inset = 12;
  const gap = 10;
  // Header includes the existing logo, title, number and 34pt QR with clearance.
  const header = 50;
  const lineHeight = 12;
  const fontSize = 10;
  const columnWidth = (p.width - inset * 2 - gap) / 2;
  // Caption columns retain their width when unusually long text needs more height.
  // This avoids a feedback loop where shrinking art also narrows and grows its caption.
  const measure = (value: string) =>
    [...value].reduce(
      (width, char) => width + (/\s/.test(char) ? 3 : /[MWmw]/.test(char) ? 9 : 6),
      0,
    );
  const linesA = wrapPrintText(p.question.optionA, columnWidth - 16, measure);
  const linesB = wrapPrintText(p.question.optionB, columnWidth - 16, measure);
  const captionHeight = Math.max(linesA.length, linesB.length) * lineHeight + 8;
  const size = Math.min(columnWidth, p.height - header - inset - captionHeight - 4);
  if (size <= 0) throw new Error(`Print caption exceeds card ${p.question.id}`);
  return {
    size,
    xA: p.x + inset + (columnWidth - size) / 2,
    xB: p.x + inset + columnWidth + gap + (columnWidth - size) / 2,
    captionXA: p.x + inset,
    captionXB: p.x + inset + columnWidth + gap,
    captionWidth: columnWidth,
    y: p.y + header,
    captionY: p.y + header + size + 4,
    captionHeight,
    fontSize,
    lineHeight,
    linesA,
    linesB,
  };
}
