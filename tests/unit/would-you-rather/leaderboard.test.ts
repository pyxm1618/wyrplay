import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import {
  leaderboardPage,
  leaderboardPeriodStarts,
  rankLeaderboard,
  searchLeaderboard,
} from "@/modules/would-you-rather/domain/leaderboard";
import { getLeaderboardSnapshot } from "@/modules/would-you-rather/server/leaderboard-service";
const approved = QUESTIONS_DATABASE.slice(0, 13);
const entries = approved.map((question, index) => ({
  question,
  total: 20 - index,
  month: index,
  week: index % 3,
}));

describe("real leaderboard boundaries", () => {
  it("uses calendar UTC month and Monday week across year boundaries", () => {
    const starts = leaderboardPeriodStarts(new Date("2027-01-03T23:59:59Z"));
    expect(starts.month.toISOString()).toBe("2027-01-01T00:00:00.000Z");
    expect(starts.week.toISOString()).toBe("2026-12-28T00:00:00.000Z");
    expect(() => leaderboardPeriodStarts(new Date("invalid"))).toThrow();
  });
  it("never ranks unreviewed or zero-vote entries and ties break by stable ID", () => {
    const a = entries[0]!;
    const b = entries[1]!;
    const ranked = rankLeaderboard(
      [
        { ...b, total: 2 },
        { ...a, total: 2 },
        { ...entries[2]!, total: 0 },
        {
          ...entries[3]!,
          question: { ...entries[3]!.question, reviewStatus: "unreviewed" },
          total: 999,
        },
      ],
      "all",
    );
    expect(ranked.map((row) => row.question.id)).toEqual([a.question.id, b.question.id]);
    expect(ranked.map((row) => row.rank)).toEqual([1, 2]);
  });
  it("period sorting uses period counts rather than lifetime popularity", () => {
    expect(rankLeaderboard(entries, "month")[0]?.question.id).toBe(entries[12]?.question.id);
    expect(rankLeaderboard(entries, "week").every((entry) => entry.votes > 0)).toBe(true);
  });
  it("first-page podium and list partition the top ten without duplication", () => {
    const ranked = rankLeaderboard(entries, "all");
    const first = leaderboardPage(ranked, 1);
    const last = leaderboardPage(ranked, 2);
    expect(first.pages).toBe(2);
    expect(first.entries.map((q) => q.rank)).toEqual([4, 5, 6, 7, 8, 9, 10]);
    expect(last.entries.map((q) => q.rank)).toEqual([11, 12, 13]);
    expect(leaderboardPage(ranked, 99).current).toBe(2);
    expect(leaderboardPage([], 1)).toEqual({ current: 1, pages: 0, entries: [] });
    expect(() => leaderboardPage(ranked, 0)).toThrow();
  });
  it("searches official title/options/topics while keeping the original rank", () => {
    const ranked = rankLeaderboard(entries, "all");
    const matches = searchLeaderboard(ranked, " SQUIRREL ");
    expect(matches[0]?.question.id).toBe(approved[0]?.id);
    expect(matches[0]?.rank).toBe(1);
    expect(searchLeaderboard(ranked, "no-such-topic-xyz")).toHaveLength(0);
  });
  it("propagates database failure instead of returning invented zero totals", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("database unavailable"));
    await expect(
      getLeaderboardSnapshot({ db: { execute } as never, questions: approved }),
    ).rejects.toThrow("database unavailable");
  });
  it("rejects incomplete or inconsistent aggregate responses", async () => {
    const execute = vi.fn().mockResolvedValue([]);
    await expect(
      getLeaderboardSnapshot({ db: { execute } as never, questions: approved }),
    ).rejects.toThrow("summary");
    execute.mockResolvedValue([
      { is_summary: 1, question_id: null, total: 1, voters: 1, month: 0, week: 0 },
    ]);
    await expect(
      getLeaderboardSnapshot({ db: { execute } as never, questions: approved }),
    ).rejects.toThrow("reconcile");
    execute.mockResolvedValue([
      { is_summary: 1, question_id: null, total: null, voters: 0, month: 0, week: 0 },
    ]);
    await expect(
      getLeaderboardSnapshot({ db: { execute } as never, questions: approved }),
    ).rejects.toThrow("aggregate");
  });
});
