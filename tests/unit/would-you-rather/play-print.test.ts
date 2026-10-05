import { describe, it, expect } from "vitest";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather";
import {
  resolveQuestionPool,
  parseFinderSession,
  questionPoolUrl,
} from "@/modules/would-you-rather/domain/play-session";
import { createPrintLayout, wrapPrintText } from "@/modules/would-you-rather/domain/print-layout";
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
});
