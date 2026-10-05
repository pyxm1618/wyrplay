import { describe, expect, it } from "vitest";

import {
  getPlayableQuestionsByCollection,
  getQuestionsByCollection,
  QUESTIONS_DATABASE,
} from "@/modules/would-you-rather/data/questions";
import { TEST_FIXTURE_QUESTIONS } from "../../../tests/fixtures/test-questions";

describe("Would You Rather SEO collections", () => {
  it.each(["kids", "friends", "couples", "funny", "hard"] as const)(
    "populates verified playable questions for %s collection from formal database",
    (collection) => {
      const questions = getQuestionsByCollection(collection, QUESTIONS_DATABASE);
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.every((q) => q.reviewStatus === "approved")).toBe(true);
    },
  );

  it("P0-2: guarantees unreviewed dilemmas return 0 playable questions across collections", () => {
    const mockUnreviewed = [
      {
        ...QUESTIONS_DATABASE[0]!,
        id: "mock-unreviewed-col",
        reviewStatus: "unreviewed" as const,
      },
    ];
    for (const collection of ["kids", "friends", "couples", "funny", "hard"] as const) {
      const questions = getQuestionsByCollection(collection, mockUnreviewed);
      expect(questions).toHaveLength(0);
    }
  });

  it("maintains strict category purity on approved fixture dilemmas", () => {
    const kids = getPlayableQuestionsByCollection("kids", TEST_FIXTURE_QUESTIONS);
    expect(kids.every((q) => q.suitability.kids === "suitable")).toBe(true);
    expect(kids.every((q) => q.ageGroups.length > 0)).toBe(true);

    const couples = getPlayableQuestionsByCollection("couples", TEST_FIXTURE_QUESTIONS);
    expect(couples.every((q) => q.relationships.includes("couples"))).toBe(true);
  });

  it("enforces exact 5 SEO collection counts in the formal 457 question bank without overextending", () => {
    const kids = getQuestionsByCollection("kids", QUESTIONS_DATABASE);
    const funny = getQuestionsByCollection("funny", QUESTIONS_DATABASE);
    const hard = getQuestionsByCollection("hard", QUESTIONS_DATABASE);
    const friends = getQuestionsByCollection("friends", QUESTIONS_DATABASE);
    const couples = getQuestionsByCollection("couples", QUESTIONS_DATABASE);

    // 关键业务事实：
    // Kids 绝非全部安全题（安全不等于受众符合），而是严格属于儿童年龄段的 263 题
    expect(kids).toHaveLength(263);
    expect(funny).toHaveLength(140);
    expect(hard).toHaveLength(271);
    expect(friends).toHaveLength(195);
    expect(couples).toHaveLength(45);
  });

  it("business rule: kidsSafe !== Kids audience fit (adults/coworkers safe questions excluded from Kids)", () => {
    // 例如 wyr-000069 (coworkers meeting dilemma) 属于 adults，kidsSafe=true，绝不能进入 Kids
    const meetingQuestion = QUESTIONS_DATABASE.find((q) => q.id === "wyr-000069");
    expect(meetingQuestion).toBeDefined();
    expect(meetingQuestion?.safety?.kidsSafe).toBe(true);
    expect(meetingQuestion?.ageBands).toContain("adults");

    const kidsQuestions = getQuestionsByCollection("kids", QUESTIONS_DATABASE);
    expect(kidsQuestions.some((q) => q.id === "wyr-000069")).toBe(false);
  });
});
