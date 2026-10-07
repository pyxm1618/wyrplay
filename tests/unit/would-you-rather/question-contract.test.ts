import { describe, expect, it } from "vitest";

import rawQuestionsJson from "../../../content/question-bank/questions.json";

import {
  getHomepageQuestions,
  getPlayableQuestions,
  getPlayableQuestionsByCollection,
  QUESTIONS_DATABASE,
  validateQuestion,
  validateQuestionDatabase,
} from "@/modules/would-you-rather";
import type { AgeGroup } from "@/modules/would-you-rather";
import { TEST_FIXTURE_QUESTIONS } from "../../../tests/fixtures/test-questions";

describe("Would You Rather Question Data Contract", () => {
  it("contains 512 approved questions after kids editorial review", () => {
    expect(QUESTIONS_DATABASE).toHaveLength(512);
    expect(QUESTIONS_DATABASE.filter((q) => q.reviewStatus === "approved")).toHaveLength(512);
    expect(QUESTIONS_DATABASE.filter((q) => q.reviewStatus === "unreviewed")).toHaveLength(0);
  });

  it("passes comprehensive schema validation for all 512 question records", () => {
    const result = validateQuestionDatabase(QUESTIONS_DATABASE);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("P0-2: requires every raw formal record to declare an explicit reviewStatus", () => {
    const allowedStatuses = ["unreviewed", "approved", "deferred", "rejected", "retired"];

    expect(rawQuestionsJson).toHaveLength(512);
    for (const q of rawQuestionsJson) {
      expect(q).toHaveProperty("reviewStatus");
      expect(allowedStatuses).toContain(q.reviewStatus);
    }
  });

  it("ensures every formal question has a standard wyr- id and required fields", () => {
    for (const q of QUESTIONS_DATABASE) {
      expect(q.id).toMatch(/^wyr-\d{6}$/);
      expect(q.question.trim().length).toBeGreaterThan(5);
      expect(q.optionA.trim().length).toBeGreaterThan(0);
      expect(q.optionB.trim().length).toBeGreaterThan(0);
    }
  });

  it("publishes the 55 reviewed kids additions into the approved kids pool", () => {
    const additions = QUESTIONS_DATABASE.filter(
      (q) => q.id >= "wyr-000458" && q.id <= "wyr-000512",
    );
    const kidsPlayable = getPlayableQuestionsByCollection("kids", QUESTIONS_DATABASE);
    const kidsPlayableIds = new Set(kidsPlayable.map((q) => q.id));

    expect(additions).toHaveLength(55);
    expect(additions[0]?.id).toBe("wyr-000458");
    expect(additions.at(-1)?.id).toBe("wyr-000512");
    expect(additions.every((q) => q.reviewStatus === "approved")).toBe(true);
    expect(additions.every((q) => q.primaryCollection === "kids")).toBe(true);
    expect(getPlayableQuestions(additions)).toHaveLength(55);
    expect(additions.every((q) => kidsPlayableIds.has(q.id))).toBe(true);
  });

  it("P0-2: guarantees unreviewed questions are blocked from playable pools", () => {
    const mockUnreviewed = [
      {
        ...QUESTIONS_DATABASE[0]!,
        id: "mock-unreviewed-1",
        reviewStatus: "unreviewed" as const,
      },
    ];
    expect(getPlayableQuestions(mockUnreviewed)).toHaveLength(0);
    expect(getPlayableQuestionsByCollection("kids", mockUnreviewed)).toHaveLength(0);
  });

  it("provides 512 approved playable dilemmas in the formal production pool", () => {
    const playable = getPlayableQuestions(QUESTIONS_DATABASE);
    expect(playable).toHaveLength(512);

    const homepagePlayable = getHomepageQuestions(50, QUESTIONS_DATABASE);
    expect(homepagePlayable).toHaveLength(50);

    const kidsPlayable = getPlayableQuestionsByCollection("kids", QUESTIONS_DATABASE);
    expect(kidsPlayable.length).toBeGreaterThan(0);
  });

  it("allows test fixture approved questions to form playable pools with correct constraints", () => {
    const fixturePlayable = getPlayableQuestions(TEST_FIXTURE_QUESTIONS);
    expect(fixturePlayable).toHaveLength(3);

    // Kids 专题必须是 kids: suitable 且有明确儿童年龄段
    const kids = getPlayableQuestionsByCollection("kids", TEST_FIXTURE_QUESTIONS);
    expect(kids.length).toBe(2);
    expect(kids.map((q) => q.id)).toEqual(["test-001", "test-003"]);

    // Couples 专题必须包含 couples
    const couples = getPlayableQuestionsByCollection("couples", TEST_FIXTURE_QUESTIONS);
    expect(couples.length).toBe(1);
    expect(couples[0]?.id).toBe("test-002");
  });

  it("rejects invalid questions with explicit errors", () => {
    const invalidAge = {
      id: "err-1",
      question: "Test question?",
      optionA: "Opt A",
      optionB: "Opt B",
      ageGroups: ["invalid-age" as unknown as AgeGroup],
      relationships: [],
      occasions: [],
      tones: [],
      topics: [],
      suitability: {
        kids: "unreviewed" as const,
        family: "unreviewed" as const,
        classroom: "unreviewed" as const,
        workplace: "unreviewed" as const,
      },
      reviewStatus: "unreviewed" as const,
    };
    const res = validateQuestion(invalidAge);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain("Invalid ageGroup 'invalid-age'");
  });
});
