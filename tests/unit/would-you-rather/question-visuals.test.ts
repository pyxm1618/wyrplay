import { describe, it, expect } from "vitest";
import {
  getQuestionVisual,
  hasQuestionVisual,
} from "@/modules/would-you-rather/data/question-visuals";
import { createPrintLayout } from "@/modules/would-you-rather/domain/print-layout";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";

describe("Question Visuals Registry & Layout", () => {
  it("registers exactly the 21 approved masters and preserves fallback for other questions", () => {
    const approvedIds = [
      "wyr-000001",
      "wyr-000002",
      "wyr-000003",
      "wyr-000004",
      "wyr-000005",
      "wyr-000006",
      "wyr-000007",
      "wyr-000008",
      "wyr-000009",
      "wyr-000010",
      "wyr-000018",
      "wyr-000019",
      "wyr-000020",
      "wyr-000021",
      "wyr-000022",
      "wyr-000023",
      "wyr-000024",
      "wyr-000025",
      "wyr-000026",
      "wyr-000027",
      "wyr-000037",
    ];
    const registeredIds = QUESTIONS_DATABASE.filter((question) => hasQuestionVisual(question.id))
      .map((question) => question.id)
      .sort();
    expect(registeredIds).toEqual(approvedIds);
    for (const id of approvedIds) {
      const asset = getQuestionVisual(id)!;
      expect(asset.width).toBe(1774);
      expect(asset.height).toBe(887);
      expect(asset.src).toMatch(
        new RegExp(`^https://media\\.wyrplay\\.com/questions/v1/${id}-[a-f0-9]{12}\\.png$`),
      );
      expect(asset.alt.trim().length).toBeGreaterThan(0);
    }
    expect(getQuestionVisual("unknown-id")).toBeUndefined();
    expect(hasQuestionVisual("unknown-id")).toBe(false);
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
