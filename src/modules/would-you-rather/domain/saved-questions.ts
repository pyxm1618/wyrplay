import { z } from "zod";

const questionId = z.string().min(1).max(128);
export const savedQuestionIds = z.array(questionId).max(2000);
export const savedQuestionCommand = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), id: questionId }).strict(),
  z.object({ action: z.literal("remove"), id: questionId }).strict(),
  z.object({ action: z.literal("import"), ids: savedQuestionIds }).strict(),
]);
export type SavedQuestionCommand = z.infer<typeof savedQuestionCommand>;
export function parseStoredSavedIds(serialized: string): string[] {
  return [...new Set(savedQuestionIds.parse(JSON.parse(serialized)))];
}
