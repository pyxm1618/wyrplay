import { describe, expect, it } from "vitest";

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
  it("contains exactly 104 valid questions in the database", () => {
    expect(QUESTIONS_DATABASE).toHaveLength(104);
  });

  it("passes comprehensive schema validation for all 104 questions", () => {
    const result = validateQuestionDatabase(QUESTIONS_DATABASE);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("ensures every question ID is unique and non-empty", () => {
    const ids = new Set<string>();
    for (const q of QUESTIONS_DATABASE) {
      expect(q.id).toBeDefined();
      expect(typeof q.id).toBe("string");
      expect(q.id.trim().length).toBeGreaterThan(0);
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
    }
  });

  it("ensures required fields are populated for every question", () => {
    for (const q of QUESTIONS_DATABASE) {
      expect(q.question.trim().length).toBeGreaterThan(5);
      expect(q.optionA.trim().length).toBeGreaterThan(0);
      expect(q.optionB.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(q.topics)).toBe(true);
    }
  });

  it("P0-1: guarantees zero unauthorized inferences across all 104 unreviewed questions", () => {
    for (const q of QUESTIONS_DATABASE) {
      // 绝无推断标签：语义字段全为空数组
      expect(q.ageGroups).toEqual([]);
      expect(q.relationships).toEqual([]);
      expect(q.occasions).toEqual([]);
      expect(q.tones).toEqual([]);
      expect(q.topics).toEqual([]);
      expect(q.difficulty).toBeUndefined();

      // 适用性全部诚实保持 unreviewed
      expect(q.suitability.kids).toBe("unreviewed");
      expect(q.suitability.family).toBe("unreviewed");
      expect(q.suitability.classroom).toBe("unreviewed");
      expect(q.suitability.workplace).toBe("unreviewed");

      // 审核状态必须为 unreviewed，绝不伪造 approved
      expect(q.reviewStatus).toBe("unreviewed");
    }
  });

  it("P0-2: prevents unreviewed questions from entering active playable pools", () => {
    // 生产题库中当前 104 道题全为 unreviewed，可玩池必须严格为 0
    const playable = getPlayableQuestions(QUESTIONS_DATABASE);
    expect(playable).toHaveLength(0);

    const homepagePlayable = getHomepageQuestions(50, QUESTIONS_DATABASE);
    expect(homepagePlayable).toHaveLength(0);

    const kidsPlayable = getPlayableQuestionsByCollection("kids", QUESTIONS_DATABASE);
    expect(kidsPlayable).toHaveLength(0);
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
