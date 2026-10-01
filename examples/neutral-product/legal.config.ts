import type { LegalConfig } from "@/platform/legal/types";

const draftDocument = {
  version: "draft-1",
  effectiveDate: "2026-08-09",
  reviewStatus: "draft",
} as const;

export const legalConfig = {
  releaseStatus: "draft",
  operator: {
    legalName: "Test Only Focus Utility Operator — replace before launch",
    jurisdiction: "Test jurisdiction — replace before launch",
    supportEmail: "test-only-support@example.com",
  },
  minimumAge: 18,
  dataCategories: [
    "account identifiers",
    "authentication records",
    "test transaction and entitlement records",
    "security and abuse-prevention events",
  ],
  authMethods: [],
  processors: [],
  paymentModel: "none",
  oneTimePurchases: false,
  subscriptions: false,
  credits: false,
  refundPolicy: {
    summary:
      "Synthetic test-only refund language. Replace with reviewed product terms before launch.",
    cancellationSummary:
      "Synthetic test-only subscription cancellation language. Replace before launch.",
  },
  subscriptionTerms: null,
  retentionRules: [
    {
      category: "test authentication records",
      period: "test-only project policy",
      basis: "starter verification",
    },
    {
      category: "test financial records",
      period: "test-only project policy",
      basis: "starter verification",
    },
  ],
  accountDeletion: {
    enabled: false,
    summary: "Test-only account deletion workflow used to validate the starter lifecycle.",
  },
  internationalTransfers:
    "Test-only placeholder. Replace with reviewed deployment facts before launch.",
  documents: {
    privacy: draftDocument,
    terms: draftDocument,
    acceptable_use: draftDocument,
    refund_policy: draftDocument,
    account_deletion: draftDocument,
  },
  content: {
    privacy: [
      {
        heading: "Test-only privacy notice",
        paragraphs: [
          "Synthetic content for starter verification. Replace and review before launch.",
        ],
      },
    ],
    terms: [
      {
        heading: "Test-only terms",
        paragraphs: ["Synthetic terms for starter verification. Replace and review before launch."],
      },
    ],
    acceptable_use: [
      {
        heading: "Test-only acceptable use",
        paragraphs: ["Do not abuse authentication, payment, security or account systems."],
      },
    ],
    refund_policy: [
      {
        heading: "Test-only refunds",
        paragraphs: ["Synthetic refund content for starter verification only."],
      },
    ],
    account_deletion: [
      {
        heading: "Test-only deletion",
        paragraphs: ["Use Account Security to exercise the synthetic deletion workflow."],
      },
    ],
  },
} as const satisfies LegalConfig;
