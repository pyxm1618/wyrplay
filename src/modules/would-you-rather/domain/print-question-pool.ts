import type { FeaturedCollectionKey, Occasion, Question } from "../types";
import { filterQuestions } from "./filter-questions";
import { filterFinderQuestions, type FinderAge } from "./finder";

export interface PrintQuestionCriteria {
  readonly collection?: FeaturedCollectionKey;
  readonly age?: FinderAge;
  readonly occasion?: Occasion;
}

export function filterPrintQuestions(
  questions: readonly Question[],
  criteria: PrintQuestionCriteria,
): readonly Question[] {
  const finderPool = filterFinderQuestions(questions, {
    ...(criteria.age ? { age: criteria.age } : {}),
    ...(criteria.occasion ? { occasion: criteria.occasion } : {}),
  });

  if (!criteria.collection) return finderPool;

  return filterQuestions(finderPool, {
    collection: criteria.collection,
    onlyApproved: true,
  });
}
