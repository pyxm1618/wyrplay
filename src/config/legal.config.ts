import type { LegalConfig } from "@/platform/legal/types";

export const legalConfig = {
  releaseStatus: "draft",
  operator: {
    legalName: "Would You Rather Questions (wyrplay.com)",
    jurisdiction: "United States",
    supportEmail: "support@wyrplay.com",
  },
  minimumAge: 13,
  dataCategories: [
    "anonymous gameplay interaction state",
    "technical error and performance diagnostics",
  ],
  authMethods: ["email magic link"],
  processors: [
    {
      name: "Resend",
      purpose: "Transactional notifications and communications",
      privacyUrl: "https://resend.com/legal/privacy-policy",
    },
  ],
  paymentModel: "none",
  oneTimePurchases: false,
  subscriptions: false,
  credits: false,
  refundPolicy: {
    summary:
      "Would You Rather Questions is a completely free entertainment and educational website. No digital goods or subscriptions are sold.",
    cancellationSummary:
      "There are no subscriptions or recurring charges to cancel.",
  },
  subscriptionTerms: null,
  retentionRules: [
    {
      category: "diagnostic records",
      period: "30 days",
      basis: "site performance and security monitoring",
    },
  ],
  accountDeletion: {
    enabled: false,
    summary:
      "No account creation or registration is offered; no persistent user profile data is collected.",
  },
  internationalTransfers:
    "Application hosting infrastructure is provided in secure global cloud regions.",
  documents: {
    privacy: { version: "draft-1", effectiveDate: "2026-09-29", reviewStatus: "draft" },
    terms: { version: "draft-1", effectiveDate: "2026-09-29", reviewStatus: "draft" },
    acceptable_use: { version: "draft-1", effectiveDate: "2026-09-29", reviewStatus: "draft" },
    refund_policy: { version: "draft-1", effectiveDate: "2026-09-29", reviewStatus: "draft" },
    account_deletion: { version: "draft-1", effectiveDate: "2026-09-29", reviewStatus: "draft" },
  },
  content: {
    privacy: [
      {
        heading: "Scope and Privacy Commitment",
        paragraphs: [
          "Would You Rather Questions is committed to protecting your privacy. We do not require registration, login credentials, or personal identification to play or browse dilemmas.",
        ],
      },
      {
        heading: "Cookies and Local Storage",
        paragraphs: [
          "We use local storage strictly to remember your preferred visual theme (dark or light mode). No personal identifying cookies are tracked.",
        ],
      },
    ],
    terms: [
      {
        heading: "Terms of Use",
        paragraphs: [
          "By accessing and using Would You Rather Questions, you agree to enjoy the dilemmas for personal, educational, and social entertainment purposes.",
        ],
      },
      {
        heading: "Intellectual Property",
        paragraphs: [
          "The question curation, categorization, and presentation formats are owned by Would You Rather Questions.",
        ],
      },
    ],
    acceptable_use: [
      {
        heading: "Acceptable Conduct",
        paragraphs: [
          "You agree not to disrupt, overload, or attempt unauthorized access to the website or its infrastructure.",
        ],
      },
    ],
    refund_policy: [
      {
        heading: "Free Service",
        paragraphs: [
          "All questions and modes on this website are 100% free to access. There are no paid tiers or transactions.",
        ],
      },
    ],
    account_deletion: [
      {
        heading: "No Account System",
        paragraphs: [
          "Because this platform operates without accounts or user profiles, there is no account data stored or requiring deletion.",
        ],
      },
    ],
  },
} as const satisfies LegalConfig;
