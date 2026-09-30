/**
 * WYRPlay 题库共享数据契约
 * 遵循 docs/题库数据契约.md 规范
 */

/** 建议年龄段标识 */
export type AgeGroup = "4-6" | "7-9" | "10-12" | "13-17" | "18+";

/** 参与关系标识 */
export type Relationship = "friends" | "family" | "couples" | "coworkers";

/** 使用场景标识 */
export type Occasion = "classroom" | "party" | "road-trip" | "dinner" | "date-night";

/** 气氛基调标识 */
export type Tone = "funny" | "weird" | "deep";

/** 抉择难度等级 (仅限有明确审核依据时标定，未审核状态下不设值) */
export type Difficulty = "easy" | "hard";

/** 8大标准话题标识 */
export type Topic =
  | "animals-nature"
  | "food-everyday"
  | "fantasy-superpowers"
  | "school-learning"
  | "travel-adventure"
  | "hobbies-entertainment"
  | "relationships-values"
  | "work-money";

/** 适用性审核判定 */
export type SuitabilityRating = "suitable" | "unsuitable" | "unreviewed";

/** 适用性审核维度集合 */
export interface ContentSuitability {
  readonly kids: SuitabilityRating;
  readonly family: SuitabilityRating;
  readonly classroom: SuitabilityRating;
  readonly workplace: SuitabilityRating;
}

/** 题目编辑审核状态 */
export type ReviewStatus = "unreviewed" | "approved" | "deferred" | "rejected" | "retired";

/** 核心专题分类标识 (用于 5 个核心 SEO 落地页及快捷集合) */
export type FeaturedCollectionKey = "kids" | "funny" | "hard" | "friends" | "couples";

/** 题目数据实体 */
export interface Question {
  /** 永久稳定 ID (例如 "wyr-001")，题意变更须生成新 ID */
  readonly id: string;
  /** 题干 */
  readonly question: string;
  /** 选项 A */
  readonly optionA: string;
  /** 选项 B */
  readonly optionB: string;

  /** 建议年龄段 (允许多选，未审核题为空数组) */
  readonly ageGroups: readonly AgeGroup[];
  /** 参与关系 (允许多选，未审核题为空数组) */
  readonly relationships: readonly Relationship[];
  /** 使用场景 (允许多选，未审核题为空数组) */
  readonly occasions: readonly Occasion[];
  /** 气氛基调 (允许多选，未审核题为空数组) */
  readonly tones: readonly Tone[];
  /** 抉择难度 (可选，未审核时不强行指定) */
  readonly difficulty?: Difficulty;
  /** 所属话题 (通常 1-2 个，未审核题为空数组) */
  readonly topics: readonly Topic[];

  /** 内容适用性审核结论 */
  readonly suitability: ContentSuitability;
  /** 编辑审核状态 (必须为 approved 方可进入正式可玩题集与接受真实投票) */
  readonly reviewStatus: ReviewStatus;
  /** 审核说明或修订备注 */
  readonly reviewNotes?: string;

  /** 兼容与向后辅助字段 (可选) */
  readonly tags?: readonly string[];
  readonly collections?: readonly FeaturedCollectionKey[];
  /** 向后兼容旧组件展示字段 (可选) */
  readonly audience?: string;
  readonly occasion?: string;
  readonly style?: string;
}

export interface CategoryItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly href?: string;
  readonly count?: number;
}

export interface CollectionMeta {
  readonly key: FeaturedCollectionKey;
  readonly route: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly primaryKeyword: string;
  readonly secondaryKeywords: readonly string[];
  readonly searchIntent: string;
  readonly h1: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly badge: string;
}

/** 投票结果统计信息 */
export interface VoteStats {
  readonly hasVoted: boolean;
  readonly selectedOption: "A" | "B" | null;
  readonly votesA: number;
  readonly votesB: number;
  readonly total: number;
  readonly percentageA: number;
  readonly percentageB: number;
}
