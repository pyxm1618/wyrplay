import { afterAll, beforeAll, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/platform/config/env", () => ({
  env: { appOrigin: "https://www.wyrplay.com", appEnv: "production" },
}));
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { createDatabaseClient } from "@/platform/database/client";
import { consumeVoteLimit } from "@/platform/security/vote-request";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL required for isolated vote-limit tests");
const schema = `vote_limit_${crypto.randomUUID().replaceAll("-", "")}`;
const admin = postgres(databaseUrl, { max: 1 });
const scopedUrl = new URL(databaseUrl);
scopedUrl.searchParams.set("search_path", schema);
const database = createDatabaseClient(scopedUrl.toString());
const now = 1_800_000_000_000;
const request = new Request("https://www.wyrplay.com/api/wyr/kids-vote", {
  headers: { "CF-Connecting-IP": "203.0.113.1" },
});
beforeAll(async () => {
  await admin.unsafe(`create schema "${schema}"`);
  await database.db.execute(
    sql`create table rate_limit (id text primary key, key text unique not null, count int not null, last_request bigint not null)`,
  );
});
afterAll(async () => {
  await database.close();
  await admin.unsafe(`drop schema if exists "${schema}" cascade`);
  await admin.end();
});
it("atomically limits concurrent posts, rotates windows and IP buckets without browser IDs", async () => {
  const results = await Promise.all(
    Array.from({ length: 65 }, () => consumeVoteLimit(request, database.db, now)),
  );
  expect(results.filter((result) => result?.status === 429)).toHaveLength(5);
  expect(results.filter((result) => result === null)).toHaveLength(60);
  expect(await consumeVoteLimit(request, database.db, now + 60_000)).toBeNull();
  expect(
    await consumeVoteLimit(
      new Request(request, { headers: { "CF-Connecting-IP": "203.0.113.2" } }),
      database.db,
      now,
    ),
  ).toBeNull();
  const rows = await database.db.execute<{ key: string }>(sql`select key from rate_limit`);
  expect(rows).toHaveLength(3);
  expect(rows.every((row) => /^wyr-vote:[a-f0-9]{64}$/.test(row.key))).toBe(true);
});
it("removes at most 100 confirmed expired vote counters and preserves current and other counters", async () => {
  for (let index = 0; index < 101; index++) {
    const key = `wyr-vote:expired-${index}`;
    await database.db.execute(
      sql`insert into rate_limit values (${key}, ${key}, 1, ${now - 660_000})`,
    );
  }
  await database.db.execute(
    sql`insert into rate_limit values ('auth-old', 'auth-old', 1, ${now - 660_000})`,
  );
  expect(await consumeVoteLimit(request, database.db, now + 60_000)).toBeNull();
  const rows = await database.db.execute<{ key: string }>(sql`select key from rate_limit`);
  expect(rows.filter((row) => row.key.startsWith("wyr-vote:expired-"))).toHaveLength(1);
  expect(rows.some((row) => row.key === "auth-old")).toBe(true);
  expect(rows).toHaveLength(5);
});
