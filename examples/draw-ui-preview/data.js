/**
 * wyrplay Preview Data Engine
 * 提取自生产真实题库契约 (src/modules/would-you-rather/data/questions.ts)
 */

window.WYR_DATA = {
  brand: {
    name: "wyrplay",
    tagline: "The Definitive Two-Choice Dilemma Engine",
    description:
      "Browse funny, hard, weird, and thought-provoking Would You Rather questions for friends, kids, couples, parties, and classrooms.",
    domain: "wyrplay.com",
    activeVotersCount: "128,490+",
    curatedQuestionsCount: "1,200+",
  },

  // 核心专题集合 (Featured Collections)
  collections: [
    {
      id: "kids",
      name: "Kids & Classroom",
      badge: "For Ages 6–12",
      color: "emerald",
      icon: "🎒",
      route: "/would-you-rather-questions-for-kids",
      title: "Would You Rather Questions for Kids",
      eyebrow: "Clean & Classroom Safe",
      subtitle:
        "Clean, imaginative, and school-safe dilemmas for classrooms, family dinners, and car rides.",
      description:
        "A wholesome, imaginative collection of Would You Rather questions designed specifically for children, elementary students, and family car trips.",
      searchIntent:
        "find clean, engaging Would You Rather questions suitable for kids and classrooms",
      count: 48,
      tags: ["Clean", "School Safe", "Morning Meetings"],
    },
    {
      id: "funny",
      name: "Funny & Absurd",
      badge: "100% Laughs",
      color: "amber",
      icon: "😂",
      route: "/funny-would-you-rather-questions",
      title: "Funny Would You Rather Questions",
      eyebrow: "Uncontrollable Banter",
      subtitle:
        "Absurd, hilarious, and downright ridiculous choices that guarantee uncontrollable laughter.",
      description:
        "Bizarre scenarios, silly superpowers, and impossible trade-offs that lighten up any room. Great for lively parties and weekend get-togethers.",
      searchIntent: "browse hilarious and ridiculous Would You Rather questions for entertainment",
      count: 65,
      tags: ["Ridiculous", "Party", "Icebreakers"],
    },
    {
      id: "hard",
      name: "Hard Dilemmas",
      badge: "Deep Dilemmas",
      color: "rose",
      icon: "⚖️",
      route: "/hard-would-you-rather-questions",
      title: "Hard Would You Rather Questions",
      eyebrow: "No Easy Answers",
      subtitle: "Tough moral crossroads and impossible trade-offs with no easy answers.",
      description:
        "Test your personal principles with high-stakes dilemmas. Each question puts two equally difficult options against one another, provoking deep reflection and intense debate.",
      searchIntent:
        "find challenging, thought-provoking Would You Rather questions for deep discussions",
      count: 42,
      tags: ["Philosophical", "Moral", "Late Night"],
    },
    {
      id: "friends",
      name: "Friends & Banter",
      badge: "Friend Groups",
      color: "purple",
      icon: "🍻",
      route: "/would-you-rather-questions-for-friends",
      title: "Would You Rather Questions for Friends",
      eyebrow: "Game Night Dilemmas",
      subtitle: "Spicy banter, secrets, and friendly roasts for game nights and weekend hangouts.",
      description:
        "Find out how well your crew truly knows each other. These questions expose hilarious quirks, loyalties, and lighthearted drama among close friends.",
      searchIntent:
        "discover fun and engaging Would You Rather questions to play with close friends",
      count: 54,
      tags: ["Game Night", "Secrets", "Hangouts"],
    },
    {
      id: "couples",
      name: "Couples & Date Night",
      badge: "Romance & Bond",
      color: "pink",
      icon: "🍷",
      route: "/would-you-rather-questions-for-couples",
      title: "Would You Rather Questions for Couples",
      eyebrow: "Intimate & Thoughtful",
      subtitle: "Sweet, insightful, and intriguing conversation starters for date night.",
      description:
        "Spark meaningful conversations, learn each other's hidden preferences, and enjoy cozy date nights with thoughtful questions crafted for partners.",
      searchIntent:
        "find romantic and thought-provoking Would You Rather questions for partners and couples",
      count: 36,
      tags: ["Date Night", "Chemistry", "Deep Talk"],
    },
  ],

  // 维度体系 (Dimensions)
  dimensions: {
    ageGroups: [
      { id: "4-6", label: "Ages 4–6", desc: "Pre-K & Kindergarten simple visual picks" },
      { id: "7-9", label: "Ages 7–9", desc: "Early elementary fun & creative dilemmas" },
      { id: "10-12", label: "Ages 10–12", desc: "Middle school friendly debates" },
      { id: "13-17", label: "Teens (13–17)", desc: "High school social banters & trends" },
      { id: "18+", label: "Adults (18+)", desc: "Complex trade-offs & career/life questions" },
    ],
    relationships: [
      { id: "friends", label: "Friends", desc: "Game night roasts, secrets, and hilarious banter" },
      { id: "family", label: "Family", desc: "Wholesome, cross-generation dinner table starters" },
      { id: "couples", label: "Couples", desc: "Romantic, playful, and value-probing queries" },
      { id: "coworkers", label: "Coworkers", desc: "Safe corporate icebreakers for team standups" },
    ],
    occasions: [
      {
        id: "classroom",
        label: "Classroom",
        icon: "🏫",
        desc: "Morning meetings & critical thinking",
      },
      {
        id: "party",
        label: "Party",
        icon: "🎉",
        desc: "Fast-paced questions to get the room arguing",
      },
      {
        id: "road-trip",
        label: "Road Trip",
        icon: "🚗",
        desc: "Captivating screen-free highway conversations",
      },
      {
        id: "dinner",
        label: "Dinner",
        icon: "🍽️",
        desc: "Effortless participation around the dining table",
      },
      {
        id: "date-night",
        label: "Date Night",
        icon: "🕯️",
        desc: "Playful questions for two over wine",
      },
      {
        id: "icebreaker",
        label: "Icebreakers",
        icon: "🧊",
        desc: "Break awkward silences in new groups",
      },
      {
        id: "birthday-party",
        label: "Birthday Party",
        icon: "🎂",
        desc: "High-energy fun for all guests",
      },
      {
        id: "sleepover",
        label: "Sleepover",
        icon: "⛺",
        desc: "Late-night confessions and silly scenarios",
      },
    ],
    tones: [
      { id: "funny", label: "Funny", icon: "⚡" },
      { id: "hard", label: "Hard", icon: "🧠" },
      { id: "deep", label: "Deep", icon: "🌊" },
      { id: "weird", label: "Weird", icon: "👽" },
      { id: "easy", label: "Easy", icon: "☕" },
      { id: "clean", label: "Clean", icon: "✨" },
    ],
  },

  // 精选真实题目数据库
  questions: [
    {
      id: "wyr-001",
      number: 1,
      question: "Would you rather be able to pause time or rewind time?",
      optionA: "Pause time whenever you want (frozen world)",
      optionB: "Rewind time up to 10 minutes backward",
      collection: "hard",
      categoryBadge: "Top Classic Dilemma",
      audience: "Everyone (All ages)",
      occasion: "Party / Night Walk",
      tone: "Deep & Sci-Fi",
      difficulty: "Hard",
      ageGroups: ["10-12", "13-17", "18+"],
      relationships: ["friends", "coworkers"],
      occasions: ["party", "road-trip"],
      votesA: 14820,
      votesB: 11430,
      totalVotes: 26250,
      quote:
        "Pausing gives you absolute breathing room. Rewinding fixes every regrettable sentence.",
    },
    {
      id: "wyr-002",
      number: 2,
      question:
        "Would you rather always have to sing everything you say or dance every single place you walk?",
      optionA: "Sing whatever you speak with theatrical Broadway flair",
      optionB: "Tap dance every step as you move from room to room",
      collection: "funny",
      categoryBadge: "Party Chaos",
      audience: "Friends & Parties",
      occasion: "Party / Game Night",
      tone: "Funny & Absurd",
      difficulty: "Easy",
      ageGroups: ["7-9", "10-12", "13-17", "18+"],
      relationships: ["friends", "family"],
      occasions: ["party", "sleepover"],
      votesA: 8430,
      votesB: 18920,
      totalVotes: 27350,
      quote:
        "Imagine walking into a silent library while tap dancing, or ordering a flat white in high C sharp.",
    },
    {
      id: "wyr-003",
      number: 3,
      question:
        "Would you rather have a hoverboard that flies 10 feet high or a scooter that travels underwater?",
      optionA: "Hoverboard soaring 10 feet above ground",
      optionB: "Submarine scooter cruising with sea turtles",
      collection: "kids",
      categoryBadge: "Kids & Classroom Safe",
      audience: "Kids (Ages 6–12)",
      occasion: "Classroom / Road Trip",
      tone: "Clean & Creative",
      difficulty: "Easy",
      ageGroups: ["4-6", "7-9", "10-12"],
      relationships: ["family", "friends"],
      occasions: ["classroom", "road-trip"],
      votesA: 16540,
      votesB: 9280,
      totalVotes: 25820,
      quote: "Tested in 40+ elementary schools. Guaranteed to ignite high-energy morning meetings.",
    },
    {
      id: "wyr-004",
      number: 4,
      question:
        "Would you rather know the unfiltered truth about everything or stay blissfully unaware of dark secrets?",
      optionA: "Know absolute, raw truth about everyone and everything",
      optionB: "Retain comforting illusions and peaceful ignorance",
      collection: "hard",
      categoryBadge: "Philosophical Abyss",
      audience: "Adults & Deep Thinkers",
      occasion: "Dinner / Date Night",
      tone: "Deep & Existential",
      difficulty: "Hard",
      ageGroups: ["18+"],
      relationships: ["couples", "friends"],
      occasions: ["dinner", "date-night"],
      votesA: 13120,
      votesB: 14090,
      totalVotes: 27210,
      quote:
        "The closer the percentage splits (48% vs 52%), the harder your heart weighs the trade-off.",
    },
    {
      id: "wyr-005",
      number: 5,
      question:
        "Would you rather travel with your friend group on an unpredictable backpack trip or luxury cruise?",
      optionA: "Wild backpacking trip with zero itinerary",
      optionB: "All-inclusive luxury ocean liner with pampering",
      collection: "friends",
      categoryBadge: "Friendship Litmus Test",
      audience: "Best Friends",
      occasion: "Weekend Hangout",
      tone: "Funny & Social",
      difficulty: "Medium",
      ageGroups: ["13-17", "18+"],
      relationships: ["friends"],
      occasions: ["road-trip", "party"],
      votesA: 11200,
      votesB: 12900,
      totalVotes: 24100,
      quote: "Backpacking builds lifelong memories; luxury prevents friendship-ending arguments.",
    },
    {
      id: "wyr-006",
      number: 6,
      question:
        "Would you rather your partner always picks what movie to watch or always picks where to eat?",
      optionA: "They have 100% control over the movie queue",
      optionB: "They make every single dinner and restaurant call",
      collection: "couples",
      categoryBadge: "Date Night Essential",
      audience: "Couples & Partners",
      occasion: "Date Night / Cozy Dinner",
      tone: "Playful & Romantic",
      difficulty: "Medium",
      ageGroups: ["18+"],
      relationships: ["couples"],
      occasions: ["date-night", "dinner"],
      votesA: 9750,
      votesB: 15630,
      totalVotes: 25380,
      quote: "Food is sacred, but a 3-hour boring movie is three hours you'll never get back.",
    },
    {
      id: "wyr-007",
      number: 7,
      question:
        "Would you rather have an elephant-sized golden retriever or a dog-sized elephant that fits in your lap?",
      optionA: "Giant gentle giant dog the size of a double-decker bus",
      optionB: "Teacup pocket elephant that trumpets softly on your sofa",
      collection: "kids",
      categoryBadge: "Wholesome Imagination",
      audience: "Family & Classrooms",
      occasion: "Morning Meeting / Dinner",
      tone: "Clean & Sweet",
      difficulty: "Easy",
      ageGroups: ["4-6", "7-9", "10-12"],
      relationships: ["family", "friends"],
      occasions: ["classroom", "birthday-party"],
      votesA: 8120,
      votesB: 21340,
      totalVotes: 29460,
      quote: "A 2-ton puppy playing fetch would demolish your neighborhood fence.",
    },
    {
      id: "wyr-008",
      number: 8,
      question:
        "Would you rather never get stuck in traffic again or never have to stand in line anywhere?",
      optionA: "Zero traffic delays forever on every road",
      optionB: "Walk straight to the front of every airport & theme park line",
      collection: "hard",
      categoryBadge: "Daily Superpower",
      audience: "Commuters & Travelers",
      occasion: "Road Trip / Commute",
      tone: "Practical & Fun",
      difficulty: "Hard",
      ageGroups: ["18+"],
      relationships: ["coworkers", "friends"],
      occasions: ["road-trip", "icebreaker"],
      votesA: 13980,
      votesB: 14210,
      totalVotes: 28190,
      quote: "Deadly 50/50 split among frequent flyers and daily highway commuters.",
    },
  ],

  // 模拟当前登录用户数据 (基于真实平台结构)
  currentUser: {
    name: "Alex Morgan",
    email: "alex.morgan@wyrplay.com",
    avatar: "AM",
    membership: "Pro Player (Game Master)",
    joinedDate: "October 2025",
    totalVoted: 42,
    majorityAgreementRate: "68%",
    favoriteCategory: "Kids & Classroom",
    credits: {
      balance: 150,
      monthlyAllowance: 200,
      history: [
        {
          type: "credit_grant",
          amount: "+50",
          note: "Welcome Onboarding Grant",
          date: "2026-09-15",
        },
        {
          type: "custom_deck_creation",
          amount: "-10",
          note: "Created 'Friday Night Roast' Deck",
          date: "2026-09-22",
        },
      ],
    },
    recentVotedHistory: [
      {
        questionId: "wyr-001",
        question: "Would you rather pause time or rewind time?",
        myChoice: "A",
        choiceLabel: "Pause time whenever you want",
        winningOption: "A",
        percentage: "56%",
        date: "Today, 14:20",
      },
      {
        questionId: "wyr-002",
        question: "Would you rather sing everything or dance everywhere?",
        myChoice: "B",
        choiceLabel: "Tap dance every step you take",
        winningOption: "B",
        percentage: "69%",
        date: "Yesterday",
      },
      {
        questionId: "wyr-007",
        question: "Elephant-sized puppy vs Puppy-sized elephant?",
        myChoice: "B",
        choiceLabel: "Pocket elephant on your sofa",
        winningOption: "B",
        percentage: "72%",
        date: "3 days ago",
      },
    ],
  },

  // 核心功能点与产品价值
  features: [
    {
      title: "3D Dilemma Taxonomy",
      badge: "Taxonomy",
      description:
        "Questions aren't dumped into a flat hashtag list. Filter simultaneously by Audience, Occasion, and Tone for instant situational relevance.",
    },
    {
      title: "Classroom Presenter Mode",
      badge: "Projector Mode",
      description:
        "Launch an uncluttered, high-contrast fullscreen display with instant keyboard navigation (A / B / Space / F) designed for smartboards, TVs, and stages.",
    },
    {
      title: "Zero Fake Metrics & Real Data",
      badge: "Pure Integrity",
      description:
        "No fabricated vote percentages or manipulative bot counters. Every bar and ratio reflects pure, editorial human debate.",
    },
    {
      title: "SEO-First Natural Discovery",
      badge: "Content Engine",
      description:
        "Category and segment landings are living interactive playgrounds, not boring 3,000-word walls of filler SEO text.",
    },
  ],

  // 常见问答
  faq: [
    {
      q: "What makes a great Would You Rather question?",
      a: "A compelling dilemma balances two equally appealing or equally difficult choices. If one side is an obvious winner, debate collapses. The best questions force players to weigh competing personal values.",
    },
    {
      q: "Can I use these questions in school or at work?",
      a: "Yes! Our Kids and Coworkers categories are strictly clean, inclusive, and vetted for classroom morning meetings, icebreakers, and corporate workshops.",
    },
    {
      q: "How does Presenter Mode work?",
      a: "Click 'Presenter Mode' or press 'P' to enter a cinema-grade fullscreen layout with giant typography, eliminating all browser chrome for classroom projectors and living room televisions.",
    },
  ],
};
