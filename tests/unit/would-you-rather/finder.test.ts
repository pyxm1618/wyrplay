import { describe, expect, it } from "vitest";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import {
  filterFinderQuestions,
  questionPage,
  parseSavedQuestionIds,
  parseVoteStats,
} from "@/modules/would-you-rather/domain/finder";

describe("finder integration contracts", () => {
  it("uses the approved source bank and intersects broad Kids with other dimensions", () => {
    const bank = [
      ...QUESTIONS_DATABASE,
      { ...QUESTIONS_DATABASE[0]!, id: "unreviewed", reviewStatus: "unreviewed" as const },
    ];
    expect(filterFinderQuestions(bank, {})).toHaveLength(116);
    const children = filterFinderQuestions(bank, { age: "kids", difficulty: "hard" });
    expect(children.length).toBeGreaterThan(0);
    expect(
      children.every(
        (q) =>
          q.reviewStatus === "approved" &&
          q.difficulty === "hard" &&
          q.ageGroups.some((a) => ["4-6", "7-9", "10-12"].includes(a)),
      ),
    ).toBe(true);
    expect(filterFinderQuestions(bank, { searchKeyword: "no-match-xyz" })).toEqual([]);
  });
  it("paginates all 116 identities exactly once and clamps stale pages after filtering", () => {
    const all = Array.from(
      { length: 12 },
      (_, i) => questionPage(QUESTIONS_DATABASE, i + 1).questions,
    ).flat();
    expect(all.map((q) => q.id)).toEqual(QUESTIONS_DATABASE.map((q) => q.id));
    expect(questionPage(QUESTIONS_DATABASE.slice(0, 2), 12)).toMatchObject({
      page: 1,
      totalPages: 1,
    });
    expect(questionPage([], 12)).toMatchObject({ page: 1, totalPages: 0, questions: [] });
  });
  it("validates local bookmarks, removes duplicates and ignores retired or unknown IDs", () => {
    const id = QUESTIONS_DATABASE[0]!.id;
    expect(parseSavedQuestionIds(JSON.stringify([id, id, "missing"]), QUESTIONS_DATABASE)).toEqual([
      id,
    ]);
    expect(() => parseSavedQuestionIds("{bad", QUESTIONS_DATABASE)).toThrow();
    expect(() => parseSavedQuestionIds("[12]", QUESTIONS_DATABASE)).toThrow();
  });
  it("rejects inconsistent or fabricated vote responses at the browser boundary", () => {
    const stats = {
      votesA: 2,
      votesB: 1,
      total: 3,
      percentageA: 67,
      percentageB: 33,
      hasVoted: false,
      selectedOption: null,
    };
    expect(parseVoteStats(stats)).toEqual(stats);
    expect(() => parseVoteStats({ ...stats, total: 4 })).toThrow();
    expect(() => parseVoteStats({ ...stats, votesA: -2 })).toThrow();
    expect(() => parseVoteStats({ ...stats, hasVoted: true })).toThrow();
    expect(() => parseVoteStats({ ...stats, percentageA: 80 })).toThrow();
  });
});
