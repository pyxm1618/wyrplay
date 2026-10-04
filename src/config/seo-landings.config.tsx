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
        lead: "A wholesome, imaginative collection of would you rather questions for kids, created for family car trips, classroom morning meetings, and playful conversations.",
        primaryCta: {
          label: "Play kids dilemmas",
          href: "/would-you-rather-questions-for-kids#play",
        },
        secondaryCta: { label: "Return to home page", href: "/" },
      },
      {
        type: "tool-demo",
        enabled: true,
        order: 20,
        heading: "Interactive Kids Arena",
        body: "Tap A or B to choose, or use Presenter Mode for morning meetings, smartboard activities, and family game nights.",
        surface: (
          <WyrExperience
            questions={kidsQuestions}
            defaultCollection="kids"
            categoryBadge="Kids & Classroom Deck"
          />
        ),
      },
      {
        type: "how-it-works",
        enabled: true,
        order: 30,
        heading: "Ways to Play Would You Rather Questions for Kids",
        steps: [
          {
            title: "Morning classroom meetings",
            body: "Teachers use these would you rather questions for kids as gentle icebreakers that invite every student to participate without pressure.",
          },
          {
            title: "Long family road trips",
            body: "Parents share these would you rather questions for kids on the highway to keep everyone laughing and chatting without screens.",
          },
          {
            title: "Dinner table conversations",
            body: "Families enjoy these would you rather questions for kids at dinner to spark fun stories and friendly debates across generations.",
          },
        ],
      },
      {
        type: "seo-content",
        enabled: true,
        order: 35,
        heading: "Why Kids Love These Clean Dilemmas",
        paragraphs: [
          "Hypothetical choices encourage children to think creatively and express their opinions with confidence. When children answer would you rather questions for kids, they learn to articulate their reasons and listen to different perspectives.",
          "Because every prompt presents two playful options, would you rather questions for kids make it simple to start conversations whether you are at home, in the car, or in the classroom.",
          "To run a quick round of would you rather questions for kids, read both dilemmas out loud, let everyone pick side A or side B, and ask players to give one funny or thoughtful reason for their choice.",
        ],
      },
      {
        type: "faq",
        enabled: true,
        order: 40,
        heading: "Kids Questions FAQ",
        items: [
          {
            question: "Are these would you rather questions for kids clean and family-friendly?",
            answer:
              "Yes. Every dilemma in this deck is selected to be clean, imaginative, and school-safe for kids and families to enjoy together.",
          },
          {
            question: "What ages are these would you rather questions for kids suitable for?",
            answer:
              "These would you rather questions for kids are designed for children aged 5 to 12, but older siblings and parents often join the fun as well.",
          },
          {
            question: "Can teachers use these would you rather questions for kids in class?",
            answer:
              "Yes, educators regularly use these would you rather questions for kids for morning meeting warmups, quick brain breaks, and public speaking practice.",
          },
          {
            question: "How do you play these would you rather questions for kids during car rides?",
            answer:
              "One person reads the two options aloud while passengers take turns picking an answer and explaining why they made their choice.",
          },
          {
            question: "Do you need special equipment to play would you rather questions for kids?",
            answer:
              "No setup is required. You can browse and vote on these questions directly on your phone, tablet, or classroom display.",
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
            description: "Browse more playable dilemmas in the main Would You Rather directory.",
          },
        ],
      },
      {
        type: "final-cta",
        enabled: true,
        order: 60,
        heading: "Start Playing Would You Rather Questions for Kids",
        body: "Scroll up to the live arena to pick your choices or present them to your group.",
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
        primaryCta: {
          label: "Play funny dilemmas",
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
        lead: "Sweet, insightful, and intriguing conversation starters crafted to deepen intimacy, spark shared laughter, and uncover hidden perspectives.",
        primaryCta: {
          label: "Play couples dilemmas",
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
