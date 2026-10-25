import {
  PlayPage,
  PrintPage,
  projectQuestionsForClient,
  QUESTIONS_DATABASE,
} from "@/modules/would-you-rather";
import { featuresConfig } from "./features.config";

const clientQuestions = projectQuestionsForClient(QUESTIONS_DATABASE);

export const playConfig = {
  surface: <PlayPage questions={clientQuestions} authEnabled={featuresConfig.auth.enabled} />,
};
export const printConfig = {
  surface: <PrintPage questions={clientQuestions} authEnabled={featuresConfig.auth.enabled} />,
};
