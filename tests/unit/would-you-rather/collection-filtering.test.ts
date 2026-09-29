import { describe, expect, it } from "vitest";

import { getQuestionsByCollection } from "@/modules/would-you-rather/data/questions";

describe("Would You Rather SEO collections", () => {
  it.each(["kids", "friends", "couples"] as const)(
    "keeps %s audience landing questions audience-pure",
    (collection) => {
      const questions = getQuestionsByCollection(collection);

      expect(questions.length).toBeGreaterThan(0);
      expect(questions.every((question) => question.audience === collection)).toBe(true);
    },
  );
});
