import type { Question } from "../types";

export type LeaderboardPeriod = "all" | "month" | "week";
export type LeaderboardEntry = {
  readonly question: Question;
  readonly total: number;
  readonly month: number;
  readonly week: number;
};
export type RankedQuestion = LeaderboardEntry & { readonly rank: number; readonly votes: number };
export type LeaderboardSnapshot = {
  readonly entries: readonly LeaderboardEntry[];
  readonly totalVotes: number;
  readonly anonymousVoters: number;
  readonly generatedAt: string;
};
export type LeaderboardResult =
  | { readonly status: "ready"; readonly snapshot: LeaderboardSnapshot }
  | { readonly status: "unavailable" };

/** Calendar month and Monday-start calendar week, consistently in UTC. */
export function leaderboardPeriodStarts(now: Date) {
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid leaderboard reference date");
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const week = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  week.setUTCDate(week.getUTCDate() - ((now.getUTCDay() + 6) % 7));
  return { month, week };
}

export function rankLeaderboard(
  entries: readonly LeaderboardEntry[],
  period: LeaderboardPeriod,
): RankedQuestion[] {
  if (!["all", "month", "week"].includes(period)) throw new Error("Invalid leaderboard period");
  return entries
    .filter((entry) => entry.question.reviewStatus === "approved")
    .map((entry) => ({ ...entry, votes: period === "all" ? entry.total : entry[period] }))
    .filter((entry) => entry.votes > 0)
    .sort((a, b) => b.votes - a.votes || a.question.id.localeCompare(b.question.id, "en"))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function leaderboardPage(entries: readonly RankedQuestion[], page: number) {
  if (!Number.isSafeInteger(page) || page < 1) throw new Error("Invalid leaderboard page");
  const pages = Math.ceil(entries.length / 10);
  const current = Math.min(page, Math.max(pages, 1));
  const start = (current - 1) * 10;
  // The first page's first three entries are already presented on the podium.
  return { current, pages, entries: entries.slice(start + (current === 1 ? 3 : 0), start + 10) };
}

export function searchLeaderboard(entries: readonly RankedQuestion[], query: string) {
  const keyword = query.trim().toLocaleLowerCase("en");
  return entries.filter(({ question }) =>
    [question.question, question.optionA, question.optionB, ...question.topics, ...question.tones]
      .join(" ")
      .toLocaleLowerCase("en")
      .includes(keyword),
  );
}
