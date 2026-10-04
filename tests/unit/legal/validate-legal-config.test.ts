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

it("permits reviewed configuration outside production release mode", () => {
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

it("accepts reviewed production legal configuration in production release mode", () => {
  expect(
    validateLegalConfig({
      legal: legalConfig,
      features: {
        oneTime: legalConfig.oneTimePurchases,
        subscriptions: legalConfig.subscriptions,
        credits: legalConfig.credits,
      },
      releaseMode: true,
    }),
  ).toBeTruthy();
});

it("rejects draft releaseStatus in production release mode", () => {
  expect(() =>
    validateLegalConfig({
      legal: { ...legalConfig, releaseStatus: "draft" as const },
      features: {
        oneTime: legalConfig.oneTimePurchases,
        subscriptions: legalConfig.subscriptions,
        credits: legalConfig.credits,
      },
      releaseMode: true,
    }),
  ).toThrow("legal config is not reviewed");
});

it("rejects placeholder operator facts in production release mode", () => {
  expect(() =>
    validateLegalConfig({
      legal: {
        ...legalConfig,
        operator: { ...legalConfig.operator, legalName: "Change Me Operator" },
      },
      features: {
        oneTime: legalConfig.oneTimePurchases,
        subscriptions: legalConfig.subscriptions,
        credits: legalConfig.credits,
      },
      releaseMode: true,
    }),
  ).toThrow("legal config contains placeholder operator facts");
});

it("rejects draft documents in production release mode", () => {
  expect(() =>
    validateLegalConfig({
      legal: {
        ...legalConfig,
        documents: {
          ...legalConfig.documents,
          privacy: { ...legalConfig.documents.privacy, reviewStatus: "draft" as const },
        },
      },
      features: {
        oneTime: legalConfig.oneTimePurchases,
        subscriptions: legalConfig.subscriptions,
        credits: legalConfig.credits,
      },
      releaseMode: true,
    }),
  ).toThrow("legal document is not reviewed");
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
