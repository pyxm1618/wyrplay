import type { LandingSection } from "@/components/landing/landing-page";
import {
  DuelArena,
  getQuestionsByCollection,
  QuestionDirectory,
} from "@/modules/would-you-rather";

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

const kidsRoute = indexableRoute("/would-you-rather-questions-for-kids");
const funnyRoute = indexableRoute("/funny-would-you-rather-questions");
const hardRoute = indexableRoute("/hard-would-you-rather-questions");
const friendsRoute = indexableRoute("/would-you-rather-questions-for-friends");
const couplesRoute = indexableRoute("/would-you-rather-questions-for-couples");

const kidsQuestions = getQuestionsByCollection("kids");
const funnyQuestions = getQuestionsByCollection("funny");
const hardQuestions = getQuestionsByCollection("hard");
const friendsQuestions = getQuestionsByCollection("friends");
const couplesQuestions = getQuestionsByCollection("couples");

export const seoLandingPages: readonly SeoLandingConfig[] = [
  // 1. Kids
  {
    route: "/would-you-rather-questions-for-kids",
    sections: [
      {
        type: "hero",
        enabled: true,
        order: 10,
        eyebrow: "Clean & Classroom Safe",
        h1: kidsRoute.h1,
        lead: "A wholesome, imaginative collection of Would You Rather questions designed specifically for children, elementary students, and family car trips.",
        primaryCta: { label: "Play kids dilemmas", href: "/would-you-rather-questions-for-kids#play" },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Kids Arena",
        body: "Tap A or B to choose, or use Presenter Mode for morning meetings, smartboard activities, and family game nights.",
        surface: (
          <>
            <DuelArena questions={kidsQuestions} categoryBadge="Kids & Classroom Deck" />
            <QuestionDirectory
              questions={kidsQuestions}
              title="Full List of Kids Questions"
              description="Browse all safe and imaginative dilemmas below. Click 'Play this dilemma' to load any question into the arena."
            />
          </>
        ),
      },
      {
        type: "how-it-works",
        enabled: true,
        order: 30,
        heading: "Great Ways to Use Kids Dilemmas",
        steps: [
          {
            title: "Morning classroom meetings",
            body: "Get every student engaged and speaking at the start of the school day with low-stakes creative choices.",
          },
          {
            title: "Long family road trips",
            body: "Pass highway hours screen-free with hilarious debates that parents and siblings of all ages can join.",
          },
          {
            title: "Dinner table icebreakers",
            body: "Replace one-word school check-ins with lively discussions about flying carpets and pet dinosaurs.",
          },
        ],
      },
      {
        type: "faq",
        enabled: true,
        order: 40,
        heading: "Kids Questions FAQ",
        items: [
          {
            question: "Are these questions strictly clean and age-appropriate?",
            answer:
              "Yes. Every question in this collection is carefully filtered to be 100% wholesome, school-safe, and free of violence, gross-out humor, or adult themes.",
          },
          {
            question: "What age range is this collection suited for?",
            answer:
              "These dilemmas are ideal for kids aged 5 to 12, but teenagers and parents frequently enjoy them just as much during family gatherings.",
          },
        ],
      },
      {
        type: "related-resources",
        enabled: true,
        order: 50,
        heading: "More Popular Dilemma Decks",
        links: [
          {
            label: "Browse funny dilemmas",
            href: "/funny-would-you-rather-questions",
            description: "Hilarious and absurd scenarios that keep everyone laughing.",
          },
          {
            label: "See friends questions",
            href: "/would-you-rather-questions-for-friends",
            description: "Spicy banter and roasts for weekend get-togethers.",
          },
          {
            label: "Return to home page",
            href: "/",
            description: "Browse the master directory with over 100+ playable dilemmas.",
          },
        ],
      },
      {
        type: "final-cta",
        enabled: true,
        order: 60,
        heading: "Start Playing Kids Dilemmas Now",
        body: "Scroll up to the live arena and pick your first choice!",
        cta: { label: "Jump to kids arena", href: "/would-you-rather-questions-for-kids#play" },
      },
    ],
  },

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
        lead: "A wildly hilarious collection of bizarre superpowers, embarrassing mishaps, and utterly ridiculous trade-offs that guarantee laughter.",
        primaryCta: { label: "Play funny dilemmas", href: "/funny-would-you-rather-questions#play" },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Comedy Arena",
        body: "Choose your ridiculous fate below. No right answers, just pure unadulterated comedy.",
        surface: (
          <>
            <DuelArena questions={funnyQuestions} categoryBadge="Comedy & Absurd Deck" />
            <QuestionDirectory
              questions={funnyQuestions}
              title="Full List of Funny Questions"
              description="Browse the complete archive of hilarious trade-offs. Tap 'Play this dilemma' to test any scenario."
            />
          </>
        ),
      },
      {
        type: "how-it-works",
        enabled: true,
        order: 30,
        heading: "Best Scenarios for Funny Dilemmas",
        steps: [
          {
            title: "Party icebreakers",
            body: "Break through social awkwardness in seconds by forcing guests to choose between two absurd penalties.",
          },
          {
            title: "Group chat debates",
            body: "Drop a hilarious dilemma into your messaging group and watch the chaos and memes unfold.",
          },
          {
            title: "Weekend sleepovers",
            body: "Keep the room laughing into the early hours with ridiculous hypothetical questions.",
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
              "Comedy in Would You Rather comes from forced commitment to absurdity. When both choices are ridiculous, watching friends earnestly defend their logic produces spontaneous comedy.",
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
        heading: "Ready for Nonstop Laughs?",
        body: "Step into the arena and make your first ridiculous choice.",
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
        lead: "The most agonizing moral crossroads, philosophical trade-offs, and existential dilemmas designed to provoke deep debates and test personal ethics.",
        primaryCta: { label: "Play hard dilemmas", href: "/hard-would-you-rather-questions#play" },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Crucible Arena",
        body: "Two painful trade-offs with zero compromise. Stand your ground and explain your underlying philosophy.",
        surface: (
          <>
            <DuelArena questions={hardQuestions} categoryBadge="Hard & Moral Deck" />
            <QuestionDirectory
              questions={hardQuestions}
              title="Full List of Hard Dilemmas"
              description="Explore all thought-provoking, high-stakes trade-offs. Click 'Play this dilemma' to engage."
            />
          </>
        ),
      },
      {
        type: "how-it-works",
        enabled: true,
        order: 30,
        heading: "How to Debate Hard Dilemmas",
        steps: [
          {
            title: "Examine core values",
            body: "Look past surface preferences and determine whether you prioritize safety, freedom, truth, or loyalty.",
          },
          {
            title: "No middle ground",
            body: "Resist the urge to bargain or create a compromise scenario. The psychological power lies in the binary choice.",
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
        heading: "Hard Dilemmas FAQ",
        items: [
          {
            question: "What makes a dilemma truly 'hard'?",
            answer:
              "A dilemma is genuinely hard when both outcomes inflict a meaningful loss or both grant an irreconcilable privilege, forcing a painful hierarchy of values.",
          },
          {
            question: "Are these questions suitable for dinner parties?",
            answer:
              "Yes! They are exceptional for intimate dinners, philosophy discussions, and late-night campfire talks where people want substance over superficial chit-chat.",
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
        body: "Enter the hard dilemma arena and see where you truly stand.",
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
        primaryCta: { label: "Play friends dilemmas", href: "/would-you-rather-questions-for-friends#play" },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Friends Arena",
        body: "Find out who has your back, who shares your habits, and who has the most chaotic personality in your group.",
        surface: (
          <>
            <DuelArena questions={friendsQuestions} categoryBadge="Friends Game Night Deck" />
            <QuestionDirectory
              questions={friendsQuestions}
              title="Full List of Friends Questions"
              description="Explore all group questions below. Click 'Play this dilemma' to trigger it on screen."
            />
          </>
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
        cta: { label: "Start playing with friends", href: "/would-you-rather-questions-for-friends#play" },
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
        lead: "Sweet, insightful, and intriguing conversation starters crafted to deepen intimacy, spark shared laughter, and uncover hidden perspectives.",
        primaryCta: { label: "Play couples dilemmas", href: "/would-you-rather-questions-for-couples#play" },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Couples Arena",
        body: "Unpack relationship habits, travel preferences, and life goals over coffee, wine, or a quiet road trip.",
        surface: (
          <>
            <DuelArena questions={couplesQuestions} categoryBadge="Couples & Date Night Deck" />
            <QuestionDirectory
              questions={couplesQuestions}
              title="Full List of Couples Questions"
              description="Browse through all relationship conversation starters. Tap 'Play this dilemma' to discuss together."
            />
          </>
        ),
      },
      {
        type: "how-it-works",
        enabled: true,
        order: 30,
        heading: "Date Night Inspiration",
        steps: [
          {
            title: "Simultaneous reveal",
            body: "Count down '3, 2, 1' and say your choices out loud at the exact same moment to see if you match.",
          },
          {
            title: "Unpack the history",
            body: "Use the questions as doorways into personal memories, past experiences, and future hopes.",
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
        heading: "Couples Questions FAQ",
        items: [
          {
            question: "Are these questions appropriate for new couples as well as married couples?",
            answer:
              "Absolutely. The questions range from playful date-night icebreakers to meaningful life and retirement questions suitable for any stage of a relationship.",
          },
          {
            question: "Can we play this on a road trip?",
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
        heading: "Spark Tonight's Conversation",
        body: "Pour a drink, get comfortable, and discover something new about your partner.",
        cta: { label: "Play couples questions now", href: "/would-you-rather-questions-for-couples#play" },
      },
    ],
  },
];

export function seoLandingForRoute(route: string): SeoLandingConfig | undefined {
  return seoLandingPages.find((page) => page.route === route);
}
