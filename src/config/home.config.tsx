import type { LandingSection } from "@/components/landing/landing-page";
import {
  EditorialGuideSection,
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
    {
      type: "features",
      enabled: true,
      order: 50,
      heading: "Crafted for Genuine Social Play",
      items: [
        {
          title: "Three-dimensional taxonomy",
          body: "Questions are categorized across Audience, Occasion, and Tone rather than dumped into a single confusing tag list.",
        },
        {
          title: "Classroom presenter mode",
          body: "Launch a clean, distraction-free fullscreen display with keyboard navigation for TV screens and school smartboards.",
        },
        {
          title: "Zero fake metrics",
          body: "No fabricated vote percentages or bot activity. You get pure, high-craft editorial dilemmas designed to spark authentic conversation.",
        },
      ],
    },
    {
      type: "faq",
      enabled: true,
      order: 60,
      heading: "Frequently Asked Questions",
      items: [
        {
          question: "What makes a great Would You Rather question?",
          answer:
            "A compelling dilemma balances two equally appealing or equally difficult choices. If one side is an obvious winner, the discussion ends instantly. The best questions force players to weigh competing personal values.",
        },
        {
          question: "Can I use these questions in school or at work?",
          answer:
            "Yes! Our Kids and Coworkers categories are strictly clean, inclusive, and appropriate for classroom morning meetings, icebreakers, and corporate workshops.",
        },
        {
          question: "How does Presenter Mode work?",
          answer:
            "Click the 'Presenter Mode' badge on the arena to enter an uncluttered, high-contrast fullscreen layout optimized for classroom projectors and living room televisions.",
        },
      ],
    },
    {
      type: "related-resources",
      enabled: true,
      order: 70,
      heading: "Explore More Would You Rather Questions",
      links: [
        {
          label: "Explore kids questions",
          href: "/would-you-rather-questions-for-kids",
          description: "Clean and imaginative dilemmas for children and classrooms.",
        },
        {
          label: "Browse funny dilemmas",
          href: "/funny-would-you-rather-questions",
          description: "Absurd, laugh-out-loud scenarios for parties and road trips.",
        },
        {
          label: "Challenge hard dilemmas",
          href: "/hard-would-you-rather-questions",
          description: "Tough moral and philosophical trade-offs with no easy answers.",
        },
        {
          label: "See friends questions",
          href: "/would-you-rather-questions-for-friends",
          description: "Hilarious banter and friendly roasts for game night groups.",
        },
        {
          label: "Discover couples dilemmas",
          href: "/would-you-rather-questions-for-couples",
          description: "Romantic and insightful conversation starters for partners.",
        },
      ],
    },
    {
      type: "final-cta",
      enabled: true,
      order: 80,
      heading: "Ready to Test Your Instincts?",
      body: "Pick a question, choose your stance, and see if your friends agree with your logic.",
      cta: { label: "Play the first dilemma now", href: "/#play" },
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
      <details className="home-reading">
        <summary>Learn about Would You Rather</summary>
        <EditorialGuideSection />
      </details>
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
