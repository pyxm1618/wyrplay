/**
 * Question Visuals 统一资源注册表
 *
 * 核心契约：questionId -> 2:1 高清插画母版技术资源
 *
 * 规则：
 * 1. 严格使用真实的 Question ID 映射。
 * 2. 只有经过用户审核并确认的真实 2:1 母版才在此登记。
 * 3. 当前未批准或未提供母版的题目统一返回 undefined，所有消费场景必须 100% 优雅回退至原有原生 UI。
 * 4. 严禁自行伪造插画、严禁绑定未经批准素材。
 */

export interface QuestionVisualAsset {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

/**
 * 真实 2:1 高清母版注册表（当前等待用户逐张提供审核通过的正式母版）
 */
const questionVisualRegistry: Readonly<Record<string, QuestionVisualAsset>> = {};

/**
 * 根据题目 ID 获取对应的视觉插画母版资源。若无明确批准的母版则返回 undefined。
 */
export function getQuestionVisual(questionId: string): QuestionVisualAsset | undefined {
  return questionVisualRegistry[questionId];
}

/**
 * 判断题目是否已配置视觉插画母版
 */
export function hasQuestionVisual(questionId: string): boolean {
  return questionId in questionVisualRegistry;
}
