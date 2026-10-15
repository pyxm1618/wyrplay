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
 * 已批准的 21 张 2:1 母版；永久存于独立媒体 R2，文件名包含内容哈希。
 */
const questionVisualRegistry: Readonly<Record<string, QuestionVisualAsset>> = {
  "wyr-000001": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000001-4c545c9f541b.png",
    width: 1774,
    height: 887,
    alt: "Would you rather hear a squirrel tell stories or hear a turtle tell jokes?",
  },
  "wyr-000002": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000002-5f06e6cdd0ed.png",
    width: 1774,
    height: 887,
    alt: "Would you rather hop across a room of pillows or crawl through a tunnel of blankets?",
  },
  "wyr-000003": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000003-48f512b245bd.png",
    width: 1774,
    height: 887,
    alt: "Would you rather have bubbles follow you or have paper airplanes follow you?",
  },
  "wyr-000004": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000004-777310cfaefe.png",
    width: 1774,
    height: 887,
    alt: "Would you rather feed carrots to a giraffe or feed apples to a pony?",
  },
  "wyr-000005": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000005-b10d2489dbc1.png",
    width: 1774,
    height: 887,
    alt: "Would you rather have a lunchbox that hums or have a backpack that blinks?",
  },
  "wyr-000006": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000006-0fd94e77d537.png",
    width: 1774,
    height: 887,
    alt: "Would you rather play hide-and-seek in a pillow fort or play tag in a big yard?",
  },
  "wyr-000007": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000007-a65fab17d66f.png",
    width: 1774,
    height: 887,
    alt: "Would you rather find a smooth rainbow rock or find a giant shiny feather?",
  },
  "wyr-000008": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000008-40c10ae0a006.png",
    width: 1774,
    height: 887,
    alt: "Would you rather make a snow animal or make a sand animal?",
  },
  "wyr-000009": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000009-42ab6be90fcf.png",
    width: 1774,
    height: 887,
    alt: "Would you rather meet a snail pulling a tiny wagon or meet a frog wearing a tiny hat?",
  },
  "wyr-000010": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000010-1dd6f9cbac36.png",
    width: 1774,
    height: 887,
    alt: "Would you rather dance like a robot or march like a penguin?",
  },
  "wyr-000018": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000018-eae810e2eade.png",
    width: 1774,
    height: 887,
    alt: "Invent a recess game or learn a new trick",
  },
  "wyr-000019": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000019-91966b314ce7.png",
    width: 1774,
    height: 887,
    alt: "Explore a glowing cave or a color-changing forest",
  },
  "wyr-000020": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000020-0494f0de0d62.png",
    width: 1774,
    height: 887,
    alt: "Lead a treasure hunt or solve clues as a detective",
  },
  "wyr-000021": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000021-04fefe864b4b.png",
    width: 1774,
    height: 887,
    alt: "Build with cardboard boxes or building bricks",
  },
  "wyr-000022": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000022-b82dedc68f65.png",
    width: 1774,
    height: 887,
    alt: "One flexible homework task or three scheduled tasks",
  },
  "wyr-000023": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000023-d330f63c1630.png",
    width: 1774,
    height: 887,
    alt: "Talk about a hobby or teach the class how to do it",
  },
  "wyr-000024": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000024-80f844e2b6e7.png",
    width: 1774,
    height: 887,
    alt: "Find the best route or pack everything needed",
  },
  "wyr-000025": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000025-a9d783593e61.png",
    width: 1774,
    height: 887,
    alt: "A robot sorting belongings or finding lost things",
  },
  "wyr-000026": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000026-5c997ea9dfd3.png",
    width: 1774,
    height: 887,
    alt: "Master a magic trick or a dance routine",
  },
  "wyr-000027": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000027-35709fe372df.png",
    width: 1774,
    height: 887,
    alt: "Discover a new bird or a new flower",
  },
  "wyr-000037": {
    src: "https://media.wyrplay.com/questions/v1/wyr-000037-852a1b7a5308.png",
    width: 1774,
    height: 887,
    alt: "Start projects or finish projects",
  },
};

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
