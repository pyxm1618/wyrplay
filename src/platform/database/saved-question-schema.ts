import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const savedQuestions = pgTable(
  "saved_questions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.questionId] })],
);
