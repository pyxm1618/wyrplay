export type NavigationItem = {
  readonly label: string;
  readonly href: string;
  readonly activeRoutes?: readonly string[];
};

export const navigationConfig = {
  header: {
    primary: [
      { label: "Home", href: "/", activeRoutes: ["/"] },
      {
        label: "Find Questions",
        href: "/find-questions",
        activeRoutes: [
          "/find-questions",
          "/questions",
          "/would-you-rather-questions-for-kids",
          "/funny-would-you-rather-questions",
          "/hard-would-you-rather-questions",
          "/would-you-rather-questions-for-friends",
          "/would-you-rather-questions-for-couples",
        ],
      },
      { label: "Print", href: "/print", activeRoutes: ["/print"] },
      { label: "Leaderboards", href: "/leaderboards", activeRoutes: ["/leaderboards"] },
    ] satisfies readonly NavigationItem[],
    primaryCta: { label: "Play Now", href: "/play" },
    auth: {
      loggedOut: [
        { label: "Log In", href: "/sign-in" },
        { label: "Sign Up", href: "/sign-up" },
      ],
      loggedIn: [{ label: "Account", href: "/account" }],
    },
  },
  footer: {
    explore: [
      { label: "Find Questions", href: "/find-questions" },
      { label: "Print", href: "/print" },
      { label: "Leaderboards", href: "/leaderboards" },
    ],
    questionCategories: [
      {
        label: "Kids Would You Rather Questions",
        href: "/would-you-rather-questions-for-kids",
      },
      {
        label: "Funny Would You Rather Questions",
        href: "/funny-would-you-rather-questions",
      },
      {
        label: "Hard Would You Rather Questions",
        href: "/hard-would-you-rather-questions",
      },
      {
        label: "Would You Rather Questions for Friends",
        href: "/would-you-rather-questions-for-friends",
      },
      {
        label: "Would You Rather Questions for Couples",
        href: "/would-you-rather-questions-for-couples",
      },
    ],
    allCategories: { label: "All Categories", href: "/questions" },
    support: [
      { label: "Contact", href: "/contact" },
      { label: "Kids & Families Privacy", href: "/privacy#childrens-privacy" },
    ],
    legal: [
      { label: "Privacy Notice", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Acceptable Use Policy", href: "/acceptable-use" },
      { label: "Refund & Cancellation Policy", href: "/refund-policy" },
      { label: "Account Deletion", href: "/account-deletion" },
    ],
  },
} as const;
