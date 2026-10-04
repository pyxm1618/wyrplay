import type { AgeGroup, Question, VoteStats } from "../types";
import { filterQuestions, type QuestionFilterCriteria } from "./filter-questions";

export type FinderAge = "kids" | "teens" | "adults" | "7-9" | "10-12";
export interface FinderCriteria extends Omit<QuestionFilterCriteria, "ageGroup" | "onlyApproved"> {
  readonly age?: FinderAge;
}
const ageGroups: Record<FinderAge, readonly AgeGroup[]> = {
  kids: ["4-6", "7-9", "10-12"],
  teens: ["13-17"],
  adults: ["18+"],
  "7-9": ["7-9"],
  "10-12": ["10-12"],
};
export function filterFinderQuestions(
  questions: readonly Question[],
  criteria: FinderCriteria,
): readonly Question[] {
  const { age, ...otherCriteria } = criteria;
  return filterQuestions(questions, { ...otherCriteria, onlyApproved: true }).filter(
    (q) => !age || q.ageGroups.some((group) => ageGroups[age].includes(group)),
  );
}
export function questionPage(questions: readonly Question[], requestedPage: number) {
  const totalPages = Math.ceil(questions.length / 10);
  const page = Math.min(
    Math.max(Number.isInteger(requestedPage) ? requestedPage : 1, 1),
    Math.max(totalPages, 1),
  );
  return { page, totalPages, questions: questions.slice((page - 1) * 10, page * 10) };
}
export function parseSavedQuestionIds(
  serialized: string,
  questions: readonly Question[],
): string[] {
  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string"))
    throw new Error("Saved questions must be an array of question IDs");
  const approvedIds = new Set(
    questions.filter((q) => q.reviewStatus === "approved").map((q) => q.id),
  );
  return [...new Set(parsed as string[])].filter((id) => approvedIds.has(id));
}
export function parseVoteStats(value: unknown): VoteStats {
  if (!value || typeof value !== "object") throw new Error("Invalid vote statistics response");
  const stats = value as VoteStats;
  if (
    ![stats.votesA, stats.votesB, stats.total].every((n) => Number.isSafeInteger(n) && n >= 0) ||
    stats.total !== stats.votesA + stats.votesB ||
    ![stats.percentageA, stats.percentageB].every(
      (n) => Number.isInteger(n) && n >= 0 && n <= 100,
    ) ||
    stats.percentageA + stats.percentageB !== 100 ||
    stats.percentageA !==
      (stats.total === 0 ? 50 : Math.round((stats.votesA / stats.total) * 100)) ||
    typeof stats.hasVoted !== "boolean" ||
    ![null, "A", "B"].includes(stats.selectedOption) ||
    stats.hasVoted !== (stats.selectedOption !== null)
  ) {
    throw new Error("Inconsistent vote statistics response");
  }
  return stats;
}
/** Assign against the complete approved bank so search, pagination and restore keep each ID stable.
 * Generic illustrations are preferences, not question metadata. A ten-question allocation window
 * caps each illustration at two uses and avoids consecutive repeats.
 */
export function questionArtworks(questions: readonly Question[]): ReadonlyMap<string, string> {
  const artworks = new Map<string, string>();
  let counts = Array<number>(10).fill(0);
  let previous = -1;
  questions.forEach((question, index) => {
    if (index % 10 === 0) counts = Array<number>(10).fill(0);
    let hash = 2166136261;
    for (const char of question.id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    const content = question.question.toLowerCase();
    let preference = (hash >>> 0) % 10;
    if (/\b(rocket|astronaut|space|galaxy|planet)\b/.test(content)) {
      preference = 9;
    } else if (/\b(pizza|burger|taco|cookie|cake|ice cream)\b/.test(content)) {
      preference = 8;
    } else if (
      /\b(squirrel|turtle|puppy|dog|cat|rabbit|kitten|hamster|bird|bear|lion)\b/.test(content)
    ) {
      preference = 7;
    } else if (/\b(guitar|piano|drum|concert|sing|music)\b/.test(content)) {
      preference = 2;
    } else if (/\b(dragon|dinosaur|monster)\b/.test(content)) {
      preference = 1;
    } else if (preference === 1) {
      preference = hash % 2 === 0 ? 3 : 4;
    }
    let artwork = preference;
    while (counts[artwork]! >= 2 || artwork === previous) artwork = (artwork + 1) % 10;
    counts[artwork]! += 1;
    previous = artwork;
    artworks.set(
      question.id,
      `/finder/assets/question-${String(artwork + 1).padStart(2, "0")}.png`,
    );
  });
  return artworks;
}
