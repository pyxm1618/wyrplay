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
  const reviewedDocuments = Object.fromEntries(
    Object.entries(legalConfig.documents).map(([key, value]) => [
      key,
      { ...value, reviewStatus: "reviewed" as const },
    ]),
  ) as typeof legalConfig.documents;

  expect(() =>
    validateLegalConfig({
      legal: {
        ...legalConfig,
        releaseStatus: "reviewed",
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
