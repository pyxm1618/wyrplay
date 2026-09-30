import rawQuestionsJson from "../../../../content/question-bank/questions.json";
import type {
  AgeGroup,
  CategoryItem,
  CollectionMeta,
  Difficulty,
  FeaturedCollectionKey,
  Occasion,
  Question,
  Relationship,
  Tone,
  Topic,
} from "../types";

export const FEATURED_COLLECTIONS: Record<FeaturedCollectionKey, CollectionMeta> = {
  kids: {
    key: "kids",
    route: "/would-you-rather-questions-for-kids",
    title: "Would You Rather Questions for Kids",
    subtitle:
      "Clean, imaginative, and school-safe dilemmas for classrooms, family dinners, and car rides.",
    description:
      "A curated collection of fun, safe, and engaging Would You Rather questions designed specifically for children and families. Perfect for morning meetings, road trips, and bedtime conversations.",
    primaryKeyword: "would you rather questions for kids",
    secondaryKeywords: [
      "fun questions for kids",
      "clean would you rather",
      "classroom icebreakers for students",
    ],
    searchIntent:
      "find clean, engaging Would You Rather questions suitable for kids and classrooms",
    h1: "Would You Rather Questions for Kids",
    seoTitle: "Would You Rather Questions for Kids – Fun & Clean Dilemmas",
    seoDescription:
      "Discover the best clean and imaginative Would You Rather questions for kids. Perfect for school classrooms, family road trips, and dinner conversations.",
    badge: "For Ages 6–12",
  },
  funny: {
    key: "funny",
    route: "/funny-would-you-rather-questions",
    title: "Funny Would You Rather Questions",
    subtitle:
      "Absurd, hilarious, and downright ridiculous choices that guarantee uncontrollable laughter.",
    description:
      "Bizarre scenarios, silly superpowers, and impossible trade-offs that lighten up any room. Great for lively parties, road trips, and breaking awkward silences.",
    primaryKeyword: "funny would you rather questions",
    secondaryKeywords: [
      "hilarious would you rather",
      "weird would you rather questions",
      "silly party questions",
    ],
    searchIntent: "browse hilarious and ridiculous Would You Rather questions for entertainment",
    h1: "Funny Would You Rather Questions",
    seoTitle: "Funny Would You Rather Questions – Hilarious & Absurd Scenarios",
    seoDescription:
      "Explore hilarious and absurd Would You Rather questions guaranteed to spark laughter at parties, road trips, and get-togethers.",
    badge: "100% Laughs",
  },
  hard: {
    key: "hard",
    route: "/hard-would-you-rather-questions",
    title: "Hard Would You Rather Questions",
    subtitle: "Tough moral crossroads and impossible trade-offs with no easy answers.",
    description:
      "Test your personal principles with high-stakes dilemmas. Each question puts two equally difficult options against one another, provoking deep reflection and intense debate.",
    primaryKeyword: "hard would you rather questions",
    secondaryKeywords: [
      "impossible would you rather",
      "tough moral questions",
      "deep dilemmas to debate",
    ],
    searchIntent:
      "challenge mind and ethics with thought-provoking, difficult Would You Rather questions",
    h1: "Hard Would You Rather Questions",
    seoTitle: "Hard Would You Rather Questions – Impossible Dilemmas & Choices",
    seoDescription:
      "Face impossible choices with our hardest Would You Rather questions. Tough moral trade-offs, philosophical dilemmas, and challenging scenarios.",
    badge: "Impossible Choices",
  },
  friends: {
    key: "friends",
    route: "/would-you-rather-questions-for-friends",
    title: "Would You Rather Questions for Friends",
    subtitle:
      "Friendly roasts, silly debates, and party conversation starters for tight-knit crews.",
    description:
      "Spicy, funny, and revealing questions crafted for friend groups, game nights, and hangouts. Find out who really knows each other best.",
    primaryKeyword: "would you rather questions for friends",
    secondaryKeywords: [
      "questions for friends",
      "game night dilemmas",
      "friend group conversation starters",
    ],
    searchIntent:
      "find entertaining Would You Rather questions to play with friends and friend groups",
    h1: "Would You Rather Questions for Friends",
    seoTitle: "Would You Rather Questions for Friends – Fun Party & Hangout Dilemmas",
    seoDescription:
      "Sparks laughs and friendly debates with the best Would You Rather questions for friends. Ideal for parties, sleepovers, and game nights.",
    badge: "Crew Favorites",
  },
  couples: {
    key: "couples",
    route: "/would-you-rather-questions-for-couples",
    title: "Would You Rather Questions for Couples",
    subtitle: "Intimate, playful, and thought-provoking conversation starters for date nights.",
    description:
      "Deepen your connection and spark playful laughter with dilemmas tailored for dating and married couples. Perfect for road trips, dinner dates, and anniversary talks.",
    primaryKeyword: "would you rather questions for couples",
    secondaryKeywords: [
      "date night questions",
      "couples conversation games",
      "relationship would you rather",
    ],
    searchIntent:
      "discover romantic, fun, and meaningful Would You Rather questions for couples and date nights",
    h1: "Would You Rather Questions for Couples",
    seoTitle: "Would You Rather Questions for Couples – Romantic & Playful Dilemmas",
    seoDescription:
      "Explore romantic, funny, and thought-provoking Would You Rather questions for couples. Great for date night, anniversaries, and road trips.",
    badge: "Date Night Ready",
  },
};

