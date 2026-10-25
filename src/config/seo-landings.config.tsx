import type { LandingSection } from "@/components/landing/landing-page";
import { getQuestionsByCollection, WyrExperience } from "@/modules/would-you-rather";

import { routeRegistry } from "./routes.config";

export type SeoLandingConfig = {
  readonly route: string;
  readonly sections: readonly LandingSection[];
};

function indexableRoute(route: string) {
  const definition = routeRegistry.get(route);
  if (definition.class !== "public_indexable") {
    throw new Error(`${route} must be indexable`);
  }
  return definition;
}

const funnyRoute = indexableRoute("/funny-would-you-rather-questions");
const hardRoute = indexableRoute("/hard-would-you-rather-questions");
const friendsRoute = indexableRoute("/would-you-rather-questions-for-friends");
const couplesRoute = indexableRoute("/would-you-rather-questions-for-couples");
const questionsRoute = indexableRoute("/questions");

const funnyQuestions = getQuestionsByCollection("funny");
const hardQuestions = getQuestionsByCollection("hard");
const friendsQuestions = getQuestionsByCollection("friends");
const couplesQuestions = getQuestionsByCollection("couples");

export const seoLandingPages: readonly SeoLandingConfig[] = [
  {
    route: "/questions",
    sections: [
      {
        type: "hero",
        enabled: true,
        order: 10,
        eyebrow: "Browse by Audience, Style & Relationship",
        h1: questionsRoute.h1,
        lead: "Choose from WYRPlay's existing question collections. Every link below points to a real, reviewed category page; use Find Questions when you want more granular filters.",
        primaryCta: { label: "Find specific questions", href: "/find-questions" },
        secondaryCta: { label: "Build a printable set", href: "/print" },
      },
      {
        type: "use-cases",
        enabled: true,
        order: 20,
        heading: "By Audience",
        items: [
          {
            title: "Kids Would You Rather Questions",
            body: "Clean, imaginative dilemmas designed for family and classroom-friendly play.",
            href: "/would-you-rather-questions-for-kids",
          },
        ],
      },
      {
        type: "use-cases",
        enabled: true,
        order: 30,
        heading: "By Style",
        items: [
          {
            title: "Funny Would You Rather Questions",
            body: "Absurd and playful choices for groups that want a lighter round.",
            href: "/funny-would-you-rather-questions",
          },
          {
            title: "Hard Would You Rather Questions",
            body: "Tougher trade-offs for players who want deeper debate.",
            href: "/hard-would-you-rather-questions",
          },
        ],
      },
      {
        type: "use-cases",
        enabled: true,
        order: 40,
        heading: "By Relationship",
        items: [
          {
            title: "Would You Rather Questions for Friends",
            body: "Conversation-starting dilemmas for hangouts, game nights, and close friends.",
            href: "/would-you-rather-questions-for-friends",
          },
          {
            title: "Would You Rather Questions for Couples",
            body: "Relationship-focused prompts for dates and conversations with a partner.",
            href: "/would-you-rather-questions-for-couples",
          },
        ],
      },
      {
        type: "related-resources",
        enabled: true,
        order: 50,
        heading: "More Ways to Use the Question Bank",
        links: [
          {
            label: "Search and filter the full question bank",
            href: "/find-questions",
            description: "Use audience, occasion, tone, difficulty, and keyword filters.",
          },
          {
            label: "Create a printable question set",
            href: "/print",
            description: "Choose a question count, format, paper size, and export option.",
          },
          {
            label: "Return to WYRPlay home",
            href: "/",
            description: "Play immediately or browse today's highlighted questions.",
          },
        ],
      },
    ],
  },

  // KidsPage owns its rendered content; retain only route registration here.
  { route: "/would-you-rather-questions-for-kids", sections: [] },

  // 2. Funny
  {
    route: "/funny-would-you-rather-questions",
    sections: [
      {
        type: "hero",
        enabled: true,
        order: 10,
        eyebrow: "Absurd & Laugh-Out-Loud",
        h1: funnyRoute.h1,
        lead: "These funny Would You Rather questions mix bizarre superpowers, embarrassing mishaps, and ridiculous trade-offs that keep the group laughing.",
        primaryCta: {
          label: "Play funny Would You Rather",
          href: "/funny-would-you-rather-questions#play",
        },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Comedy Arena",
        body: "Choose your ridiculous fate below. No right answers, just pure unadulterated comedy.",
        surface: (
          <WyrExperience
            questions={funnyQuestions}
            defaultCollection="funny"
            categoryBadge="Comedy & Absurd Deck"
          />
        ),
      },
      {
        type: "how-it-works",
        enabled: true,
        order: 30,
        heading: "Best Scenarios for Funny Would You Rather",
        steps: [
          {
            title: "Party icebreakers",
            body: "Use funny Would You Rather questions as quick party icebreakers when the room needs an easy laugh.",
          },
          {
            title: "Group chat debates",
            body: "Drop a hilarious dilemma into your messaging group and watch the chaos and memes unfold.",
          },
          {
            title: "Weekend sleepovers",
            body: "The funniest Would You Rather prompts keep the room laughing into the early hours without turning the game serious.",
          },
        ],
      },
      {
        type: "faq",
        enabled: true,
        order: 40,
        heading: "Funny Dilemmas FAQ",
        items: [
          {
            question: "Why do funny Would You Rather questions work so well?",
            answer:
              "Silly Would You Rather questions work because both choices invite people to defend ridiculous logic, which creates spontaneous comedy.",
          },
          {
            question: "Can I use keyboard shortcuts on mobile?",
            answer:
              "Keyboard keys (A and B) work on laptops and desktop tablets, while on mobile phones you can simply tap each large option card.",
          },
        ],
      },
      {
        type: "related-resources",
        enabled: true,
        order: 50,
        heading: "Discover Other Categories",
        links: [
          {
            label: "Challenge hard dilemmas",
            href: "/hard-would-you-rather-questions",
            description: "Deep, agonizing trade-offs with high stakes.",
          },
          {
            label: "See friends questions",
            href: "/would-you-rather-questions-for-friends",
            description: "Tailor-made questions for close buddy circles.",
          },
          {
            label: "Return to home page",
            href: "/",
            description: "Explore the comprehensive index of all questions.",
          },
        ],
      },
      {
        type: "final-cta",
        enabled: true,
        order: 60,
        heading: "Ready for the Funniest Would You Rather?",
        body: "Pick from these funny Would You Rather questions, then try another funny Would You Rather choice.",
        cta: { label: "Play funny dilemmas now", href: "/funny-would-you-rather-questions#play" },
      },
    ],
  },

  // 3. Hard
  {
    route: "/hard-would-you-rather-questions",
    sections: [
      {
        type: "hero",
        enabled: true,
        order: 10,
        eyebrow: "Deep & Mind-Bending",
        h1: hardRoute.h1,
        lead: "These hard Would You Rather questions focus on moral crossroads, philosophical trade-offs, and difficult choices that provoke debate and test personal values.",
        primaryCta: {
          label: "Play hard Would You Rather questions",
          href: "/hard-would-you-rather-questions#play",
        },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Crucible Arena",
        body: "Two painful trade-offs with zero compromise. Stand your ground and explain your underlying philosophy.",
        surface: (
          <WyrExperience
            questions={hardQuestions}
            defaultCollection="hard"
            categoryBadge="Hard & Moral Deck"
          />
        ),
      },
      {
        type: "how-it-works",
        enabled: true,
        order: 30,
        heading: "How to Debate Hard Would You Rather Questions",
        steps: [
          {
            title: "Examine core values",
            body: "The hardest Would You Rather questions force you to decide whether you value safety, freedom, truth, or loyalty more.",
          },
          {
            title: "No middle ground",
            body: "Tough Would You Rather questions work best when you resist bargaining and commit to one of the two choices.",
          },
          {
            title: "Respect opposing logic",
            body: "Hard dilemmas rarely have universal consensus. Listen carefully to how others weigh identical stakes differently.",
          },
        ],
      },
      {
        type: "faq",
        enabled: true,
        order: 40,
        heading: "Hard Would You Rather Questions FAQ",
        items: [
          {
            question: "What makes hard Would You Rather questions genuinely difficult?",
            answer:
              "The hardest Would You Rather questions make both outcomes costly or appealing, forcing a real hierarchy of values.",
          },
          {
            question: "Are these questions suitable for dinner parties?",
            answer:
              "Yes. Tough Would You Rather questions can work well for intimate dinners, philosophy discussions, and late-night conversations when people want substance over small talk.",
          },
        ],
      },
      {
        type: "related-resources",
        enabled: true,
        order: 50,
        heading: "Explore Additional Collections",
        links: [
          {
            label: "Browse funny dilemmas",
            href: "/funny-would-you-rather-questions",
            description: "Lighten the mood with absurd and silly scenarios.",
          },
          {
            label: "Discover couples dilemmas",
            href: "/would-you-rather-questions-for-couples",
            description: "Romantic and insightful relationship conversation starters.",
          },
          {
            label: "Return to home page",
            href: "/",
            description: "Return to the main directory of Would You Rather questions.",
          },
        ],
      },
      {
        type: "final-cta",
        enabled: true,
        order: 60,
        heading: "Test Your Personal Principles",
        body: "Try the hardest Would You Rather questions and see where you truly stand.",
        cta: { label: "Tackle a hard dilemma", href: "/hard-would-you-rather-questions#play" },
      },
    ],
  },

  // 4. Friends
  {
    route: "/would-you-rather-questions-for-friends",
    sections: [
      {
        type: "hero",
        enabled: true,
        order: 10,
        eyebrow: "Hangouts & Game Nights",
        h1: friendsRoute.h1,
        lead: "Hilarious banter, loyalties, and playful roasts designed to test how well you and your closest crew truly know each other.",
        primaryCta: {
          label: "Play friends dilemmas",
          href: "/would-you-rather-questions-for-friends#play",
        },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Friends Arena",
        body: "Find out who has your back, who shares your habits, and who has the most chaotic personality in your group.",
        surface: (
          <WyrExperience
            questions={friendsQuestions}
            defaultCollection="friends"
            categoryBadge="Friends Game Night Deck"
          />
        ),
      },
      {
        type: "how-it-works",
        enabled: true,
        order: 30,
        heading: "Level Up Your Game Nights",
        steps: [
          {
            title: "Predict their choices",
            body: "Before a friend reveals their answer, have everyone else vote on what they think that friend will pick.",
          },
          {
            title: "Challenge weird answers",
            body: "Demand real-life examples whenever someone makes a wild or totally unexpected claim.",
          },
          {
            title: "Pass the hot seat",
            body: "Rotate who defends their answer first on each consecutive question.",
          },
        ],
      },
      {
        type: "faq",
        enabled: true,
        order: 40,
        heading: "Friends Questions FAQ",
        items: [
          {
            question: "Can these questions cause real arguments?",
            answer:
              "They cause passionate, funny debates, but all scenarios are crafted to remain lighthearted, enjoyable, and free from toxic hostility.",
          },
          {
            question: "How many players can participate?",
            answer:
              "Anywhere from two best friends to a packed party room of 20+ people. Use Presenter Mode for big groups!",
          },
        ],
      },
      {
        type: "related-resources",
        enabled: true,
        order: 50,
        heading: "More Popular Decks",
        links: [
          {
            label: "Browse funny dilemmas",
            href: "/funny-would-you-rather-questions",
            description: "Uncontrollable laughs and ridiculous superpowers.",
          },
          {
            label: "Challenge hard dilemmas",
            href: "/hard-would-you-rather-questions",
            description: "High-stakes philosophical dilemmas.",
          },
          {
            label: "Return to home page",
            href: "/",
            description: "Return to the main directory of Would You Rather questions.",
          },
        ],
      },
      {
        type: "final-cta",
        enabled: true,
        order: 60,
        heading: "Gather Your Crew",
        body: "Start the game and find out which of your friends is secretly the most unhinged.",
        cta: {
          label: "Start playing with friends",
          href: "/would-you-rather-questions-for-friends#play",
        },
      },
    ],
  },

  // 5. Couples
  {
    route: "/would-you-rather-questions-for-couples",
    sections: [
      {
        type: "hero",
        enabled: true,
        order: 10,
        eyebrow: "Date Night & Relationship Bonding",
        h1: couplesRoute.h1,
        lead: "These Would You Rather questions for couples mix playful choices with relationship-focused prompts that can spark laughter, reveal preferences, and start better conversations.",
        primaryCta: {
          label: "Play Would You Rather for couples",
          href: "/would-you-rather-questions-for-couples#play",
        },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Couples Arena",
        body: "Unpack relationship habits, travel preferences, and life goals over coffee, wine, or a quiet road trip.",
        surface: (
          <WyrExperience
            questions={couplesQuestions}
            defaultCollection="couples"
            categoryBadge="Couples & Date Night Deck"
          />
        ),
      },
      {
        type: "how-it-works",
        enabled: true,
        order: 30,
        heading: "Ways to Play Would You Rather for Couples",
        steps: [
          {
            title: "Simultaneous reveal",
            body: "Couples Would You Rather questions are more fun when you count down '3, 2, 1' and reveal your choices at the same time.",
          },
          {
            title: "Unpack the history",
            body: "Use these Would You Rather couple questions as doorways into personal memories, past experiences, and future hopes.",
          },
          {
            title: "Keep it fun and light",
            body: "Remember that playful disagreements over dishwasher habits or travel styles are part of the charm.",
          },
        ],
      },
      {
        type: "faq",
        enabled: true,
        order: 40,
        heading: "Would You Rather Questions for Couples FAQ",
        items: [
          {
            question:
              "Are these Would You Rather questions for couples appropriate for new relationships as well as married couples?",
            answer:
              "Yes. These couples Would You Rather questions range from playful date-night icebreakers to meaningful choices that suit different stages of a relationship.",
          },
          {
            question: "Can we play these Would You Rather questions for couples on a road trip?",
            answer:
              "Yes! One partner can read questions from their phone while the other drives, making hours fly by effortlessly.",
          },
        ],
      },
      {
        type: "related-resources",
        enabled: true,
        order: 50,
        heading: "Other Great Categories",
        links: [
          {
            label: "Challenge hard dilemmas",
            href: "/hard-would-you-rather-questions",
            description: "Tough ethical and life choices to test each other's principles.",
          },
          {
            label: "See friends questions",
            href: "/would-you-rather-questions-for-friends",
            description: "High-energy questions for double dates and social circles.",
          },
          {
            label: "Return to home page",
            href: "/",
            description: "Explore the comprehensive index of all questions.",
          },
        ],
      },
      {
        type: "final-cta",
        enabled: true,
        order: 60,
        heading: "Keep Playing Would You Rather Questions for Couples",
        body: "Pick a few Would You Rather questions for couples and discover something new about your partner.",
        cta: {
          label: "Play couples questions now",
          href: "/would-you-rather-questions-for-couples#play",
        },
      },
    ],
  },
];

export function seoLandingForRoute(route: string): SeoLandingConfig | undefined {
  return seoLandingPages.find((page) => page.route === route);
}
