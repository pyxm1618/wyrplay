import type { LandingSection } from "@/components/landing/landing-page";
import {
  CategoryExplorer,
  DuelArena,
  EditorialGuideSection,
  FeaturedCollectionsSection,
  getHomepageQuestions,
  QuestionDirectory,
} from "@/modules/would-you-rather";

import { routeRegistry } from "./routes.config";

const homeRoute = routeRegistry.get("/");
if (homeRoute.class !== "public_indexable") throw new Error("home route must be indexable");

const homepageQuestions = getHomepageQuestions(50);

export const homeConfig = {
  sections: [
    {
      type: "hero",
      enabled: true,
      order: 10,
      eyebrow: "The Definitive Two-Choice Dilemma Engine",
      h1: homeRoute.h1,
      lead: "Browse funny, hard, weird, and thought-provoking Would You Rather questions for friends, kids, couples, parties, classrooms, and more.",
      primaryCta: { label: "Start playing questions", href: "/#play" },
      secondaryCta: { label: "Browse kids dilemmas", href: "/would-you-rather-questions-for-kids" },
    },
    {
      type: "tool-demo",
      enabled: true,
      order: 20,
      heading: "Play Would You Rather Questions Online",
      body: "Use these Would You Rather Questions to pick Option A or Option B and test your instincts. Use keyboard shortcuts (A / B) or launch Presenter Mode for big-screen projector games.",
      surface: (
        <>
          <DuelArena questions={homepageQuestions} categoryBadge="Featured Dilemmas" />
          <QuestionDirectory
            questions={homepageQuestions}
            title="Index of 50 Would You Rather Questions"
            description="Explore our server-rendered Would You Rather Questions archive below. Click 'Play this dilemma' on any question to load it instantly into the live arena above."
          />
          <CategoryExplorer />
          <FeaturedCollectionsSection />
          <EditorialGuideSection />
        </>
      ),
    },
    {
      type: "features",
      enabled: true,
      order: 50,
      heading: "What Makes These Would You Rather Questions Easy to Play",
      items: [
        {
          title: "Three-dimensional taxonomy",
          body: "Each set of Would You Rather Questions is categorized across Audience, Occasion, and Tone rather than dumped into a single confusing tag list.",
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
            "A compelling dilemma balances two equally appealing or equally difficult choices. If one side is an obvious winner, the discussion ends instantly. The best Would You Rather Questions force players to weigh competing personal values.",
        },
        {
          question: "Can I use these questions in school or at work?",
          answer:
            "Yes! These Would You Rather Questions include clean, inclusive options for Kids and Coworkers that fit classroom morning meetings, icebreakers, and corporate workshops.",
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
          description: "25+ clean and imaginative dilemmas for children and classrooms.",
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
      body: "Pick one of our Would You Rather Questions, choose your stance, and see if your friends agree with your logic.",
      cta: { label: "Play the first dilemma now", href: "/#play" },
    },
  ] as const satisfies readonly LandingSection[],
};
