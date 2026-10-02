import type { LandingSection } from "@/components/landing/landing-page";
import {
  QUESTIONS_DATABASE,
  WyrExperience,
  type LeaderboardResult,
} from "@/modules/would-you-rather";

import { routeRegistry } from "./routes.config";

const homeRoute = routeRegistry.get("/");
if (homeRoute.class !== "public_indexable") throw new Error("home route must be indexable");

export const homeConfig = {
  sections: [
    {
      type: "hero",
      presentation: "full-bleed",
      enabled: true,
      order: 10,
      h1: homeRoute.h1,
      lead: "Play fun and thought-provoking would you rather questions with people around the world.",
      primaryCta: { label: "Make Your Choice", href: "/#play" },
      surface: homeSurface({ status: "unavailable" }),
    },
  ] as const satisfies readonly LandingSection[],
};

function homeSurface(leaderboard: LeaderboardResult) {
  return (
    <>
      <WyrExperience
        appearance="illustrated-home"
        questions={QUESTIONS_DATABASE}
        categoryBadge="All Curated Dilemmas"
        showCategoryExplorer={true}
        leaderboard={leaderboard}
      />
    </>
  );
}

export function homeConfigWithLeaderboard(leaderboard: LeaderboardResult) {
  return {
    ...homeConfig,
    sections: homeConfig.sections.map((section) =>
      section.type === "hero" ? { ...section, surface: homeSurface(leaderboard) } : section,
    ),
  };
}
