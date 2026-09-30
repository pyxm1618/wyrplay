import { describe, expect, it } from "vitest";

import { filterQuestions } from "@/modules/would-you-rather/domain/filter-questions";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import { TEST_FIXTURE_QUESTIONS } from "../../../tests/fixtures/test-questions";

describe("Would You Rather Question Filtering & Search", () => {
  it("returns all questions when no criteria is specified", () => {
    const result = filterQuestions(QUESTIONS_DATABASE, {});
    expect(result).toHaveLength(QUESTIONS_DATABASE.length);
  });

  it("filters accurately by search keyword across question and options", () => {
    const timeQuestions = filterQuestions(QUESTIONS_DATABASE, { searchKeyword: "time" });
    expect(timeQuestions.length).toBeGreaterThan(0);
    expect(
      timeQuestions.every(
        (q) =>
          q.question.toLowerCase().includes("time") ||
          q.optionA.toLowerCase().includes("time") ||
          q.optionB.toLowerCase().includes("time") ||
          q.topics.some((t) => t.includes("time")) ||
          (q.tags?.some((t) => t.toLowerCase().includes("time")) ?? false),
      ),
    ).toBe(true);
  });

  it("performs case-insensitive search", () => {
    const upper = filterQuestions(QUESTIONS_DATABASE, { searchKeyword: "HEAR" });
    const lower = filterQuestions(QUESTIONS_DATABASE, { searchKeyword: "hear" });
    expect(upper.length).toBe(lower.length);
    expect(upper.length).toBeGreaterThan(0);
  });

  it("computes exact intersection when multiple dimensions are combined", () => {
    const hardPartyQuestions = filterQuestions(QUESTIONS_DATABASE, {
      occasion: "party",
      difficulty: "hard",
    });

    for (const q of hardPartyQuestions) {
      expect(q.occasions).toContain("party");
      expect(q.difficulty).toBe("hard");
    }
  });

  it("returns empty array when criteria match no questions without throwing or loosening constraints", () => {
    const impossible = filterQuestions(QUESTIONS_DATABASE, {
      searchKeyword: "xyznonexistentkeyword123456789",
    });
    expect(impossible).toEqual([]);
  });

  it("P0-2: onlyApproved filters out unreviewed questions from active pools", () => {
    const mockUnreviewed = [
      {
        ...QUESTIONS_DATABASE[0]!,
        id: "mock-unreviewed-filter",
        reviewStatus: "unreviewed" as const,
      },
    ];
    const unapprovedResult = filterQuestions(mockUnreviewed, { onlyApproved: true });
    expect(unapprovedResult).toHaveLength(0);

    const formalPlayable = filterQuestions(QUESTIONS_DATABASE, { onlyApproved: true });
    expect(formalPlayable).toHaveLength(116);

    const fixturePlayable = filterQuestions(TEST_FIXTURE_QUESTIONS, { onlyApproved: true });
    expect(fixturePlayable).toHaveLength(3);
  });

  it("restricts Kids collection to child-appropriate questions without silent leakage", () => {
    const kids = filterQuestions(TEST_FIXTURE_QUESTIONS, { collection: "kids" });
    expect(kids.length).toBe(2);
    for (const q of kids) {
      expect(q.suitability.kids).toBe("suitable");
      expect(q.ageGroups.some((a) => ["4-6", "7-9", "10-12"].includes(a))).toBe(true);
    }
  });
});
