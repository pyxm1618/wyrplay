import { and, asc, eq } from "drizzle-orm";
import {
  lockAccountSubject,
  requireActiveAccountSubject,
} from "@/platform/accounts/account-subject-commerce-fence";
import type { DatabaseClient, DatabaseTransaction } from "@/platform/database/client";
import { savedQuestions } from "@/platform/database/schema";
import { QUESTIONS_DATABASE } from "../data/questions";
import { savedQuestionCommand, type SavedQuestionCommand } from "../domain/saved-questions";

export const MAX_SAVED_QUESTIONS = 500;
export class SavedQuestionValidationError extends Error {}

export async function listSavedQuestions(
  database: DatabaseClient | DatabaseTransaction,
  userId: string,
) {
  const rows = await database
    .select({ id: savedQuestions.questionId })
    .from(savedQuestions)
    .where(eq(savedQuestions.userId, userId))
    .orderBy(asc(savedQuestions.savedAt), asc(savedQuestions.questionId));
  return rows.map((row) => row.id);
}
export async function changeSavedQuestions(
  database: DatabaseClient,
  account: { userId: string; subjectId: string },
  command: SavedQuestionCommand,
) {
  const validated = savedQuestionCommand.parse(command);
  return database.transaction(async (transaction) => {
    const subject = await lockAccountSubject(transaction, account.subjectId);
    requireActiveAccountSubject(subject);
    if (subject.authUserId !== account.userId) throw new Error("saved question account mismatch");
    if (validated.action === "remove") {
      await transaction
        .delete(savedQuestions)
        .where(
          and(
            eq(savedQuestions.userId, account.userId),
            eq(savedQuestions.questionId, validated.id),
          ),
        );
    } else {
      const ids = validated.action === "save" ? [validated.id] : [...new Set(validated.ids)];
      if (
        ids.some(
          (id) => !QUESTIONS_DATABASE.some((q) => q.id === id && q.reviewStatus === "approved"),
        )
      ) {
        throw new SavedQuestionValidationError("question_unavailable");
      }
      const existing = await listSavedQuestions(transaction, account.userId);
      if (new Set([...existing, ...ids]).size > MAX_SAVED_QUESTIONS) {
        throw new SavedQuestionValidationError("saved_question_limit_exceeded");
      }
      if (ids.length)
        await transaction
          .insert(savedQuestions)
          .values(ids.map((questionId) => ({ userId: account.userId, questionId })))
          .onConflictDoNothing();
    }
    return listSavedQuestions(transaction, account.userId);
  });
}
