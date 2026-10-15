import { describe, expect, it } from "vitest";
import {
  createPrintLayout,
  getPrintVisualGeometry,
} from "@/modules/would-you-rather/domain/print-layout";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";

describe("shared illustrated print geometry", () => {
  for (const paper of ["a4", "letter"] as const) {
    it(`fits square art and complete captions inside ${paper} cards`, () => {
      const questions = QUESTIONS_DATABASE.filter(
        (q) => q.id === "wyr-000001" || q.id === "wyr-000503",
      );
      const layout = createPrintLayout(questions, "cards", paper, (t) => t.length * 6.2);
      for (const p of layout.pages.flat()) {
        const g = getPrintVisualGeometry(p);
        if (p.question.id === "wyr-000001") {
          expect(g.size).toBeGreaterThan(paper === "a4" ? 150 : 90);
        }
        expect(g.size).toBeGreaterThan(100);
        expect(g.xA).toBeGreaterThanOrEqual(p.x);
        expect(g.xB + g.size).toBeLessThanOrEqual(p.x + p.width);
        expect(g.captionY + g.captionHeight).toBeLessThanOrEqual(p.y + p.height - 10);
        expect(g.y).toBeGreaterThanOrEqual(p.y + 44);
        expect(g.linesA.join(" ")).toBe(p.question.optionA);
        expect(g.linesB.join(" ")).toBe(p.question.optionB);
      }
    });
  }
});
