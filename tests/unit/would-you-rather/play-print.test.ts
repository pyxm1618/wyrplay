import { describe, it, expect } from "vitest";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather";
import {
  resolveQuestionPool,
  parseFinderSession,
} from "@/modules/would-you-rather/domain/play-session";
import { createPrintLayout, wrapPrintText } from "@/modules/would-you-rather/domain/print-layout";
describe("play and print sets", () => {
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
});
