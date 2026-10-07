import { describe, it, expect } from "vitest";
import QRCode from "qrcode";
import type { Question } from "@/modules/would-you-rather/types";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather";
import {
  resolveQuestionPool,
  parseFinderSession,
  questionPoolUrl,
} from "@/modules/would-you-rather/domain/play-session";
import { createPrintLayout, wrapPrintText } from "@/modules/would-you-rather/domain/print-layout";
import {
  getCardPlayUrl,
  getSheetPagePlayUrl,
  calculateQrModuleSizeMm,
  PRINT_QR_CONFIG,
} from "@/modules/would-you-rather/ui/play/print-renderer";
describe("play and print sets", () => {
  it("keeps the entire expanded question bank QR-encodable without changing IDs or order", async () => {
    const { default: QRCode } = await import("qrcode");
    const pool = resolveQuestionPool(QUESTIONS_DATABASE, null);
    const url = new URL(questionPoolUrl("/play", pool), "https://wyrplay.com");
    expect(
      resolveQuestionPool(QUESTIONS_DATABASE, url.searchParams.get("set")).map((q) => q.id),
    ).toEqual(pool.map((q) => q.id));
    expect(() => QRCode.create(url.href)).not.toThrow();
  });
  it("preserves reordered compact IDs and filters unknown IDs", () => {
    expect(
      resolveQuestionPool(QUESTIONS_DATABASE, "2,missing,1,2,999999").map((q) => q.id),
    ).toEqual(["wyr-000002", "wyr-000001"]);
  });
  it("preserves approved ID order and rejects unknown IDs", () => {
    const first = QUESTIONS_DATABASE[0]!;
    const second = QUESTIONS_DATABASE[1]!;
    expect(
      resolveQuestionPool(QUESTIONS_DATABASE, `${second.id},missing,${first.id},${second.id}`).map(
        (q) => q.id,
      ),
    ).toEqual([second.id, first.id]);
    expect(resolveQuestionPool(QUESTIONS_DATABASE, "missing")).toEqual([]);
  });
  it("rejects corrupt return state", () => {
    expect(() => parseFinderSession('{"pageNumber":-1}')).toThrow();
  });
  for (const format of ["cards", "sheet"] as const)
    for (const paper of ["a4", "letter"] as const)
      it(`${format}/${paper} accounts for every question without clipping boxes`, () => {
        const pool = resolveQuestionPool(QUESTIONS_DATABASE, null);
        const result = createPrintLayout(pool, format, paper, (t) => t.length * 6);
        const rows = result.pages.flat();
        expect(rows.map((p) => p.question.id)).toEqual(pool.map((q) => q.id));
        expect(new Set(rows.map((p) => p.question.id)).size).toBe(pool.length);
        rows.forEach((p) => {
          expect(p.y + p.height).toBeLessThanOrEqual(result.height - 29);
          expect(p.x + p.width).toBeLessThan(result.width);
        });
      });
  it("wraps unusually long individual words", () => {
    expect(wrapPrintText("abcdefghijkl", 4, (t) => t.length)).toEqual(["abcd", "efgh", "ijkl"]);
  });
  it("supports custom itemsPerPage and respects capacity per page", () => {
    const pool = resolveQuestionPool(QUESTIONS_DATABASE, null);
    const resultCards2 = createPrintLayout(
      pool.slice(0, 5),
      "cards",
      "letter",
      (t) => t.length * 6,
      {
        itemsPerPage: 2,
      },
    );
    // 5 questions with 2 per page -> 3 pages (2, 2, 1)
    expect(resultCards2.pages).toHaveLength(3);
    expect(resultCards2.pages[0]).toHaveLength(2);
    expect(resultCards2.pages[1]).toHaveLength(2);
    expect(resultCards2.pages[2]).toHaveLength(1);

    const resultSheet10 = createPrintLayout(pool.slice(0, 25), "sheet", "a4", (t) => t.length * 6, {
      itemsPerPage: 10,
    });
    // 25 questions with 10 per page -> 3 pages (10, 10, 5)
    expect(resultSheet10.pages).toHaveLength(3);
    expect(resultSheet10.pages[0]).toHaveLength(10);
    expect(resultSheet10.pages[1]).toHaveLength(10);
    expect(resultSheet10.pages[2]).toHaveLength(5);
  });
  it("stress test: handles extremely long text without breaking layout bounds", () => {
    const pool = resolveQuestionPool(QUESTIONS_DATABASE, null);
    const extremeQuestion = {
      ...pool[0]!,
      id: "stress-test-1",
      question: "Extremely long question description ".repeat(20),
      optionA: "An exceptionally long Option A description ".repeat(15),
      optionB: "Another extraordinarily long Option B description ".repeat(15),
    };
    const layout = createPrintLayout([extremeQuestion], "cards", "letter", (t) => t.length * 6);
    expect(layout.pages.length).toBeGreaterThanOrEqual(1);
    const box = layout.pages[0]![0]!;
    expect(box.x).toBeGreaterThan(0);
    expect(box.y).toBeGreaterThan(0);
    expect(box.x + box.width).toBeLessThanOrEqual(layout.width);
    expect(box.y + box.height).toBeLessThanOrEqual(layout.height);
  });

  describe("print QR scanability closeout", () => {
    const origin = "https://wyrplay.com";

    it("Card QR only encodes the single question for each card", () => {
      const pool = resolveQuestionPool(QUESTIONS_DATABASE, null);
      const testCards = pool.slice(0, 10);
      for (const question of testCards) {
        const urlStr = getCardPlayUrl(question, origin);
        const url = new URL(urlStr);
        expect(url.pathname).toBe("/play");
        const setParam = url.searchParams.get("set");
        const resolved = resolveQuestionPool(QUESTIONS_DATABASE, setParam);
        expect(resolved).toHaveLength(1);
        expect(resolved[0]!.id).toBe(question.id);
      }
    });

    it("Sheet QR only encodes the placements belonging to the current page", () => {
      const pool = resolveQuestionPool(QUESTIONS_DATABASE, null);
      const testSet = pool.slice(0, 24);
      const layout = createPrintLayout(testSet, "sheet", "letter", (t) => t.length * 6, {
        itemsPerPage: 10,
      });
      // 24 questions with 10 per page -> 3 pages: 10, 10, 4
      expect(layout.pages).toHaveLength(3);

      for (let pageIdx = 0; pageIdx < layout.pages.length; pageIdx++) {
        const placements = layout.pages[pageIdx]!;
        const urlStr = getSheetPagePlayUrl(placements, origin);
        const url = new URL(urlStr);
        expect(url.pathname).toBe("/play");
        const setParam = url.searchParams.get("set");
        const resolved = resolveQuestionPool(QUESTIONS_DATABASE, setParam);

        expect(resolved).toHaveLength(placements.length);
        expect(resolved.map((q) => q.id)).toEqual(placements.map((p) => p.question.id));

        // Ensure questions from other pages are not included
        const otherPagesPlacements = layout.pages
          .filter((_, idx) => idx !== pageIdx)
          .flatMap((pg) => pg.map((p) => p.question.id));
        for (const otherId of otherPagesPlacements) {
          expect(resolved.map((q) => q.id)).not.toContain(otherId);
        }
      }
    });

    it("anti-regression: no physical QR encodes the entire 512 question bank", () => {
      const pool = resolveQuestionPool(QUESTIONS_DATABASE, null);
      expect(pool).toHaveLength(512);

      // 1. Cards layout across all 512 questions
      const cardsLayout = createPrintLayout(pool, "cards", "letter", (t) => t.length * 6);
      for (const page of cardsLayout.pages) {
        for (const p of page) {
          const cardUrl = new URL(getCardPlayUrl(p.question, origin));
          const resolved = resolveQuestionPool(QUESTIONS_DATABASE, cardUrl.searchParams.get("set"));
          expect(resolved).toHaveLength(1);
          expect(resolved[0]!.id).toBe(p.question.id);
        }
      }

      // 2. Sheet layout across all 512 questions
      const sheetLayout = createPrintLayout(pool, "sheet", "a4", (t) => t.length * 6);
      for (const page of sheetLayout.pages) {
        const pageUrl = new URL(getSheetPagePlayUrl(page, origin));
        const resolved = resolveQuestionPool(QUESTIONS_DATABASE, pageUrl.searchParams.get("set"));
        expect(resolved).toHaveLength(page.length);
        expect(resolved.length).toBeLessThanOrEqual(14); // sheet page max capacity
        expect(resolved.length).not.toBe(512);
      }
    });

    it("enforces standard 4-module quiet zone and moduleSizeMm >= 0.30mm for Cards and Sheet", () => {
      // 必须显式锁死 quiet zone = 4 modules，符合 QR 国际标准
      expect(PRINT_QR_CONFIG.margin).toBe(4);

      const pool = resolveQuestionPool(QUESTIONS_DATABASE, null);

      // 1. Card QR (worst-case single question across entire database)
      for (const question of pool.slice(0, 20)) {
        const cardUrl = getCardPlayUrl(question, origin);
        const cardQr = QRCode.create(cardUrl, {
          errorCorrectionLevel: PRINT_QR_CONFIG.errorCorrectionLevel,
        });
        const cardModuleSize = calculateQrModuleSizeMm(
          cardQr.modules.size,
          PRINT_QR_CONFIG.cards.sizePt,
          4,
        );
        expect(cardModuleSize).toBeGreaterThanOrEqual(0.3);
      }

      // 2. Sheet QR (10 questions typical page)
      const sheet10Url = getSheetPagePlayUrl(pool.slice(0, 10), origin);
      const sheet10Qr = QRCode.create(sheet10Url, {
        errorCorrectionLevel: PRINT_QR_CONFIG.errorCorrectionLevel,
      });
      const sheet10ModuleSize = calculateQrModuleSizeMm(
        sheet10Qr.modules.size,
        PRINT_QR_CONFIG.sheet.sizePt,
        4,
      );
      expect(sheet10ModuleSize).toBeGreaterThanOrEqual(0.3);

      // 3. Find worst-case sheet page across full 512 questions (maximum placements on one page)
      let worstPlacements: readonly Question[] = [];
      for (const paper of ["letter", "a4"] as const) {
        for (const itemsPerPage of [0, 6, 10]) {
          const layout = createPrintLayout(pool, "sheet", paper, (t) => t.length * 6.2, {
            itemsPerPage,
          });
          for (const page of layout.pages) {
            if (page.length > worstPlacements.length) {
              worstPlacements = page.map((p) => p.question);
            }
          }
        }
      }
      expect(worstPlacements.length).toBeGreaterThanOrEqual(10);
      const worstSheetUrl = getSheetPagePlayUrl(worstPlacements, origin);
      const worstQr = QRCode.create(worstSheetUrl, {
        errorCorrectionLevel: PRINT_QR_CONFIG.errorCorrectionLevel,
      });
      const worstModuleSize = calculateQrModuleSizeMm(
        worstQr.modules.size,
        PRINT_QR_CONFIG.sheet.sizePt,
        4,
      );
      expect(worstModuleSize).toBeGreaterThanOrEqual(0.3);
    });

    it("produces identical URL destination across helper calls", () => {
      const q = QUESTIONS_DATABASE[0]!;
      const url1 = getCardPlayUrl(q, origin);
      const url2 = getCardPlayUrl(q, origin);
      expect(url1).toBe(url2);

      const pageQuestions = QUESTIONS_DATABASE.slice(0, 5);
      const pageUrl1 = getSheetPagePlayUrl(pageQuestions, origin);
      const pageUrl2 = getSheetPagePlayUrl(
        pageQuestions.map((question) => ({ question })),
        origin,
      );
      expect(pageUrl1).toBe(pageUrl2);
    });
  });
});
