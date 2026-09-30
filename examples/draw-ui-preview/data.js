/**
 * wyrplay Preview V2 Data Engine
 * 严格基于正式题库 Source of Truth (content/question-bank/questions.json) 与真实账户架构
 */

window.WYR_DATA = {
  brand: {
    name: "wyrplay",
    tagline: "The Definitive Two-Choice Dilemma Engine",
    description:
      "Curated, high-craft Would You Rather questions for classrooms, game nights, road trips, and social debates.",
    domain: "wyrplay.com",
  },

  // 1. Primary Curated Entrances (主要策展入口集合)
  // 分别划定 Age, Relationship, Scenario，绝不混维
  primaryEntrances: {
    byAge: [
      {
        id: "kids",
        name: "Kids (Clean & Safe)",
        categoryType: "Age Collection",
        dimension: "Age Band (4–12)",
        badge: "Clean & School Safe",
        icon: "🎒",
        route: "/would-you-rather-questions-for-kids",
        title: "Would You Rather Questions for Kids",
        eyebrow: "Age Band · Clean & Imaginative",
        subtitle:
          "Wholesome, creative dilemmas designed for elementary students, morning meetings, and family car trips.",
        description:
          "Carefully vetted for 100% wholesome safety with zero crude humor, ideal for ages 4 through 12.",
        count: 24,
        safety: { kidsSafe: true, classroomSafe: true, familySafe: true },
      },
      {
        id: "teens",
        name: "Teens (High School)",
        categoryType: "Age Collection",
        dimension: "Age Band (13–17)",
        badge: "Social & Trendy",
        icon: "🎧",
        route: "/would-you-rather-questions-for-teens",
        title: "Would You Rather Questions for Teens",
        eyebrow: "Age Band · Banter & Trends",
        subtitle:
          "Engaging dilemmas touching friendships, social dynamics, music, and high school dilemmas.",
        description:
          "Tailored to high school conversation styles, debate topics, and weekend hangouts.",
        count: 18,
        safety: { kidsSafe: false, classroomSafe: true, familySafe: true },
      },
      {
        id: "adults",
        name: "Adults (18+)",
        categoryType: "Age Collection",
        dimension: "Age Band (18+)",
        badge: "Complex & Nuanced",
        icon: "☕",
        route: "/would-you-rather-questions-for-adults",
        title: "Would You Rather Questions for Adults",
        eyebrow: "Age Band · Values & Trade-offs",
        subtitle:
          "Thought-provoking lifestyle, moral, career, and philosophical crossroads with no obvious answers.",
        description:
          "Mature philosophical debates and lifestyle trade-offs for dinner parties and late-night talks.",
        count: 22,
        safety: { kidsSafe: false, classroomSafe: false, familySafe: false },
      },
    ],

    byRelationship: [
      {
        id: "friends",
        name: "Friends",
        categoryType: "Relationship Collection",
        dimension: "Relationship",
        badge: "Game Night",
        icon: "🍻",
        route: "/would-you-rather-questions-for-friends",
        title: "Would You Rather Questions for Friends",
        eyebrow: "Relationship · Game Night Roasts",
        subtitle:
          "Spicy banter, quirks, and friendly roasts for game nights and weekend get-togethers.",
        description:
          "Find out how well your crew truly knows each other with hilarious friend-group dilemmas.",
        count: 20,
      },
      {
        id: "couples",
        name: "Couples",
        categoryType: "Relationship Collection",
        dimension: "Relationship",
        badge: "Date Night",
        icon: "🍷",
        route: "/would-you-rather-questions-for-couples",
        title: "Would You Rather Questions for Couples",
        eyebrow: "Relationship · Date Night & Bond",
        subtitle: "Sweet, insightful, and intriguing conversation starters for partners and dates.",
        description:
          "Spark meaningful discussions and learn each other's hidden tastes over wine or coffee.",
        count: 16,
      },
      {
        id: "family",
        name: "Family",
        categoryType: "Relationship Collection",
        dimension: "Relationship",
        badge: "Dinner Table",
        icon: "🏡",
        route: "/would-you-rather-questions-for-family",
        title: "Would You Rather Questions for Family",
        eyebrow: "Relationship · All Generations",
        subtitle:
          "Wholesome cross-generational dilemmas for parents, siblings, and grandparents around the table.",
        description:
          "Effortless participation that brings kids and grandparents into the exact same fun conversation.",
        count: 14,
      },
      {
        id: "coworkers",
        name: "Coworkers",
        categoryType: "Relationship Collection",
        dimension: "Relationship",
        badge: "Workplace Safe",
        icon: "💼",
        route: "/would-you-rather-questions-for-coworkers",
        title: "Would You Rather Questions for Coworkers",
        eyebrow: "Relationship · Team Icebreakers",
        subtitle:
          "Professional yet engaging icebreakers for team standups, all-hands, and corporate retreats.",
        description:
          "Workplace-safe dilemmas designed to spark connection without crossing HR boundaries.",
        count: 12,
      },
    ],

    byScenario: [
      {
        id: "classroom",
        name: "Classroom",
        categoryType: "Scenario Collection",
        dimension: "Scenario",
        badge: "Morning Meetings",
        icon: "🏫",
        route: "/would-you-rather-questions-for-classroom",
        title: "Classroom Icebreakers & Dilemmas",
        eyebrow: "Scenario · Education & ESL",
        subtitle:
          "Critical thinking, ESL speech prompts, and morning meeting icebreakers for students.",
        description:
          "Teacher-tested dilemmas that get every student talking and thinking critically.",
        count: 18,
      },
      {
        id: "party",
        name: "Party",
        categoryType: "Scenario Collection",
        dimension: "Scenario",
        badge: "Fast-Paced Fun",
        icon: "🎉",
        route: "/would-you-rather-questions-for-party",
        title: "Party Game Night Dilemmas",
        eyebrow: "Scenario · High Energy",
        subtitle:
          "Fast-paced, ridiculous scenarios to get the whole room arguing, shouting, and laughing.",
        description:
          "High-octane social questions designed to break awkward silences at any social gathering.",
        count: 22,
      },
      {
        id: "road-trip",
        name: "Road Trip",
        categoryType: "Scenario Collection",
        dimension: "Scenario",
        badge: "Highway Hours",
        icon: "🚗",
        route: "/would-you-rather-questions-for-road-trip",
        title: "Road Trip Conversation Starters",
        eyebrow: "Scenario · Screen-Free Travel",
        subtitle:
          "Captivating screen-free highway conversations for driver, passenger, and backseat.",
        description:
          "Pass highway miles effortlessly with engaging questions the whole car can answer.",
        count: 16,
      },
      {
        id: "date-night",
        name: "Date Night",
        categoryType: "Scenario Collection",
        dimension: "Scenario",
        badge: "Intimate Dinner",
        icon: "🕯️",
        route: "/would-you-rather-questions-for-date-night",
        title: "Date Night Dilemmas",
        eyebrow: "Scenario · Two Players",
        subtitle:
          "Meaningful, playful questions for two over dinner, drinks, or an evening stroll.",
        description: "Go beyond standard small talk with thought-provoking questions for dates.",
        count: 14,
      },
      {
        id: "icebreakers",
        name: "Icebreakers",
        categoryType: "Scenario Collection",
        dimension: "Scenario",
        badge: "Break the Silence",
        icon: "🧊",
        route: "/would-you-rather-questions-for-icebreakers",
        title: "Quick Icebreaker Questions",
        eyebrow: "Scenario · New Groups",
        subtitle: "Zero-pressure prompts to quickly get unfamiliar groups talking comfortably.",
        description: "Quick 2-minute prompts for workshops, orientations, and community meetups.",
        count: 15,
      },
      {
        id: "sleepover",
        name: "Sleepover",
        categoryType: "Scenario Collection",
        dimension: "Scenario",
        badge: "Late Night",
        icon: "⛺",
        route: "/would-you-rather-questions-for-sleepover",
        title: "Sleepover Confessions & Stories",
        eyebrow: "Scenario · Late Hours",
        subtitle: "Late-night silly scenarios, funny confessions, and group game dilemmas.",
        description: "Designed for sleepovers, campouts, and cozy late-night group banter.",
        count: 12,
      },
    ],
  },

  // 2. 正交多维 Facets (用于内容过滤与交叉检索，不混维)
  facets: {
    ageBands: [
      { id: "4-6", label: "Ages 4–6", desc: "Pre-K & Kindergarten simple visual picks" },
      { id: "7-9", label: "Ages 7–9", desc: "Elementary creative dilemmas" },
      { id: "10-12", label: "Ages 10–12", desc: "Middle school debates" },
      { id: "teens", label: "Teens (13–17)", desc: "High school social banters" },
      { id: "adults", label: "Adults (18+)", desc: "Complex trade-offs & career/life choices" },
    ],
    relationships: [
      { id: "family", label: "Family", desc: "Cross-generational dinner table conversations" },
      { id: "friends", label: "Friends", desc: "Game night banter, roasts, and secrets" },
      { id: "couples", label: "Couples", desc: "Romantic, playful, and value-probing prompts" },
      { id: "coworkers", label: "Coworkers", desc: "Professional workplace-safe icebreakers" },
    ],
    scenarios: [
      {
        id: "classroom",
        label: "Classroom",
        icon: "🏫",
        desc: "Morning meetings & critical thinking",
      },
      { id: "party", label: "Party", icon: "🎉", desc: "High-energy crowd questions" },
      { id: "road-trip", label: "Road Trip", icon: "🚗", desc: "Screen-free highway travel games" },
      { id: "dinner", label: "Dinner", icon: "🍽️", desc: "Easy participation around the table" },
      { id: "date-night", label: "Date Night", icon: "🕯️", desc: "Intimate conversation for two" },
      {
        id: "icebreakers",
        label: "Icebreakers",
        icon: "🧊",
        desc: "Break awkward silences quickly",
      },
      {
        id: "birthday-party",
        label: "Birthday Party",
        icon: "🎂",
        desc: "Celebration fun for all ages",
      },
      { id: "sleepover", label: "Sleepover", icon: "⛺", desc: "Late-night stories and scenarios" },
      { id: "general", label: "General", icon: "✨", desc: "Universal dilemmas for any setting" },
    ],
    moods: [
      { id: "funny", label: "Funny", icon: "😂", desc: "Absurd situations with pure comedy" },
      {
        id: "imaginative",
        label: "Imaginative",
        icon: "🎨",
        desc: "Fantasy twists and creative scenarios",
      },
      { id: "light", label: "Light", icon: "☀️", desc: "Low-stress daily habits and fun picks" },
      { id: "weird", label: "Weird", icon: "👽", desc: "Mind-bending logic and odd choices" },
      {
        id: "thoughtful",
        label: "Thoughtful",
        icon: "🧠",
        desc: "Values, principles, and reflection",
      },
    ],
    difficulty: [
      { id: "easy", label: "Easy Pick", desc: "Straightforward and breezy" },
      { id: "hard", label: "Hard Dilemma", desc: "Tough choice where both options sting" },
    ],
  },

  // 3. 真实正式题库数据 (100% 抽取自 content/question-bank/questions.json)
  questions: [
    {
      id: "wyr-000001",
      number: 1,
      question: "Would you rather hear a squirrel tell stories or hear a turtle tell jokes?",
      optionA: "Hear a squirrel tell stories",
      optionB: "Hear a turtle tell jokes",
      primaryCollection: "kids",
      primaryAgeBand: "4-6",
      ageBands: ["4-6", "7-9"],
      relationships: ["family", "friends"],
      scenarios: ["classroom", "general"],
      moods: ["funny", "imaginative"],
      difficulty: "hard",
      topics: ["animals", "fantasy"],
      safety: { kidsSafe: true, classroomSafe: true, familySafe: true },
      provenance: { batch: "kids-batch-001", candidateId: "kid-candidate-004" },
    },
    {
      id: "wyr-000002",
      number: 2,
      question:
        "Would you rather hop across a room of pillows or crawl through a tunnel of blankets?",
      optionA: "Hop across a room of pillows",
      optionB: "Crawl through a tunnel of blankets",
      primaryCollection: "kids",
      primaryAgeBand: "4-6",
      ageBands: ["4-6"],
      relationships: ["family", "friends"],
      scenarios: ["party", "sleepover"],
      moods: ["funny", "light"],
      difficulty: "easy",
      topics: ["games"],
      safety: { kidsSafe: true, classroomSafe: true, familySafe: true },
      provenance: { batch: "kids-batch-001", candidateId: "kid-candidate-006" },
    },
    {
      id: "wyr-000003",
      number: 3,
      question: "Would you rather have bubbles follow you or have paper airplanes follow you?",
      optionA: "Have bubbles follow you",
      optionB: "Have paper airplanes follow you",
      primaryCollection: "kids",
      primaryAgeBand: "4-6",
      ageBands: ["4-6"],
      relationships: ["friends"],
      scenarios: ["classroom", "general"],
      moods: ["weird", "imaginative"],
      difficulty: "hard",
      topics: ["fantasy"],
      safety: { kidsSafe: true, classroomSafe: true, familySafe: true },
      provenance: { batch: "kids-batch-001", candidateId: "kid-candidate-007" },
    },
    {
      id: "wyr-000088",
      number: 4,
      question:
        "Would you rather cook from a recipe together or invent dinner from ingredients you already have?",
      optionA: "Cook from a recipe together",
      optionB: "Invent dinner from what you already have",
      primaryCollection: "couples",
      primaryAgeBand: "adults",
      ageBands: ["adults"],
      relationships: ["couples"],
      scenarios: ["date-night", "dinner"],
      moods: ["imaginative", "light"],
      difficulty: "easy",
      topics: ["relationships", "food", "creativity"],
      safety: { kidsSafe: true, classroomSafe: true, familySafe: true },
    },
    {
      id: "wyr-000091",
      number: 5,
      question:
        "Would you rather meet a new group through a quick team game or through five minutes of paired conversation?",
      optionA: "Start with a quick team game",
      optionB: "Start with five minutes of paired conversation",
      primaryCollection: "icebreakers",
      primaryAgeBand: "adults",
      ageBands: ["teens", "adults"],
      relationships: ["coworkers", "friends"],
      scenarios: ["icebreakers", "classroom"],
      moods: ["light"],
      difficulty: "easy",
      topics: ["conversation", "games"],
      safety: { kidsSafe: true, classroomSafe: true, familySafe: true },
    },
    {
      id: "wyr-000096",
      number: 6,
      question:
        "Would you rather have a birthday photo booth with absurd props or a guest-made backdrop everyone helps decorate?",
      optionA: "Have a photo booth with absurd props",
      optionB: "Create a guest-decorated backdrop together",
      primaryCollection: "birthday-party",
      primaryAgeBand: "teens",
      ageBands: ["7-9", "10-12", "teens"],
      relationships: ["friends", "family"],
      scenarios: ["birthday-party", "party"],
      moods: ["funny", "light"],
      difficulty: "easy",
      topics: ["celebration", "creativity"],
      safety: { kidsSafe: true, classroomSafe: true, familySafe: true },
    },
    {
      id: "wyr-000099",
      number: 7,
      question:
        "Would you rather spend the last hour before bed telling funny stories or solving a group mystery puzzle?",
      optionA: "Tell funny stories before sleep",
      optionB: "Solve a group mystery puzzle together",
      primaryCollection: "sleepover",
      primaryAgeBand: "teens",
      ageBands: ["teens", "10-12"],
      relationships: ["friends"],
      scenarios: ["sleepover"],
      moods: ["funny", "light"],
      difficulty: "easy",
      topics: ["friendship", "games", "conversation"],
      safety: { kidsSafe: true, classroomSafe: true, familySafe: true },
    },
    {
      id: "wyr-000107",
      number: 8,
      question:
        "Would you rather cook one family meal together or pack a picnic that everyone helps choose?",
      optionA: "Cook one family meal together",
      optionB: "Pack a picnic everyone helps choose",
      primaryCollection: "family",
      primaryAgeBand: "adults",
      ageBands: ["4-6", "7-9", "10-12", "teens", "adults"],
      relationships: ["family"],
      scenarios: ["dinner", "road-trip"],
      moods: ["light"],
      difficulty: "easy",
      topics: ["family", "food"],
      safety: { kidsSafe: true, classroomSafe: true, familySafe: true },
    },
  ],

  // 4. 正式真实 Account 数据架构 (完全遵循 platform/auth 与 platform/credits)
  // 杜绝伪造的 "投票胜率"、"多数派吻合率" 等假数据
  accountData: {
    user: {
      name: "Alex Morgan",
      email: "alex.morgan@wyrplay.com",
      avatarInitials: "AM",
      role: "Verified Account",
      joinedAt: "2025-10-14",
    },
    // 真实 Credits 5 大状态与流水 (src/app/(account)/account/credits/page.tsx)
    credits: {
      creditType: "dilemma_credits",
      balances: {
        available: 150,
        reserved: 0,
        consumed: 50,
        expired: 0,
        revoked: 0,
      },
      recentLedger: [
        {
          id: "cld-001",
          creditType: "dilemma_credits",
          entryType: "grant",
          quantity: "+100",
          createdAt: "2026-09-28 10:24 UTC",
        },
        {
          id: "cld-002",
          creditType: "dilemma_credits",
          entryType: "consumption",
          quantity: "-50",
          createdAt: "2026-09-29 14:15 UTC",
        },
        {
          id: "cld-003",
          creditType: "dilemma_credits",
          entryType: "grant",
          quantity: "+100",
          createdAt: "2026-09-30 08:00 UTC",
        },
      ],
    },
    // 真实 Billing 与订阅状态 (src/app/(account)/account/billing/page.tsx)
    billing: {
      hasActiveSubscription: true,
      subscription: {
        productName: "wyrplay Pro Player",
        billingInterval: "monthly",
        status: "active",
        currentPeriodEnd: "2026-10-28",
        price: "$8.00 / month",
      },
      orders: [
        {
          id: "ord-8921",
          status: "fulfilled",
          amount: "$8.00",
          currency: "USD",
          createdAt: "2026-09-28",
          product: "wyrplay Pro Player (Monthly)",
        },
        {
          id: "ord-7104",
          status: "fulfilled",
          amount: "$8.00",
          currency: "USD",
          createdAt: "2026-08-28",
          product: "wyrplay Pro Player (Monthly)",
        },
      ],
    },
    // 真实 Security 活跃会话与安全注销 (src/app/(account)/account/security/page.tsx)
    security: {
      sessions: [
        {
          id: "sess-01",
          isCurrent: true,
          userAgent: "macOS 15.2 · Chrome 132.0 (Desktop)",
          lastActive: "Active now (Current Session)",
        },
        {
          id: "sess-02",
          isCurrent: false,
          userAgent: "iOS 18.1 · Mobile Safari (iPhone)",
          lastActive: "2 days ago · London, UK",
        },
      ],
      accountDeletionPolicy:
        "7-day grace period with scheduled durable deletion job. Account can be recovered before grace period ends.",
    },
  },

  // 5. 真实法律与公共政策文档 (src/app/(legal)/)
  legalDocuments: [
    {
      id: "privacy",
      title: "Privacy Notice",
      version: "2026.1",
      effectiveDate: "September 29, 2026",
      reviewStatus: "reviewed",
      summary: "How wyrplay processes voter identifiers, cookies, and account credentials.",
      sections: [
        {
          heading: "1. Information We Collect",
          body: "We collect minimal information necessary to deliver questions: session cookies (wyr_vid) to prevent duplicate local submissions, and account email for Magic Link authentication.",
        },
        {
          heading: "2. Zero Tracking Policy",
          body: "We do not sell personal data, profile player behavior across external sites, or inject third-party ad surveillance networks.",
        },
        {
          heading: "3. Account & Data Deletion",
          body: "Users may request account deletion at any time under /account/security. Deletion executes via a durable job after a 7-day grace period.",
        },
      ],
    },
    {
      id: "terms",
      title: "Terms of Service",
      version: "2026.1",
      effectiveDate: "September 29, 2026",
      reviewStatus: "reviewed",
      summary:
        "Terms governing online play, classroom projection, and account access on wyrplay.com.",
      sections: [
        {
          heading: "1. Acceptable Educational & Social Use",
          body: "wyrplay is free for classrooms, personal parties, road trips, and social game nights. Presenter Mode may be displayed on projectors and monitors.",
        },
        {
          heading: "2. Content Standards",
          body: "Curated questions remain project-owned editorial works. Submissions must not contain hate speech, illegal acts, or harassment.",
        },
        {
          heading: "3. Service Availability",
          body: "The service is provided on an 'as is' basis. Scheduled maintenance is executed without interrupting cached question decks.",
        },
      ],
    },
  ],
};

// 扁平化导出所有 Primary Collections
window.WYR_DATA.collections = [
  ...(window.WYR_DATA.primaryEntrances?.byAge || []),
  ...(window.WYR_DATA.primaryEntrances?.byRelationship || []),
  ...(window.WYR_DATA.primaryEntrances?.byScenario || []),
];

// 法律文档字典映射以支持按 ID 读取
window.WYR_DATA.legalDocsMap = {};
if (Array.isArray(window.WYR_DATA.legal)) {
  window.WYR_DATA.legal.forEach((doc) => {
    window.WYR_DATA.legalDocsMap[doc.id] = doc;
  });
}
