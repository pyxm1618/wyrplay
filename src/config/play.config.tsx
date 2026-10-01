import { PlayPage, PrintPage, QUESTIONS_DATABASE } from "@/modules/would-you-rather";
import { featuresConfig } from "./features.config";
export const playConfig = {
  surface: <PlayPage questions={QUESTIONS_DATABASE} authEnabled={featuresConfig.auth.enabled} />,
};
export const printConfig = {
  surface: <PrintPage questions={QUESTIONS_DATABASE} authEnabled={featuresConfig.auth.enabled} />,
};
