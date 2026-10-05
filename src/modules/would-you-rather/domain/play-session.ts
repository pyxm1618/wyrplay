import { z } from "zod";
import type { Question } from "../types";
import type { FinderCriteria } from "./finder";

export const finderSessionKey = "wyrplay:finder-session:v1";
export const savedQuestionsKey = "wyrplay:saved-questions:v1";
const criteriaSchema = z.object({
  age: z.enum(["kids", "teens", "adults", "7-9", "10-12"]).optional(),
  relationship: z.enum(["friends", "family", "couples", "coworkers"]).optional(),
  occasion: z.enum(["classroom", "party", "road-trip", "dinner", "date-night"]).optional(),
  tone: z.enum(["funny", "weird", "deep"]).optional(),
  difficulty: z.enum(["easy", "hard"]).optional(),
});
export function parseFinderSession(serialized: string): {
  query: string;
  keyword: string;
  draft: FinderCriteria;
  criteria: FinderCriteria;
  pageNumber: number;
  selected: string[];
} {
  const parsed = z
    .object({
      query: z.string(),
      keyword: z.string(),
      draft: criteriaSchema,
      criteria: criteriaSchema,
      pageNumber: z.number().int().positive(),
      selected: z.array(z.string()),
    })
    .parse(JSON.parse(serialized));
  const clean = (value: z.infer<typeof criteriaSchema>): FinderCriteria => ({
    ...(value.age ? { age: value.age } : {}),
    ...(value.relationship ? { relationship: value.relationship } : {}),
    ...(value.occasion ? { occasion: value.occasion } : {}),
    ...(value.tone ? { tone: value.tone } : {}),
    ...(value.difficulty ? { difficulty: value.difficulty } : {}),
  });
  return { ...parsed, draft: clean(parsed.draft), criteria: clean(parsed.criteria) };
}
export function resolveQuestionPool(
  questions: readonly Question[],
  set: string | null,
): readonly Question[] {
  const approved = questions.filter((q) => q.reviewStatus === "approved");
  if (set === null) return approved;
  const ids = [
    ...new Set(
      set
        .split(",")
        .filter(Boolean)
        .map((id) => (/^\d{1,6}$/.test(id) ? `wyr-${id.padStart(6, "0")}` : id)),
    ),
  ];
  return ids
    .map((id) => approved.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);
}
export function questionPoolUrl(
  path: "/play" | "/print",
  questions: readonly Question[],
  present = false,
): string {
  const search = new URLSearchParams({ set: questions.map((q) => q.id).join(",") });
  // Large sets use the numeric suffix of permanent wyr IDs to fit a QR code.
  // The resolver restores each exact ID; selected order and membership stay intact.
  if (search.toString().length > 2000) {
    search.set(
      "set",
      questions
        .map((question) => {
          const match = /^wyr-(\d{6})$/.exec(question.id);
          return match ? String(Number(match[1])) : question.id;
        })
        .join(","),
    );
  }
  if (present) search.set("present", "1");
  return `${path}?${search.toString().replaceAll("%2C", ",")}`;
}
