import type {
  AgeGroup,
  Difficulty,
  Occasion,
  Question,
  Relationship,
  ReviewStatus,
  SuitabilityRating,
  Tone,
  Topic,
} from "../types";

export const VALID_AGE_GROUPS: readonly AgeGroup[] = ["4-6", "7-9", "10-12", "13-17", "18+"];
export const VALID_RELATIONSHIPS: readonly Relationship[] = [
  "friends",
  "family",
  "couples",
  "coworkers",
];
export const VALID_OCCASIONS: readonly Occasion[] = [
  "classroom",
  "party",
  "road-trip",
  "dinner",
  "date-night",
];
export const VALID_TONES: readonly Tone[] = ["funny", "weird", "deep"];
export const VALID_DIFFICULTIES: readonly Difficulty[] = ["easy", "hard"];
export const VALID_TOPICS: readonly Topic[] = [
  "animals-nature",
  "food-everyday",
  "fantasy-superpowers",
  "school-learning",
  "travel-adventure",
  "hobbies-entertainment",
  "relationships-values",
  "work-money",
];
export const VALID_SUITABILITY_RATINGS: readonly SuitabilityRating[] = [
  "suitable",
  "unsuitable",
  "unreviewed",
];
export const VALID_REVIEW_STATUSES: readonly ReviewStatus[] = [
  "unreviewed",
  "approved",
  "deferred",
  "rejected",
  "retired",
];

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateQuestion(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: ["Question must be an object"] };
  }

  const q = raw as Partial<Question>;

  if (typeof q.id !== "string" || q.id.trim() === "") {
    errors.push("Missing or invalid 'id'");
  }

  if (typeof q.question !== "string" || q.question.trim() === "") {
    errors.push(`[${q.id ?? "unknown"}]: Missing or invalid 'question'`);
  }

  if (typeof q.optionA !== "string" || q.optionA.trim() === "") {
    errors.push(`[${q.id ?? "unknown"}]: Missing or invalid 'optionA'`);
  }

  if (typeof q.optionB !== "string" || q.optionB.trim() === "") {
    errors.push(`[${q.id ?? "unknown"}]: Missing or invalid 'optionB'`);
  }

  if (!Array.isArray(q.ageGroups)) {
    errors.push(`[${q.id ?? "unknown"}]: 'ageGroups' must be an array`);
  } else {
    for (const age of q.ageGroups) {
      if (!VALID_AGE_GROUPS.includes(age)) {
        errors.push(`[${q.id ?? "unknown"}]: Invalid ageGroup '${age}'`);
      }
    }
  }

  if (!Array.isArray(q.relationships)) {
    errors.push(`[${q.id ?? "unknown"}]: 'relationships' must be an array`);
  } else {
    for (const rel of q.relationships) {
      if (!VALID_RELATIONSHIPS.includes(rel)) {
        errors.push(`[${q.id ?? "unknown"}]: Invalid relationship '${rel}'`);
      }
    }
  }

  if (!Array.isArray(q.occasions)) {
    errors.push(`[${q.id ?? "unknown"}]: 'occasions' must be an array`);
  } else {
    for (const occ of q.occasions) {
      if (!VALID_OCCASIONS.includes(occ)) {
        errors.push(`[${q.id ?? "unknown"}]: Invalid occasion '${occ}'`);
      }
    }
  }

  if (!Array.isArray(q.tones)) {
    errors.push(`[${q.id ?? "unknown"}]: 'tones' must be an array`);
  } else {
    for (const tone of q.tones) {
      if (!VALID_TONES.includes(tone)) {
        errors.push(`[${q.id ?? "unknown"}]: Invalid tone '${tone}'`);
      }
    }
  }

  if (q.difficulty !== undefined && !VALID_DIFFICULTIES.includes(q.difficulty)) {
    errors.push(`[${q.id ?? "unknown"}]: Invalid difficulty '${q.difficulty}'`);
  }

  if (!Array.isArray(q.topics)) {
    errors.push(`[${q.id ?? "unknown"}]: 'topics' must be an array`);
  } else {
    for (const topic of q.topics) {
      if (typeof topic !== "string" || topic.trim() === "") {
        errors.push(`[${q.id ?? "unknown"}]: Invalid topic '${topic}'`);
      }
    }
  }

  if (!q.suitability || typeof q.suitability !== "object") {
    errors.push(`[${q.id ?? "unknown"}]: Missing 'suitability' configuration`);
  } else {
    const s = q.suitability;
    for (const key of ["kids", "family", "classroom", "workplace"] as const) {
      if (!VALID_SUITABILITY_RATINGS.includes(s[key])) {
        errors.push(`[${q.id ?? "unknown"}]: Invalid suitability.${key} '${s[key]}'`);
      }
    }
  }

  if (typeof q.reviewStatus !== "string" || !VALID_REVIEW_STATUSES.includes(q.reviewStatus)) {
    errors.push(`[${q.id ?? "unknown"}]: Invalid reviewStatus '${q.reviewStatus}'`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateQuestionDatabase(questions: readonly unknown[]): ValidationResult {
  const allErrors: string[] = [];
  const seenIds = new Set<string>();

  for (const raw of questions) {
    const res = validateQuestion(raw);
    if (!res.valid) {
      allErrors.push(...res.errors);
    }
    const q = raw as Partial<Question>;
    if (q?.id) {
      if (seenIds.has(q.id)) {
        allErrors.push(`Duplicate question ID '${q.id}'`);
      }
      seenIds.add(q.id);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}
