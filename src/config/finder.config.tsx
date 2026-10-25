import {
  FinderExperience,
  projectQuestionsForClient,
  QUESTIONS_DATABASE,
} from "@/modules/would-you-rather";
import { featuresConfig } from "./features.config";

export const finderConfig = {
  surface: (
    <FinderExperience
      questions={projectQuestionsForClient(QUESTIONS_DATABASE)}
      authEnabled={featuresConfig.auth.enabled}
    />
  ),
} as const;
