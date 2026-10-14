import type { CategoryItem, CollectionMeta, FeaturedCollectionKey } from "../types";

export const FEATURED_COLLECTIONS: Record<FeaturedCollectionKey, CollectionMeta> = {
  kids: {
    key: "kids",
    route: "/would-you-rather-questions-for-kids",
    title: "Would You Rather Questions for Kids",
    subtitle:
      "Clean, imaginative, and school-safe dilemmas for classrooms, family dinners, and car rides.",
    description:
      "A curated collection of fun, safe, and engaging Would You Rather questions designed specifically for children and families. Perfect for morning meetings, road trips, and bedtime conversations.",
    primaryKeyword: "would you rather questions for kids",
    secondaryKeywords: [
      "fun questions for kids",
      "clean would you rather",
      "classroom icebreakers for students",
    ],
    searchIntent:
      "find clean, engaging Would You Rather questions suitable for kids and classrooms",
    h1: "Would You Rather Questions for Kids",
    seoTitle: "Would You Rather Questions for Kids – Fun & Clean Dilemmas",
    seoDescription:
      "Discover the best clean and imaginative Would You Rather questions for kids. Perfect for school classrooms, family road trips, and dinner conversations.",
    badge: "For Ages 4–12",
  },
  funny: {
    key: "funny",
    route: "/funny-would-you-rather-questions",
    title: "Funny Would You Rather Questions",
    subtitle:
      "Absurd, hilarious, and downright ridiculous choices that guarantee uncontrollable laughter.",
    description:
      "Bizarre scenarios, silly superpowers, and impossible trade-offs that lighten up any room. Great for lively parties, road trips, and breaking awkward silences.",
    primaryKeyword: "funny would you rather questions",
    secondaryKeywords: [
      "hilarious would you rather",
      "weird would you rather questions",
      "silly party questions",
    ],
    searchIntent: "browse hilarious and ridiculous Would You Rather questions for entertainment",
    h1: "Funny Would You Rather Questions",
    seoTitle: "Funny Would You Rather Questions – Hilarious & Absurd Scenarios",
    seoDescription:
      "Explore hilarious and absurd Would You Rather questions guaranteed to spark laughter at parties, road trips, and get-togethers.",
    badge: "100% Laughs",
  },
  hard: {
    key: "hard",
    route: "/hard-would-you-rather-questions",
    title: "Hard Would You Rather Questions",
    subtitle: "Tough moral crossroads and impossible trade-offs with no easy answers.",
    description:
      "Test your personal principles with high-stakes dilemmas. Each question puts two equally difficult options against one another, provoking deep reflection and intense debate.",
    primaryKeyword: "hard would you rather questions",
    secondaryKeywords: [
      "impossible would you rather",
      "tough moral questions",
      "deep dilemmas to debate",
    ],
    searchIntent:
      "challenge mind and ethics with thought-provoking, difficult Would You Rather questions",
    h1: "Hard Would You Rather Questions",
    seoTitle: "Hard Would You Rather Questions – Impossible Dilemmas & Choices",
    seoDescription:
      "Face impossible choices with our hardest Would You Rather questions. Tough moral trade-offs, philosophical dilemmas, and challenging scenarios.",
    badge: "Impossible Choices",
  },
  friends: {
    key: "friends",
    route: "/would-you-rather-questions-for-friends",
    title: "Would You Rather Questions for Friends",
    subtitle:
      "Friendly roasts, silly debates, and party conversation starters for tight-knit crews.",
    description:
      "Spicy, funny, and revealing questions crafted for friend groups, game nights, and hangouts. Find out who really knows each other best.",
    primaryKeyword: "would you rather questions for friends",
    secondaryKeywords: [
      "questions for friends",
      "game night dilemmas",
      "friend group conversation starters",
    ],
    searchIntent:
      "find entertaining Would You Rather questions to play with friends and friend groups",
    h1: "Would You Rather Questions for Friends",
    seoTitle: "Would You Rather Questions for Friends – Fun Party & Hangout Dilemmas",
    seoDescription:
      "Sparks laughs and friendly debates with the best Would You Rather questions for friends. Ideal for parties, sleepovers, and game nights.",
    badge: "Crew Favorites",
  },
  couples: {
    key: "couples",
    route: "/would-you-rather-questions-for-couples",
    title: "Would You Rather Questions for Couples",
    subtitle: "Intimate, playful, and thought-provoking conversation starters for date nights.",
    description:
      "Deepen your connection and spark playful laughter with dilemmas tailored for dating and married couples. Perfect for road trips, dinner dates, and anniversary talks.",
    primaryKeyword: "would you rather questions for couples",
    secondaryKeywords: [
      "date night questions",
      "couples conversation games",
      "relationship would you rather",
    ],
    searchIntent:
      "discover romantic, fun, and meaningful Would You Rather questions for couples and date nights",
    h1: "Would You Rather Questions for Couples",
    seoTitle: "Would You Rather Questions for Couples – Romantic & Playful Dilemmas",
    seoDescription:
      "Explore romantic, funny, and thought-provoking Would You Rather questions for couples. Great for date night, anniversaries, and road trips.",
    badge: "Date Night Ready",
  },
};

