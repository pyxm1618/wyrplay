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
export function questionArtwork(question: Question): string {
  const content = [...question.topics, question.question].join(" ").toLowerCase();
  const matches: readonly [RegExp, string][] = [
    [/space|ocean|astronaut|rocket/, "10"],
    [/music|movie|instrument/, "03"],
    [/food|hungry|burger|pizza/, "09"],
    [/beach|mountain|travel|island/, "06"],
    [/summer|winter|weather/, "07"],
    [/language|world/, "04"],
    [/time|early|late/, "01"],
    [/dragon|dinosaur|animal|fantasy/, "02"],
  ];
  return `/finder/assets/question-${matches.find(([pattern]) => pattern.test(content))?.[1] ?? "08"}.png`;
}
