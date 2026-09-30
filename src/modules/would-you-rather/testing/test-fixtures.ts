import type { Question } from "../types";

/**
 * 专门用于开发测试与 E2E 验证的受控题库 Fixture
 * 包含已审核通过 (approved) 的合法题目，仅在 APP_ENV === "test" 环境下按需读取，
 * 绝不混入公开生产题库 QUESTIONS_DATABASE，生产环境下完全被隔离。
 */
export const TEST_FIXTURE_QUESTIONS: readonly Question[] = [
  {
    id: "test-001",
    question: "Would you rather have the ability to fly or be invisible?",
    optionA: "Fly at airplane speeds anywhere",
    optionB: "Become completely invisible at will",
    ageGroups: ["7-9", "10-12"],
    relationships: ["friends"],
    occasions: ["party", "classroom"],
    tones: ["funny"],
    difficulty: "easy",
    topics: ["fantasy-superpowers"],
    suitability: {
      kids: "suitable",
      family: "suitable",
      classroom: "suitable",
      workplace: "suitable",
    },
    reviewStatus: "approved",
    reviewNotes: "Test fixture verified question.",
  },
  {
    id: "test-002",
    question: "Would you rather always speak your mind or never speak again?",
    optionA: "Always speak raw truth without filter",
    optionB: "Never speak a single word aloud",
    ageGroups: ["13-17", "18+"],
    relationships: ["friends", "couples"],
    occasions: ["dinner"],
    tones: ["deep"],
    difficulty: "hard",
    topics: ["relationships-values"],
    suitability: {
      kids: "unsuitable",
      family: "suitable",
      classroom: "suitable",
      workplace: "suitable",
    },
    reviewStatus: "approved",
    reviewNotes: "Test fixture verified question.",
  },
  {
    id: "test-003",
    question: "Would you rather live in a treehouse or an underwater dome?",
    optionA: "Giant redwood treehouse with rope bridges",
    optionB: "Underwater glass dome surrounded by marine life",
    ageGroups: ["4-6", "7-9", "10-12"],
    relationships: ["family", "friends"],
    occasions: ["road-trip", "classroom"],
    tones: ["weird"],
    difficulty: "easy",
    topics: ["travel-adventure", "animals-nature"],
    suitability: {
      kids: "suitable",
      family: "suitable",
      classroom: "suitable",
      workplace: "suitable",
    },
    reviewStatus: "approved",
    reviewNotes: "Test fixture verified question.",
  },
];
