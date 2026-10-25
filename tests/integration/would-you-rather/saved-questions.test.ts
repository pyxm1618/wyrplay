import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabaseClient } from "@/platform/database/client";
import { user, accountSubjects, savedQuestions } from "@/platform/database/schema";
import {
  changeSavedQuestions,
  listSavedQuestions,
} from "@/modules/would-you-rather/server/saved-question-service";

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL is required");
const database = createDatabaseClient(url);
const firstId = randomUUID();
const secondId = randomUUID();
let first: { userId: string; subjectId: string };
let second: typeof first;
beforeAll(async () => {
  await migrate(database.db, { migrationsFolder: "drizzle" });
  for (const id of [firstId, secondId])
    await database.db.insert(user).values({ id, name: "Saved Test", email: `${id}@example.test` });
  const rows = await database.db
    .insert(accountSubjects)
    .values([{ authUserId: firstId }, { authUserId: secondId }])
    .returning();
  first = { userId: firstId, subjectId: rows.find((r) => r.authUserId === firstId)!.id };
  second = { userId: secondId, subjectId: rows.find((r) => r.authUserId === secondId)!.id };
});
afterAll(async () => {
  await database.db.delete(user).where(eq(user.id, firstId));
  await database.db.delete(user).where(eq(user.id, secondId));
  await database.close();
});
it("merges concurrent imports idempotently and isolates each account", async () => {
  await Promise.all(
    Array.from({ length: 6 }, () =>
      changeSavedQuestions(database.db, first, {
        action: "import",
        ids: ["wyr-000001", "wyr-000002", "wyr-000001"],
      }),
    ),
  );
  expect(await listSavedQuestions(database.db, firstId)).toHaveLength(2);
  expect(await listSavedQuestions(database.db, secondId)).toEqual([]);
  await changeSavedQuestions(database.db, second, { action: "save", id: "wyr-000001" });
  await changeSavedQuestions(database.db, first, { action: "remove", id: "wyr-000001" });
  expect(await listSavedQuestions(database.db, firstId)).toEqual(["wyr-000002"]);
  expect(await listSavedQuestions(database.db, secondId)).toEqual(["wyr-000001"]);
});
it("atomically rejects unavailable imports and total capacity overflow", async () => {
  await expect(
    changeSavedQuestions(database.db, first, {
      action: "import",
      ids: ["wyr-000003", "missing-id"],
    }),
  ).rejects.toThrow("question_unavailable");
  expect(await listSavedQuestions(database.db, firstId)).toEqual(["wyr-000002"]);
  const ids = Array.from({ length: 500 }, (_, i) => `wyr-${String(i + 1).padStart(6, "0")}`);
  await changeSavedQuestions(database.db, first, { action: "import", ids });
  await expect(
    changeSavedQuestions(database.db, first, {
      action: "import",
      ids: ["wyr-000501", "wyr-000502"],
    }),
  ).rejects.toThrow("saved_question_limit_exceeded");
  expect(await listSavedQuestions(database.db, firstId)).toHaveLength(500);
});
it("blocks writes once account deletion begins and cascades favorites with identity deletion", async () => {
  await database.db
    .update(accountSubjects)
    .set({ status: "deletion_pending" })
    .where(eq(accountSubjects.id, first.subjectId));
  await expect(
    changeSavedQuestions(database.db, first, { action: "save", id: "wyr-000002" }),
  ).rejects.toThrow("not active");
  await database.db.delete(user).where(eq(user.id, firstId));
  expect(
    await database.db.select().from(savedQuestions).where(eq(savedQuestions.userId, firstId)),
  ).toEqual([]);
  expect(await listSavedQuestions(database.db, secondId)).toEqual(["wyr-000001"]);
});
