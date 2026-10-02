import type {
  AgeGroup,
  Difficulty,
  FeaturedCollectionKey,
  Occasion,
  Question,
  Relationship,
  Tone,
  Topic,
} from "../types";

export interface QuestionFilterCriteria {
  readonly searchKeyword?: string;
  readonly ageGroup?: AgeGroup;
  readonly relationship?: Relationship;
  readonly occasion?: Occasion;
  readonly tone?: Tone;
  readonly difficulty?: Difficulty;
  readonly topic?: Topic;
  readonly collection?: FeaturedCollectionKey;
  readonly onlyApproved?: boolean;
}

/**
 * 核心可玩性规则：只有 reviewStatus === "approved" 的题目才能进入可玩集合与投票
 */
export function isPlayableQuestion(q: Question): boolean {
  return q.reviewStatus === "approved";
}

/**
 * Privacy boundary for the Kids collection.
 *
 * Questions that can appear in the child-directed Kids experience use
 * aggregate-only voting: the service must not need a persistent voter identity
 * to retain an A/B choice for these questions.
 */
export function isKidsCollectionQuestion(q: Question): boolean {
  const hasChildAge =
    (q.ageBands ?? []).some((age) => ["4-6", "7-9", "10-12"].includes(age)) ||
    q.ageGroups.some((age) => ["4-6", "7-9", "10-12"].includes(age)) ||
    q.primaryCollection === "kids";
  const isSafe = q.safety ? q.safety.kidsSafe !== false : q.suitability.kids !== "unsuitable";
  return hasChildAge && isSafe;
}

export function filterQuestions(
  questions: readonly Question[],
  criteria: QuestionFilterCriteria,
): readonly Question[] {
  const keyword = criteria.searchKeyword?.trim().toLowerCase();

  return questions.filter((q) => {
    // 0. 仅审核通过限制
    if (criteria.onlyApproved && !isPlayableQuestion(q)) {
      return false;
    }

    // 1. 关键词搜索 (匹配题干、选项A、选项B、话题)
    if (keyword && keyword !== "") {
      const matchQuestion = q.question.toLowerCase().includes(keyword);
      const matchA = q.optionA.toLowerCase().includes(keyword);
      const matchB = q.optionB.toLowerCase().includes(keyword);
      const matchTopic = q.topics.some((t) => t.toLowerCase().includes(keyword));
      const matchTag = q.tags?.some((t) => t.toLowerCase().includes(keyword)) ?? false;

      if (!matchQuestion && !matchA && !matchB && !matchTopic && !matchTag) {
        return false;
      }
    }

    // 2. 年龄筛选 (q.ageGroups 必须包含目标年龄)
    if (criteria.ageGroup && !q.ageGroups.includes(criteria.ageGroup)) {
      return false;
    }

    // 3. 参与关系筛选
    if (criteria.relationship && !q.relationships.includes(criteria.relationship)) {
      return false;
    }

    // 4. 使用场景筛选
    if (criteria.occasion && !q.occasions.includes(criteria.occasion)) {
      return false;
    }

    // 5. 气氛筛选
    if (criteria.tone && !q.tones.includes(criteria.tone)) {
      return false;
    }

    // 6. 难度筛选
    if (criteria.difficulty && q.difficulty !== criteria.difficulty) {
      return false;
    }

    // 7. 话题筛选
    if (criteria.topic && !q.topics.includes(criteria.topic)) {
      return false;
    }

    // 8. 专题集合过滤 (严格依据正式语义与适用性审核，不放宽条件)
    if (criteria.collection) {
      const col = criteria.collection;
      if (col === "kids") {
        // 核心规则：kidsSafe !== Kids audience fit
        if (!isKidsCollectionQuestion(q)) return false;
      } else if (col === "friends") {
        if (!q.relationships.includes("friends") && q.primaryCollection !== "friends") return false;
      } else if (col === "couples") {
        if (!q.relationships.includes("couples") && q.primaryCollection !== "couples") return false;
      } else if (col === "funny") {
        if (!q.tones.includes("funny") && !(q.moods?.includes("funny") ?? false)) return false;
      } else if (col === "hard") {
        if (q.difficulty !== "hard") return false;
      }
    }

    return true;
  });
}
