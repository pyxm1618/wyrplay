import { expect, it } from "vitest";

import { legalConfig } from "@/config/legal.config";
import { validateLegalConfig } from "@/platform/legal/validate-legal-config";

it("requires disclosures for enabled providers", () => {
  expect(() =>
    validateLegalConfig({
      legal: { ...legalConfig, processors: [] },
      features: { google: true },
    }),
  ).toThrow("missing processor disclosure: Google");
});

it("rejects subscription products without cancellation terms", () => {
  expect(() =>
    validateLegalConfig({
      legal: { ...legalConfig, paymentModel: "mor", subscriptions: true, subscriptionTerms: null },
      features: { subscriptions: true },
    }),
  ).toThrow("subscription cancellation terms are required");
});

it("permits draft sample facts outside production release mode", () => {
  expect(
    validateLegalConfig({
      legal: legalConfig,
      features: {
        resend: true,
        subscriptions: legalConfig.subscriptions,
        credits: legalConfig.credits,
      },
    }),
  ).toBeTruthy();
});

it("rejects draft and placeholder facts in production release mode", () => {
  expect(() =>
    validateLegalConfig({
      legal: legalConfig,
      features: {
        resend: true,
        subscriptions: legalConfig.subscriptions,
        credits: legalConfig.credits,
      },
      releaseMode: true,
    }),
  ).toThrow(/not reviewed|placeholder/i);
});

it("rejects the WYRPlay brand name as a reviewed production legal operator", () => {
  const reviewedDocuments = {
    privacy: { ...legalConfig.documents.privacy, reviewStatus: "reviewed" as const },
    terms: { ...legalConfig.documents.terms, reviewStatus: "reviewed" as const },
    acceptable_use: {
      ...legalConfig.documents.acceptable_use,
      reviewStatus: "reviewed" as const,
    },
    refund_policy: {
      ...legalConfig.documents.refund_policy,
      reviewStatus: "reviewed" as const,
    },
    account_deletion: {
      ...legalConfig.documents.account_deletion,
      reviewStatus: "reviewed" as const,
    },
  };

  expect(() =>
    validateLegalConfig({
      legal: {
        ...legalConfig,
        releaseStatus: "reviewed" as const,
        documents: reviewedDocuments,
        operator: {
          ...legalConfig.operator,
          legalName: "WYRPlay",
        },
      },
      features: {
        oneTime: legalConfig.oneTimePurchases,
        subscriptions: legalConfig.subscriptions,
        credits: legalConfig.credits,
      },
      releaseMode: true,
    }),
  ).toThrow(/legal operator identity is unresolved/i);
});