export const AUDIENCE_CATEGORIES: readonly CategoryItem[] = [
  {
    id: "kids",
    name: "Kids",
    description: "Imaginative, wholesome dilemmas suitable for school and family",
    href: "/would-you-rather-questions-for-kids",
  },
  {
    id: "teens",
    name: "Teens",
    description: "High school banter, social media picks, and teenage friendships",
  },
  {
    id: "friends",
    name: "Friends",
    description: "Hilarious banter and friendly roasts for hangouts",
    href: "/would-you-rather-questions-for-friends",
  },
  {
    id: "couples",
    name: "Couples",
    description: "Intimate conversation starters and bonding for partners",
    href: "/would-you-rather-questions-for-couples",
  },
  {
    id: "family",
    name: "Family",
    description: "Wholesome multi-generational questions for dinners and holidays",
  },
  {
    id: "adults",
    name: "Adults",
    description: "Career, financial, and philosophical reality checks",
  },
  {
    id: "coworkers",
    name: "Coworkers",
    description: "Workplace-safe icebreakers for team standups and retreats",
  },
];

export const OCCASION_CATEGORIES: readonly CategoryItem[] = [
  {
    id: "classroom",
    name: "Classroom",
    description: "Morning meetings, ESL practice, and student critical thinking",
  },
  {
    id: "party",
    name: "Party",
    description: "Fast-paced questions to get the whole room arguing and laughing",
  },
  {
    id: "road-trip",
    name: "Road Trip",
    description: "Pass highway hours with captivating screen-free conversations",
  },
  {
    id: "dinner",
    name: "Dinner",
    description: "Effortless group participation around the dining table",
  },
  {
    id: "date-night",
    name: "Date Night",
    description: "Meaningful, playful questions for two over wine or coffee",
  },
  {
    id: "icebreaker",
    name: "Icebreakers",
    description: "Break awkward silences quickly in new teams or workshops",
  },
  {
    id: "birthday-party",
    name: "Birthday Party",
    description: "High-energy fun suitable for guests of all ages",
  },
  {
    id: "sleepover",
    name: "Sleepover",
    description: "Late-night confessions and wildly silly scenarios",
  },
];

export const STYLE_CATEGORIES: readonly CategoryItem[] = [
  {
    id: "funny",
    name: "Funny",
    description: "Pure comedy and absurd situations with zero pressure",
    href: "/funny-would-you-rather-questions",
  },
  {
    id: "hard",
    name: "Hard",
    description: "Agonizing trade-offs where both choices sting",
    href: "/hard-would-you-rather-questions",
  },
  {
    id: "deep",
    name: "Deep",
    description: "Existential queries about human nature, time, and values",
  },
  {
    id: "easy",
    name: "Easy",
    description: "Low-stress picks about daily comforts, food, and habits",
  },
  {
    id: "weird",
    name: "Weird",
    description: "Sci-fi twists, alternate realities, and mind-bending logic",
  },
  {
    id: "clean",
    name: "Clean",
    description: "Strictly safe for school, work, and mixed age groups",
  },
];
