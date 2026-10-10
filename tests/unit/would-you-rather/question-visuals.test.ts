import { describe, it, expect } from "vitest";
import {
  getQuestionVisual,
  hasQuestionVisual,
} from "@/modules/would-you-rather/data/question-visuals";
import { createPrintLayout } from "@/modules/would-you-rather/domain/print-layout";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";

describe("Question Visuals Registry & Layout", () => {
  it("keeps registry empty until master artworks are explicitly approved by user", () => {
    // 验证当前没有任何未经审核的假图片被挂载
    const testIds = ["wyr-000001", "wyr-000002", "wyr-000003", "wyr-000004", "unknown-id"];
    testIds.forEach((id) => {
      expect(hasQuestionVisual(id)).toBe(false);
      expect(getQuestionVisual(id)).toBeUndefined();
    });
  });

  it("calculates A4 Landscape 2x2 layout for Cut-out Cards", () => {
    const questions = QUESTIONS_DATABASE.slice(0, 8);
    const layout = createPrintLayout(questions, "cards", "a4", (t) => t.length * 6);

    // 页面宽度与高度为 A4 Landscape
    expect(layout.width).toBeCloseTo(841.89, 1);
    expect(layout.height).toBeCloseTo(595.28, 1);

    // 8 题应该刚好分成 2 页（每页 4 题）
    expect(layout.pages.length).toBe(2);
    expect(layout.pages[0]?.length).toBe(4);
    expect(layout.pages[1]?.length).toBe(4);

    const firstPage = layout.pages[0]!;
    // 验证 2x2 几何排布
    const card0 = firstPage[0]!; // 左上 (col 0, row 0)
    const card1 = firstPage[1]!; // 右上 (col 1, row 0)
    const card2 = firstPage[2]!; // 左下 (col 0, row 1)
    const card3 = firstPage[3]!; // 右下 (col 1, row 1)

    expect(card0.x).toBe(30);
    expect(card0.y).toBe(30);
    expect(card1.x).toBeGreaterThan(card0.x + card0.width);
    expect(card1.y).toBe(card0.y);

    expect(card2.x).toBe(card0.x);
    expect(card2.y).toBeGreaterThan(card0.y + card0.height);
    expect(card3.x).toBe(card1.x);
    expect(card3.y).toBe(card2.y);

    // 所有卡片尺寸一致
    expect(card0.width).toBe(card1.width);
    expect(card0.height).toBe(card1.height);
  });

  it("keeps Letter Cards and Sheet formats unchanged", () => {
    const questions = QUESTIONS_DATABASE.slice(0, 6);
    // Letter cards 保持 Portrait 612 x 792
    const letterLayout = createPrintLayout(questions, "cards", "letter", (t) => t.length * 6);
    expect(letterLayout.width).toBe(612);
    expect(letterLayout.height).toBe(792);

    // A4 Sheet 保持 Portrait 595.28 x 841.89 单栏清单
    const sheetLayout = createPrintLayout(questions, "sheet", "a4", (t) => t.length * 6);
    expect(sheetLayout.width).toBeCloseTo(595.28, 1);
    expect(sheetLayout.height).toBeCloseTo(841.89, 1);
    sheetLayout.pages[0]?.forEach((row) => {
      expect(row.x).toBe(30);
      expect(row.width).toBeCloseTo(595.28 - 60, 1);
    });
  });

  it("preserves every A4 card inside the page when a stale six-card setting is supplied", () => {
    const questions = QUESTIONS_DATABASE.slice(0, 9);
    const layout = createPrintLayout(questions, "cards", "a4", (t) => t.length * 6, {
      itemsPerPage: 6,
    });

    expect(layout.pages.map((page) => page.length)).toEqual([4, 4, 1]);
    expect(layout.pages.flat().map((card) => card.question.id)).toEqual(
      questions.map((question) => question.id),
    );
    for (const card of layout.pages.flat()) {
      expect(card.x + card.width).toBeLessThanOrEqual(layout.width);
      expect(card.y + card.height).toBeLessThanOrEqual(layout.height);
    }
  });

  it("retains the requested smaller A4 card page capacity", () => {
    const layout = createPrintLayout(
      QUESTIONS_DATABASE.slice(0, 5),
      "cards",
      "a4",
      (t) => t.length * 6,
      {
        itemsPerPage: 2,
      },
    );
    expect(layout.pages.map((page) => page.length)).toEqual([2, 2, 1]);
  });
});
