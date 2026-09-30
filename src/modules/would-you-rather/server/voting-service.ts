import "server-only";

import { and, eq, sql } from "drizzle-orm";
import type { db as defaultDb } from "@/platform/database/application-database";
import { wyrVotes } from "@/platform/database/wyr-schema";

import { QUESTIONS_DATABASE } from "../data/questions";
import { TEST_FIXTURE_QUESTIONS } from "../testing/test-fixtures";
import type { Question, VoteStats } from "../types";

export interface RecordVoteParams {
  readonly questionId: string;
  readonly option: "A" | "B";
  readonly anonymousVoterId: string;
}

export type ApplicationDb = typeof defaultDb;

export interface VotingServiceOptions {
  readonly db?: ApplicationDb;
  readonly questions?: readonly Question[];
}

async function resolveDb(overrideDb?: ApplicationDb): Promise<ApplicationDb> {
  if (overrideDb) return overrideDb;
  const { db } = await import("@/platform/database/application-database");
  return db;
}

export function isValidQuestion(
  questionId: string,
  questions: readonly Question[] = QUESTIONS_DATABASE,
): boolean {
  if (questions.some((q) => q.id === questionId)) return true;
  if (process.env.APP_ENV === "test") {
    return TEST_FIXTURE_QUESTIONS.some((q) => q.id === questionId);
  }
  return false;
}

export function isVotableQuestion(
  questionId: string,
  questions: readonly Question[] = QUESTIONS_DATABASE,
): boolean {
  let found = questions.find((q) => q.id === questionId);
  if (!found && process.env.APP_ENV === "test") {
    found = TEST_FIXTURE_QUESTIONS.find((q) => q.id === questionId);
  }
  return found !== undefined && found.reviewStatus === "approved";
}

export async function getQuestionVoteStats(
  questionId: string,
  anonymousVoterId?: string,
  options?: VotingServiceOptions,
): Promise<VoteStats> {
  const db = await resolveDb(options?.db);
  const questions = options?.questions ?? QUESTIONS_DATABASE;

  if (!isValidQuestion(questionId, questions)) {
    throw new Error(`Invalid question ID '${questionId}'`);
  }

  // 1. 查询真实 A/B 票数
  const counts = await db
    .select({
      option: wyrVotes.selectedOption,
      count: sql<number>`count(*)::int`,
    })
    .from(wyrVotes)
    .where(eq(wyrVotes.questionId, questionId))
    .groupBy(wyrVotes.selectedOption);

  let votesA = 0;
  let votesB = 0;
  for (const row of counts) {
    if (row.option === "A") votesA = Number(row.count);
    if (row.option === "B") votesB = Number(row.count);
  }

  const total = votesA + votesB;
  const percentageA = total === 0 ? 50 : Math.round((votesA / total) * 100);
  const percentageB = total === 0 ? 50 : 100 - percentageA;

  // 2. 查询当前匿名身份的投票选择
  let selectedOption: "A" | "B" | null = null;
  if (anonymousVoterId && anonymousVoterId.trim() !== "") {
    const userVote = await db
      .select({ option: wyrVotes.selectedOption })
      .from(wyrVotes)
      .where(
        and(eq(wyrVotes.questionId, questionId), eq(wyrVotes.anonymousVoterId, anonymousVoterId)),
      )
      .limit(1);

    if (userVote[0]?.option === "A" || userVote[0]?.option === "B") {
      selectedOption = userVote[0].option;
    }
  }

  return {
    hasVoted: selectedOption !== null,
    selectedOption,
    votesA,
    votesB,
    total,
    percentageA,
    percentageB,
  };
}

export async function recordVote(
  params: RecordVoteParams,
  options?: VotingServiceOptions,
): Promise<VoteStats> {
  const db = await resolveDb(options?.db);
  const { questionId, option, anonymousVoterId } = params;

  if (option !== "A" && option !== "B") {
    throw new Error(`Invalid option '${option}', must be 'A' or 'B'`);
  }

  if (!anonymousVoterId || anonymousVoterId.trim() === "") {
    throw new Error("Anonymous voter ID is required");
  }

  const questions = options?.questions ?? QUESTIONS_DATABASE;

  if (!isValidQuestion(questionId, questions)) {
    throw new Error(`Invalid question ID '${questionId}'`);
  }

  if (!isVotableQuestion(questionId, questions)) {
    throw new Error(`Question '${questionId}' is not approved for voting`);
  }

  const now = new Date();

  // 保证原子性 Upsert: 首次插入、改选更新、重投幂等保持
  await db
    .insert(wyrVotes)
    .values({
      id: crypto.randomUUID(),
      questionId,
      anonymousVoterId,
      selectedOption: option,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [wyrVotes.questionId, wyrVotes.anonymousVoterId],
      set: {
        selectedOption: option,
        updatedAt: now,
      },
    });

  return getQuestionVoteStats(questionId, anonymousVoterId, options);
}
