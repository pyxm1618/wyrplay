import rawQuestionsJson from "../../../../content/question-bank/questions.json";
import type {
  AgeGroup,
  Difficulty,
  FeaturedCollectionKey,
  Occasion,
  Question,
  Relationship,
  ReviewStatus,
  Tone,
  Topic,
} from "../types";

export {
  FEATURED_COLLECTIONS,
  AUDIENCE_CATEGORIES,
  OCCASION_CATEGORIES,
  STYLE_CATEGORIES,
} from "./collections";

interface RawQuestionSchema {
  readonly id: string;
  readonly question: string;
  readonly optionA: string;
  readonly optionB: string;
  readonly reviewStatus?: string;
  readonly primaryCollection?: string;
  readonly primaryAgeBand?: string;
  readonly ageBands?: readonly string[];
  readonly relationships?: readonly string[];
  readonly scenarios?: readonly string[];
  readonly moods?: readonly string[];
  readonly difficulty?: string;
  readonly topics?: readonly string[];
  readonly safety?: {
    readonly kidsSafe?: boolean;
    readonly classroomSafe?: boolean;
    readonly familySafe?: boolean;
  };
  readonly provenance?: {
    readonly batch?: string;
    readonly candidateId?: string;
  };
}

/**
 * 确定性数据适配器：
 * 将 content/question-bank/questions.json 中的正式题目映射为强类型的 Question 运行时实体。
 * 不改题干、不改选项、保留永久稳定 ID；审核状态必须由 raw 数据显式提供。
 */
function adaptRawQuestion(raw: RawQuestionSchema): Question {
  if (!raw.id || !raw.id.startsWith("wyr-")) {
    throw new Error(`Invalid formal question ID: ${raw.id}`);
  }
  if (!raw.question || !raw.optionA || !raw.optionB) {
    throw new Error(`Incomplete formal question data for ID: ${raw.id}`);
  }

  const allowedReviewStatuses: readonly ReviewStatus[] = [
    "unreviewed",
    "approved",
    "deferred",
    "rejected",
    "retired",
  ];
  if (!raw.reviewStatus || !allowedReviewStatuses.includes(raw.reviewStatus as ReviewStatus)) {
    throw new Error(`Invalid or missing reviewStatus for formal question ID: ${raw.id}`);
  }
  const reviewStatus = raw.reviewStatus as ReviewStatus;

  const ageGroups: AgeGroup[] = [];
  for (const band of raw.ageBands ?? []) {
    if (band === "4-6" || band === "7-9" || band === "10-12") {
      ageGroups.push(band);
    } else if (band === "teens") {
      ageGroups.push("13-17");
    } else if (band === "adults") {
      ageGroups.push("18+");
    }
  }

  const tones: Tone[] = [];
  for (const mood of raw.moods ?? []) {
    if (mood === "funny" || mood === "weird") {
      tones.push(mood);
    } else if (mood === "thoughtful" || mood === "deep") {
      tones.push("deep");
    }
  }

  const occasions: Occasion[] = [];
  for (const s of raw.scenarios ?? []) {
    if (
      s === "classroom" ||
      s === "party" ||
      s === "road-trip" ||
      s === "dinner" ||
      s === "date-night" ||
      s === "sleepover" ||
      s === "icebreakers" ||
      s === "birthday-party"
    ) {
      occasions.push(s);
    }
  }

  const relationships: Relationship[] = [];
  for (const r of raw.relationships ?? []) {
    if (r === "friends" || r === "family" || r === "couples" || r === "coworkers") {
      relationships.push(r);
    }
  }

  const difficulty: Difficulty | undefined =
    raw.difficulty === "easy" || raw.difficulty === "hard" ? raw.difficulty : undefined;

  const topics: Topic[] = raw.topics ? [...(raw.topics as Topic[])] : [];

  return {
    id: raw.id,
    question: raw.question,
    optionA: raw.optionA,
    optionB: raw.optionB,
    ageGroups,
    relationships,
    occasions,
    tones: [...new Set(tones)],
    difficulty,
    topics,
    suitability: {
      kids: raw.safety?.kidsSafe ? "suitable" : "unsuitable",
      family: raw.safety?.familySafe ? "suitable" : "unsuitable",
      classroom: raw.safety?.classroomSafe ? "suitable" : "unsuitable",
      workplace: "unreviewed",
    },
    reviewStatus,
    reviewNotes: raw.provenance
      ? `${raw.provenance.batch} / ${raw.provenance.candidateId}`
      : undefined,
    primaryCollection: raw.primaryCollection,
    primaryAgeBand: raw.primaryAgeBand,
    ageBands: raw.ageBands ?? [],
    scenarios: raw.scenarios ?? [],
    moods: raw.moods ?? [],
    safety: raw.safety,
    tags: [...(raw.topics ?? []), ...(raw.moods ?? []), ...(raw.scenarios ?? [])],
    audience: relationships[0] ?? raw.primaryCollection ?? "",
    occasion: occasions[0] ?? raw.scenarios?.[0] ?? "",
    style: tones[0] ?? raw.moods?.[0] ?? "",
  };
}

