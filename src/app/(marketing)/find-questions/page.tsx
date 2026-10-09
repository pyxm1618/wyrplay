import type { Metadata } from "next";
import { finderConfig } from "@/config/finder.config";
import { routeRegistry } from "@/config/routes.config";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import "./finder.css";

export const metadata: Metadata = metadataForRoute(
  routeRegistry,
  "/find-questions",
  currentSeoEnvironment(),
);
export default function FindQuestionsPage() {
  return <main>{finderConfig.surface}</main>;
}
