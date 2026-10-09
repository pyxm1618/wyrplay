export interface QuestionVisualAsset {
  readonly questionId: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

/**
 * 统一题目视觉资源注册表
 *
 * 核心规则：
 * 1. 严格使用真实 Question ID 映射。
 * 2. 每道题对应一张标准的 2:1 母版插画（左右各占 50%，无内嵌文字，无 A/B 标签）。
 * 3. 仅登记具有确认母版的题目，未登记的题目统一返回 undefined 并安全走各页面原有 UI fallback。
 * 4. 严禁将图片二进制或 Base64 编入 JavaScript。
 */
export const QUESTION_VISUALS: Readonly<Record<string, QuestionVisualAsset>> = {
  "wyr-000001": {
    questionId: "wyr-000001",
    src: "/question-visuals/wyr-000001.png",
    width: 1200,
    height: 600,
    alt: "A storytelling squirrel with an open book and a laughing turtle wearing a tiny party hat",
  },
  "wyr-000002": {
    questionId: "wyr-000002",
    src: "/question-visuals/wyr-000002.png",
    width: 1200,
    height: 600,
    alt: "A cozy room filled with colorful fluffy pillows and a glowing blanket fort tunnel",
  },
  "wyr-000003": {
    questionId: "wyr-000003",
    src: "/question-visuals/wyr-000003.png",
    width: 1200,
    height: 600,
    alt: "Iridescent soap bubbles floating in the air and playful folded paper airplanes soaring",
  },
  "wyr-000004": {
    questionId: "wyr-000004",
    src: "/question-visuals/wyr-000004.png",
    width: 1200,
    height: 600,
    alt: "Feeding crisp orange carrots to a tall friendly giraffe and crisp red apples to a gentle pony",
  },
};

/**
 * 获取指定题目的视觉资源
 * @param questionId 题目唯一 ID
 * @returns 视觉资源元数据；若题目未配置母版则返回 undefined
 */
export function getQuestionVisual(questionId: string | undefined): QuestionVisualAsset | undefined {
  if (!questionId) return undefined;
  return QUESTION_VISUALS[questionId];
}