/**
 * 正式题库唯一真源加载器：
 * 直接消费 content/question-bank/questions.json，不硬编码第二份题库。
 */
// Allow consumers of UI-only public exports to omit the unused canonical loader.
// Validation still runs whenever a question-bank export is consumed.
const LOADED_QUESTIONS: readonly Question[] = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ (rawQuestionsJson as unknown as readonly RawQuestionSchema[]).map(adaptRawQuestion),
);

/**
 * 查询接口函数
 */
export function getAllQuestions(): readonly Question[] {
  return LOADED_QUESTIONS;
}

export function getQuestionById(id: string): Question | undefined {
  return LOADED_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsByPrimaryCollection(collection: string): readonly Question[] {
  return LOADED_QUESTIONS.filter((q) => q.primaryCollection === collection);
}

export function getQuestionsByAgeBand(ageBand: string): readonly Question[] {
  return LOADED_QUESTIONS.filter((q) => q.ageBands?.includes(ageBand));
}

export function getQuestionsByRelationship(relationship: Relationship): readonly Question[] {
  return LOADED_QUESTIONS.filter((q) => q.relationships.includes(relationship));
}

export function getQuestionsByScenario(scenario: string): readonly Question[] {
  return LOADED_QUESTIONS.filter((q) => q.scenarios?.includes(scenario));
}

export function getQuestionsByMood(mood: string): readonly Question[] {
  return LOADED_QUESTIONS.filter((q) => q.moods?.includes(mood));
}

export function getQuestionsByDifficulty(difficulty: Difficulty): readonly Question[] {
  return LOADED_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

/**
 * 获取正式审核通过的可玩题目集合
 */
export function getPlayableQuestions(
  questions: readonly Question[] = LOADED_QUESTIONS,
): readonly Question[] {
  return questions.filter((q) => q.reviewStatus === "approved");
}

/**
 * 获取指定专题的正式审核通过题目
 */
export function getPlayableQuestionsByCollection(
  collectionKey: FeaturedCollectionKey,
  questions: readonly Question[] = LOADED_QUESTIONS,
): readonly Question[] {
  return questions.filter((q) => {
    if (q.reviewStatus !== "approved") return false;
    switch (collectionKey) {
      case "kids": {
        // 核心规则：kidsSafe !== Kids audience fit
        // 准入条件：必须明确属于儿童年龄段 (4-6 / 7-9 / 10-12) 或正式主分类 primaryCollection === "kids"
        // 排除门槛：safety.kidsSafe 绝对不能为 false
        const hasChildAge =
          (q.ageBands ?? []).some((a) => ["4-6", "7-9", "10-12"].includes(a)) ||
          q.ageGroups.some((a) => ["4-6", "7-9", "10-12"].includes(a)) ||
          q.primaryCollection === "kids";
        const isSafe = q.safety ? q.safety.kidsSafe !== false : q.suitability.kids !== "unsuitable";
        return hasChildAge && isSafe;
      }
      case "funny":
        return q.tones.includes("funny") || (q.moods?.includes("funny") ?? false);
      case "hard":
        return q.difficulty === "hard";
      case "friends":
        return q.relationships.includes("friends") || q.primaryCollection === "friends";
      case "couples":
        return q.relationships.includes("couples") || q.primaryCollection === "couples";
      default:
        return false;
    }
  });
}

/**
 * 专题题集入口 (默认返回经过严格审核的可玩题目)
 */
export function getQuestionsByCollection(
  collectionKey: FeaturedCollectionKey,
  questions: readonly Question[] = LOADED_QUESTIONS,
): readonly Question[] {
  return getPlayableQuestionsByCollection(collectionKey, questions);
}

/**
 * 首页可玩题目精选
 */
export function getHomepageQuestions(
  count = 50,
  questions: readonly Question[] = LOADED_QUESTIONS,
): readonly Question[] {
  return getPlayableQuestions(questions).slice(0, count);
}

/**
 * QUESTIONS_DATABASE 导出供调用方兼容
 */
export const QUESTIONS_DATABASE: readonly Question[] = LOADED_QUESTIONS;
