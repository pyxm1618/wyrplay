import { check, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const wyrVotes = pgTable(
  "wyr_votes",
  {
    id: text("id").primaryKey(),
    questionId: text("question_id").notNull(),
    anonymousVoterId: text("anonymous_voter_id").notNull(),
    selectedOption: text("selected_option").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("wyr_votes_question_voter_idx").on(table.questionId, table.anonymousVoterId),
    check("wyr_votes_selected_option_check", sql`${table.selectedOption} in ('A', 'B')`),
  ],
);

export type WyrVote = typeof wyrVotes.$inferSelect;
export type NewWyrVote = typeof wyrVotes.$inferInsert;
