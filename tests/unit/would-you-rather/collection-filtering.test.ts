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
});
