import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import { getLeaderboardSnapshot } from "@/modules/would-you-rather/server/leaderboard-service";
import { recordVote } from "@/modules/would-you-rather/server/voting-service";
import { createDatabaseClient } from "@/platform/database/client";
const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl)
  throw new Error("TEST_DATABASE_URL is required for isolated leaderboard integration tests");
const schema = `leaderboard_test_${crypto.randomUUID().replaceAll("-", "")}`;
const admin = postgres(databaseUrl, { max: 1 });
const scopedUrl = new URL(databaseUrl);
scopedUrl.searchParams.set("search_path", schema);
const database = createDatabaseClient(scopedUrl.toString());
const table = sql.raw(`"${schema}"."wyr_votes"`);
const q1 = QUESTIONS_DATABASE[0]!;
const q2 = QUESTIONS_DATABASE[1]!;
const q3 = QUESTIONS_DATABASE[2]!;
const questions = [q1, q2, q3, { ...QUESTIONS_DATABASE[3]!, reviewStatus: "unreviewed" as const }];
const now = new Date("2026-10-01T12:00:00Z");
beforeAll(async () => {
  await admin.unsafe(`create schema "${schema}"`);
  await database.db.execute(
    sql`create table ${table} (id text primary key, question_id text not null, anonymous_voter_id text not null, selected_option text not null check(selected_option in ('A','B')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(question_id,anonymous_voter_id))`,
  );
  const fixtures = [
    [q1.id, "v1", "2026-09-20T12:00:00Z"],
    [q1.id, "v2", "2026-09-28T00:00:00Z"],
    [q1.id, "v3", "2026-10-01T00:00:00Z"],
    [q2.id, "v1", "2026-10-01T11:00:00Z"],
    [questions[3]!.id, "excluded", "2026-10-01T11:00:00Z"],
    [q2.id, "future", "2026-10-01T13:00:00Z"],
  ];
  for (const [question, voter, created] of fixtures)
    await database.db.execute(
      sql`insert into ${table} values (${crypto.randomUUID()},${question},${voter},'A',${created}::timestamptz,${now.toISOString()}::timestamptz)`,
    );
});
afterAll(async () => {
  await database.close();
  // Only the random schema created by this test is removed; public/drizzle are preserved.
  await admin.unsafe(`drop schema if exists "${schema}" cascade`);
  await admin.end();
});
describe("one-query leaderboard against PostgreSQL", () => {
  it("excludes unapproved/future votes, reconciles totals and counts distinct anonymous voters", async () => {
    const snapshot = await getLeaderboardSnapshot({ db: database.db, questions, now });
    expect(snapshot.entries).toHaveLength(3);
    expect(snapshot.totalVotes).toBe(4);
    expect(snapshot.anonymousVoters).toBe(3);
    expect(snapshot.entries[0]).toMatchObject({ total: 3, month: 1, week: 2 });
    expect(snapshot.entries[1]).toMatchObject({ total: 1, month: 1, week: 1 });
    expect(snapshot.entries[2]).toMatchObject({ total: 0, month: 0, week: 0 });
  });
  it("changing an older vote preserves the first-vote period and total", async () => {
    await recordVote(
      { questionId: q1.id, anonymousVoterId: "v1", option: "B" },
      { db: database.db, questions },
    );
    const snapshot = await getLeaderboardSnapshot({ db: database.db, questions, now });
    expect(snapshot.totalVotes).toBe(4);
    expect(snapshot.entries[0]).toMatchObject({ total: 3, month: 1, week: 2 });
  });
  it("a successful aggregate with no matching votes is a confirmed zero, not an outage", async () => {
    const snapshot = await getLeaderboardSnapshot({ db: database.db, questions: [q3], now });
    expect(snapshot.totalVotes).toBe(0);
    expect(snapshot.anonymousVoters).toBe(0);
    expect(snapshot.entries.every((entry) => entry.total === 0)).toBe(true);
  });
});
