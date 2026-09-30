import { describe, expect, it } from "vitest";

import {
  getPlayableQuestionsByCollection,
  getQuestionsByCollection,
  QUESTIONS_DATABASE,
} from "@/modules/would-you-rather/data/questions";
import { TEST_FIXTURE_QUESTIONS } from "../../../tests/fixtures/test-questions";

describe("Would You Rather SEO collections", () => {
  it.each(["kids", "friends", "couples", "funny", "hard"] as const)(
    "P0-2: returns 0 playable questions for %s when questions are unreviewed",
    (collection) => {
      const questions = getQuestionsByCollection(collection, QUESTIONS_DATABASE);
      // 绝不放宽条件静默塞入未审核题
      expect(questions).toHaveLength(0);
    },
  );

  it("maintains strict category purity on approved fixture dilemmas", () => {
    const kids = getPlayableQuestionsByCollection("kids", TEST_FIXTURE_QUESTIONS);
    expect(kids.every((q) => q.suitability.kids === "suitable")).toBe(true);
    expect(kids.every((q) => q.ageGroups.length > 0)).toBe(true);

    const couples = getPlayableQuestionsByCollection("couples", TEST_FIXTURE_QUESTIONS);
    expect(couples.every((q) => q.relationships.includes("couples"))).toBe(true);
  });
});
