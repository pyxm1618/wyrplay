import "server-only";

import { inArray, sql } from "drizzle-orm";
import type { db as applicationDb } from "@/platform/database/application-database";
import { wyrVotes } from "@/platform/database/wyr-schema";
import { QUESTIONS_DATABASE } from "../data/questions";
import { leaderboardPeriodStarts, type LeaderboardSnapshot } from "../domain/leaderboard";
import type { Question } from "../types";

type AggregateRow = {
  question_id: string | null;
  is_summary: number;
  total: number;
  month: number;
  week: number;
  voters: number;
};

function readCount(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid leaderboard aggregate: ${field}`);
  }
  return value;
}

/** One read-only aggregate. No migrations, vote writes, per-question requests or user IDs returned. */
export async function getLeaderboardSnapshot(
  options: {
    db?: Pick<typeof applicationDb, "execute">;
    questions?: readonly Question[];
    now?: Date;
  } = {},
): Promise<LeaderboardSnapshot> {
  const now = options.now ?? new Date();
  const starts = leaderboardPeriodStarts(now);
  const approved = (options.questions ?? QUESTIONS_DATABASE).filter(
    (q) => q.reviewStatus === "approved",
  );
  const ids = approved.map((q) => q.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("Duplicate approved leaderboard question ID");
  if (approved.length === 0)
    return { entries: [], totalVotes: 0, anonymousVoters: 0, generatedAt: now.toISOString() };
  const db = options.db ?? (await import("@/platform/database/application-database")).db;
  const rows = await db.execute<AggregateRow>(sql`
    select ${wyrVotes.questionId} as question_id,
      grouping(${wyrVotes.questionId})::int as is_summary,
      count(*)::int as total,
      (count(*) filter (where ${wyrVotes.createdAt} >= ${starts.month.toISOString()}::timestamptz))::int as month,
      (count(*) filter (where ${wyrVotes.createdAt} >= ${starts.week.toISOString()}::timestamptz))::int as week,
      count(distinct ${wyrVotes.anonymousVoterId})::int as voters
    from ${wyrVotes}
    where ${inArray(wyrVotes.questionId, ids)}
      and ${wyrVotes.createdAt} <= ${now.toISOString()}::timestamptz
    group by grouping sets ((${wyrVotes.questionId}), ())
  `);
  const summaryRows = rows.filter((row) => row.is_summary === 1);
  if (summaryRows.length !== 1) throw new Error("Missing or duplicate leaderboard summary");
  const summary = summaryRows[0]!;
  const totalVotes = readCount(summary.total, "total");
  const anonymousVoters = readCount(summary.voters, "voters");
  if (anonymousVoters > totalVotes) throw new Error("Leaderboard voters exceed votes");
  const counts = new Map<string, { total: number; month: number; week: number }>();
  for (const row of rows) {
    if (row.is_summary === 1) continue;
    if (
      row.is_summary !== 0 ||
      !row.question_id ||
      !ids.includes(row.question_id) ||
      counts.has(row.question_id)
    ) {
      throw new Error("Invalid or duplicate leaderboard question aggregate");
    }
    const count = {
      total: readCount(row.total, "question total"),
      month: readCount(row.month, "question month"),
      week: readCount(row.week, "question week"),
    };
    if (count.month > count.total || count.week > count.total)
      throw new Error("Leaderboard period votes exceed total");
    counts.set(row.question_id, count);
  }
  if ([...counts.values()].reduce((sum, row) => sum + row.total, 0) !== totalVotes)
    throw new Error("Leaderboard vote totals do not reconcile");
  return {
    // A missing group means a confirmed zero only after the aggregate succeeds.
    entries: approved.map((question) => ({
      question,
      ...(counts.get(question.id) ?? { total: 0, month: 0, week: 0 }),
    })),
    totalVotes,
    anonymousVoters,
    generatedAt: now.toISOString(),
  };
}
