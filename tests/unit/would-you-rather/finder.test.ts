import { describe, expect, it } from "vitest";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import {
  filterFinderQuestions,
  questionPage,
  questionArtworks,
  parseSavedQuestionIds,
  parseVoteStats,
} from "@/modules/would-you-rather/domain/finder";

describe("finder integration contracts", () => {
  it("uses the approved source bank and intersects broad Kids with other dimensions", () => {
    const bank = [
      ...QUESTIONS_DATABASE,
      { ...QUESTIONS_DATABASE[0]!, id: "unreviewed", reviewStatus: "unreviewed" as const },
    ];
    expect(filterFinderQuestions(bank, {})).toHaveLength(512);
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
  it("paginates all 512 identities exactly once and clamps stale pages after filtering", () => {
    const totalPages = Math.ceil(QUESTIONS_DATABASE.length / 10);
    const all = Array.from(
      { length: totalPages },
      (_, i) => questionPage(QUESTIONS_DATABASE, i + 1).questions,
    ).flat();
    expect(all.map((q) => q.id)).toEqual(QUESTIONS_DATABASE.map((q) => q.id));
    expect(questionPage(QUESTIONS_DATABASE.slice(0, 2), totalPages)).toMatchObject({
      page: 1,
      totalPages: 1,
    });
    expect(questionPage([], totalPages)).toMatchObject({ page: 1, totalPages: 0, questions: [] });
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

describe("Finder artwork distribution", () => {
  it("keeps IDs stable across refresh and filtering and bounds every source-bank page", () => {
    const bank = filterFinderQuestions(QUESTIONS_DATABASE, {});
    const mapping = questionArtworks(bank);
    expect([...questionArtworks(bank)]).toEqual([...mapping]);
    for (let offset = 0; offset < bank.length; offset += 10) {
      const counts = new Map<string, number>();
      for (const question of bank.slice(offset, offset + 10)) {
        const artwork = mapping.get(question.id)!;
        expect(artwork).toMatch(/question-\d{2}\.png$/);
        counts.set(artwork, (counts.get(artwork) ?? 0) + 1);
      }
      expect(Math.max(...counts.values())).toBeLessThanOrEqual(2);
    }
    const filtered = filterFinderQuestions(bank, { age: "kids", tone: "funny" });
    expect(filtered.every((q) => mapping.has(q.id))).toBe(true);
  });
});

it("avoids extreme repeats across all 2160 supported filter combinations", () => {
  const bank = filterFinderQuestions(QUESTIONS_DATABASE, {});
  const mapping = questionArtworks(bank);
  for (const age of [undefined, "kids", "teens", "adults", "7-9", "10-12"] as const)
    for (const tone of [undefined, "funny", "weird", "deep"] as const)
      for (const relationship of [undefined, "friends", "couples", "family", "coworkers"] as const)
        for (const occasion of [
          undefined,
          "classroom",
          "party",
          "road-trip",
          "date-night",
          "dinner",
        ] as const)
          for (const difficulty of [undefined, "easy", "hard"] as const) {
            const filtered = filterFinderQuestions(bank, {
              ...(age ? { age } : {}),
              ...(tone ? { tone } : {}),
              ...(relationship ? { relationship } : {}),
              ...(occasion ? { occasion } : {}),
              ...(difficulty ? { difficulty } : {}),
            });
            for (let offset = 0; offset < filtered.length; offset += 10) {
              const sources = filtered.slice(offset, offset + 10).map((q) => mapping.get(q.id));
              const maxRepeat = Math.max(
                ...sources.map((src) => sources.filter((value) => value === src).length),
              );
              expect(maxRepeat).toBeLessThan(6);
            }
          }
});