export const AUDIENCE_CATEGORIES: readonly CategoryItem[] = [
  {
    id: "kids",
    name: "Kids",
    description: "Imaginative, wholesome dilemmas suitable for school and family",
    href: "/would-you-rather-questions-for-kids",
  },
  {
    id: "teens",
    name: "Teens",
    description: "High school banter, social media picks, and teenage friendships",
  },
  {
    id: "friends",
    name: "Friends",
    description: "Hilarious banter and friendly roasts for hangouts",
    href: "/would-you-rather-questions-for-friends",
  },
  {
    id: "couples",
    name: "Couples",
    description: "Intimate conversation starters and bonding for partners",
    href: "/would-you-rather-questions-for-couples",
  },
  {
    id: "family",
    name: "Family",
    description: "Wholesome multi-generational questions for dinners and holidays",
  },
  {
    id: "adults",
    name: "Adults",
    description: "Career, financial, and philosophical reality checks",
  },
  {
    id: "coworkers",
    name: "Coworkers",
    description: "Workplace-safe icebreakers for team standups and retreats",
  },
];

export const OCCASION_CATEGORIES: readonly CategoryItem[] = [
  {
    id: "classroom",
    name: "Classroom",
    description: "Morning meetings, ESL practice, and student critical thinking",
  },
  {
    id: "party",
    name: "Party",
    description: "Fast-paced questions to get the whole room arguing and laughing",
  },
  {
    id: "road-trip",
    name: "Road Trip",
    description: "Pass highway hours with captivating screen-free conversations",
  },
  {
    id: "dinner",
    name: "Dinner",
    description: "Effortless group participation around the dining table",
  },
  {
    id: "date-night",
    name: "Date Night",
    description: "Meaningful, playful questions for two over wine or coffee",
  },
  {
    id: "icebreaker",
    name: "Icebreakers",
    description: "Break awkward silences quickly in new teams or workshops",
  },
  {
    id: "birthday-party",
    name: "Birthday Party",
    description: "High-energy fun suitable for guests of all ages",
  },
  {
    id: "sleepover",
    name: "Sleepover",
    description: "Late-night confessions and wildly silly scenarios",
  },
];

export const STYLE_CATEGORIES: readonly CategoryItem[] = [
  {
    id: "funny",
    name: "Funny",
    description: "Pure comedy and absurd situations with zero pressure",
    href: "/funny-would-you-rather-questions",
  },
  {
    id: "hard",
    name: "Hard",
    description: "Agonizing trade-offs where both choices sting",
    href: "/hard-would-you-rather-questions",
  },
  {
    id: "deep",
    name: "Deep",
    description: "Existential queries about human nature, time, and values",
  },
  {
    id: "easy",
    name: "Easy",
    description: "Low-stress picks about daily comforts, food, and habits",
  },
  {
    id: "weird",
    name: "Weird",
    description: "Sci-fi twists, alternate realities, and mind-bending logic",
  },
  {
    id: "clean",
    name: "Clean",
    description: "Strictly safe for school, work, and mixed age groups",
  },
];

interface RawQuestionSchema {
  readonly id: string;
  readonly question: string;
  readonly optionA: string;
  readonly optionB: string;
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
 * 不改题干、不改选项、保留永久稳定 ID (wyr-000001 ~ wyr-000116)。
 */
function adaptRawQuestion(raw: RawQuestionSchema): Question {
  if (!raw.id || !raw.id.startsWith("wyr-")) {
    throw new Error(`Invalid formal question ID: ${raw.id}`);
  }
  if (!raw.question || !raw.optionA || !raw.optionB) {
    throw new Error(`Incomplete formal question data for ID: ${raw.id}`);
  }

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
    } else if (mood === "thoughtful") {
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
      s === "date-night"
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
    tones,
    difficulty,
    topics,
    suitability: {
      kids: raw.safety?.kidsSafe ? "suitable" : "unsuitable",
      family: raw.safety?.familySafe ? "suitable" : "unsuitable",
      classroom: raw.safety?.classroomSafe ? "suitable" : "unsuitable",
      workplace: "unreviewed",
    },
    reviewStatus: "approved",
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
const LOADED_QUESTIONS: readonly Question[] = Object.freeze(
  (rawQuestionsJson as unknown as readonly RawQuestionSchema[]).map(adaptRawQuestion),
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
