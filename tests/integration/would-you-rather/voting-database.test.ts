import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.APP_ENV ??= "test";
  process.env.APP_ORIGIN ??= "http://localhost:3000";
  process.env.DATABASE_URL ??=
    process.env.TEST_DATABASE_URL ?? "postgres://localhost:5432/creat_web_test";
  process.env.TEST_DATABASE_URL ??= process.env.DATABASE_URL;
});

vi.mock("server-only", () => ({}));
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { createDatabaseClient } from "@/platform/database/client";
import { wyrVotes } from "@/platform/database/schema";
import { getQuestionVoteStats, recordVote } from "@/modules/would-you-rather/server/voting-service";
import { TEST_FIXTURE_QUESTIONS } from "../../../tests/fixtures/test-questions";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required");

const database = createDatabaseClient(databaseUrl);

beforeAll(async () => {
  await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS public CASCADE"));
  await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE"));
  await database.db.execute(sql.raw("CREATE SCHEMA public"));
  await migrate(database.db, {
    migrationsFolder: "drizzle",
    migrationsSchema: "drizzle",
    migrationsTable: "__drizzle_migrations",
  });
});

afterAll(async () => {
  await database.close();
});

describe("WYR Real Anonymous Voting Database Integration", () => {
  const testQuestionId = "test-001";
  const votingOptions = { db: database.db, questions: TEST_FIXTURE_QUESTIONS };
  const voter1 = `voter-${crypto.randomUUID()}`;
  const voter2 = `voter-${crypto.randomUUID()}`;

  it("handles Voter 1 first vote for Option A (A=1, B=0, Total=1)", async () => {
    const stats = await recordVote(
      {
        questionId: testQuestionId,
        option: "A",
        anonymousVoterId: voter1,
      },
      votingOptions,
    );

    expect(stats.hasVoted).toBe(true);
    expect(stats.selectedOption).toBe("A");
    expect(stats.votesA).toBe(1);
    expect(stats.votesB).toBe(0);
    expect(stats.total).toBe(1);
    expect(stats.percentageA).toBe(100);
    expect(stats.percentageB).toBe(0);

    // 验证数据库真实物理行
    const rows = await database.db
      .select()
      .from(wyrVotes)
      .where(eq(wyrVotes.questionId, testQuestionId));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.anonymousVoterId).toBe(voter1);
    expect(rows[0]?.selectedOption).toBe("A");
  });

  it("handles Voter 2 first vote for Option B (A=1, B=1, Total=2)", async () => {
    const stats = await recordVote(
      {
        questionId: testQuestionId,
        option: "B",
        anonymousVoterId: voter2,
      },
      votingOptions,
    );

    expect(stats.hasVoted).toBe(true);
    expect(stats.selectedOption).toBe("B");
    expect(stats.votesA).toBe(1);
    expect(stats.votesB).toBe(1);
    expect(stats.total).toBe(2);
    expect(stats.percentageA).toBe(50);
    expect(stats.percentageB).toBe(50);

    // 验证两个独立身份在数据库中各有一条记录
    const rows = await database.db
      .select()
      .from(wyrVotes)
      .where(eq(wyrVotes.questionId, testQuestionId));
    expect(rows).toHaveLength(2);
  });

  it("handles Voter 1 changing choice from A to B (A=0, B=2, Total=2)", async () => {
    const stats = await recordVote(
      {
        questionId: testQuestionId,
        option: "B",
        anonymousVoterId: voter1,
      },
      votingOptions,
    );

    expect(stats.hasVoted).toBe(true);
    expect(stats.selectedOption).toBe("B");
    expect(stats.votesA).toBe(0);
    expect(stats.votesB).toBe(2);
    expect(stats.total).toBe(2);
    expect(stats.percentageA).toBe(0);
    expect(stats.percentageB).toBe(100);

    // 验证数据库总行数仍然为 2，没有增加新行，voter1 记录被更新
    const rows = await database.db
      .select()
      .from(wyrVotes)
      .where(eq(wyrVotes.questionId, testQuestionId));
    expect(rows).toHaveLength(2);

    const voter1Row = rows.find((r) => r.anonymousVoterId === voter1);
    expect(voter1Row?.selectedOption).toBe("B");
  });

  it("is idempotent when Voter 1 re-submits the identical choice B (A=0, B=2, Total=2)", async () => {
    const stats = await recordVote(
      {
        questionId: testQuestionId,
        option: "B",
        anonymousVoterId: voter1,
      },
      votingOptions,
    );

    expect(stats.votesA).toBe(0);
    expect(stats.votesB).toBe(2);
    expect(stats.total).toBe(2);

    const rows = await database.db
      .select()
      .from(wyrVotes)
      .where(eq(wyrVotes.questionId, testQuestionId));
    expect(rows).toHaveLength(2);
  });

  it("handles Voter 1 switching back from B to A (A=1, B=1, Total=2)", async () => {
    const stats = await recordVote(
      {
        questionId: testQuestionId,
        option: "A",
        anonymousVoterId: voter1,
      },
      votingOptions,
    );

    expect(stats.selectedOption).toBe("A");
    expect(stats.votesA).toBe(1);
    expect(stats.votesB).toBe(1);
    expect(stats.total).toBe(2);
  });

  it("handles concurrent submissions safely without duplicates", async () => {
    const concurrentVoters = Array.from({ length: 5 }, () => `concurrent-${crypto.randomUUID()}`);

    await Promise.all(
      concurrentVoters.map((vId, idx) =>
        recordVote(
          {
            questionId: testQuestionId,
            option: idx % 2 === 0 ? "A" : "B",
            anonymousVoterId: vId,
          },
          votingOptions,
        ),
      ),
    );

    const rows = await database.db
      .select()
      .from(wyrVotes)
      .where(eq(wyrVotes.questionId, testQuestionId));
    expect(rows).toHaveLength(2 + 5);
  });

  it("reads isolated vote stats for an unvoted user", async () => {
    const freshVoter = `fresh-${crypto.randomUUID()}`;
    const stats = await getQuestionVoteStats(testQuestionId, freshVoter, votingOptions);

    expect(stats.hasVoted).toBe(false);
    expect(stats.selectedOption).toBeNull();
    expect(stats.total).toBe(7);
  });

  it("rejects invalid options and prevents invalid database writes", async () => {
    await expect(
      recordVote(
        {
          questionId: testQuestionId,
          option: "C" as unknown as "A",
          anonymousVoterId: voter1,
        },
        votingOptions,
      ),
    ).rejects.toThrow("Invalid option");
  });

  it("rejects non-existent questions", async () => {
    await expect(
      recordVote(
        {
          questionId: "wyr-non-existent-9999",
          option: "A",
          anonymousVoterId: voter1,
        },
        votingOptions,
      ),
    ).rejects.toThrow("Invalid question ID");
  });

  it("strictly rejects voting on unreviewed questions (P0-2 rule)", async () => {
    // 针对显式标记为未审校的题目必须拒绝投票
    const mockUnreviewed = [
      {
        ...TEST_FIXTURE_QUESTIONS[0]!,
        id: "mock-unreviewed-vote-test",
        reviewStatus: "unreviewed" as const,
      },
    ];
    await expect(
      recordVote(
        {
          questionId: "mock-unreviewed-vote-test",
          option: "A",
          anonymousVoterId: voter1,
        },
        { db: database.db, questions: mockUnreviewed },
      ),
    ).rejects.toThrow(/not approved for voting/i);
  });

  it("successfully votes and tracks formal question IDs (e.g. wyr-000001) against default questions", async () => {
    const formalVoter = `voter-formal-${crypto.randomUUID()}`;
    const stats = await recordVote(
      {
        questionId: "wyr-000001",
        option: "B",
        anonymousVoterId: formalVoter,
      },
      { db: database.db },
    );
    expect(stats.hasVoted).toBe(true);
    expect(stats.selectedOption).toBe("B");
    expect(stats.votesB).toBeGreaterThanOrEqual(1);

    const queried = await getQuestionVoteStats("wyr-000001", formalVoter, { db: database.db });
    expect(queried.hasVoted).toBe(true);
    expect(queried.selectedOption).toBe("B");
  });
});
