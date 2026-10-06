import { describe, expect, it } from "vitest";

import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import { filterPrintQuestions } from "@/modules/would-you-rather/domain/print-question-pool";

describe("direct print question pool", () => {
  it("uses only approved formal questions and reuses existing collection semantics", () => {
    const funny = filterPrintQuestions(QUESTIONS_DATABASE, { collection: "funny" });
    expect(funny.length).toBeGreaterThan(0);
    expect(funny.every((question) => question.reviewStatus === "approved")).toBe(true);
    expect(
      funny.every(
        (question) =>
          question.tones.includes("funny") || (question.moods?.includes("funny") ?? false),
      ),
    ).toBe(true);
  });

  it("intersects theme, audience and scenario without loosening filters", () => {
    const result = filterPrintQuestions(QUESTIONS_DATABASE, {
      collection: "funny",
      age: "kids",
      occasion: "party",
    });

    for (const question of result) {
      expect(question.reviewStatus).toBe("approved");
      expect(question.ageGroups.some((age) => ["4-6", "7-9", "10-12"].includes(age))).toBe(true);
      expect(question.occasions).toContain("party");
      expect(
        question.tones.includes("funny") || (question.moods?.includes("funny") ?? false),
      ).toBe(true);
    }
  });

  it("keeps the unfiltered direct print pool equal to the approved formal bank", () => {
    const result = filterPrintQuestions(QUESTIONS_DATABASE, {});
    expect(result).toHaveLength(457);
    expect(new Set(result.map((question) => question.id)).size).toBe(457);
  });
});
