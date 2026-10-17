import { describe, expect, it } from "vitest";

import { legalConfig } from "@/config/legal.config";
import { isAdSenseRoute } from "@/platform/advertising/adsense-routes";
import { buildContentSecurityPolicy } from "@/platform/security/content-security-policy";

const enabled = ["/", "/would-you-rather-questions-for-kids"];
const excluded = [
  "/questions",
  "/funny-would-you-rather-questions",
  "/hard-would-you-rather-questions",
  "/would-you-rather-questions-for-friends",
  "/would-you-rather-questions-for-couples",
  "/privacy",
  "/terms",
  "/acceptable-use",
  "/refund-policy",
  "/account-deletion",
  "/contact",
  "/sign-in",
  "/sign-up",
  "/account",
  "/account/settings",
  "/auth/callback",
  "/checkout/return",
  "/play",
  "/print",
  "/find-questions",
  "/api/health/live",
  "/_next/test",
  "/missing",
  "/en",
  "/zh/questions",
  "/questions/child",
  "/questions/",
];

describe("AdSense activation boundary", () => {
  it.each(enabled)("enables exactly %s", (route) => expect(isAdSenseRoute(route)).toBe(true));
  it.each(excluded)("excludes %s", (route) => expect(isAdSenseRoute(route)).toBe(false));

  it("uses nonce-based strict CSP only for the opt-in policy", () => {
    const baseline = {
      development: false,
      production: true,
      nonce: "test",
      analytics: { ga4: false, clarity: false },
      turnstile: false,
    };
    const original = buildContentSecurityPolicy(baseline);
    expect(buildContentSecurityPolicy({ ...baseline, adsense: false })).toBe(original);

    const advertising = buildContentSecurityPolicy({ ...baseline, adsense: true });
    expect(advertising).toContain(
      "script-src 'self' 'nonce-test' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:",
    );
    expect(advertising).toContain("connect-src 'self' https:");
    expect(advertising).toContain("frame-src 'self' https:");
    expect(advertising).toContain("base-uri 'none'");
    expect(advertising).not.toMatch(
      /googlesyndication|doubleclick|adtrafficquality|fundingchoicesmessages/,
    );
    expect(advertising).not.toContain("*");
    expect(original).not.toMatch(
      /strict-dynamic|googlesyndication|doubleclick|adtrafficquality|fundingchoicesmessages/,
    );
  });

  it("rejects AdSense CSP without a per-request nonce", () => {
    expect(() =>
      buildContentSecurityPolicy({
        development: false,
        production: true,
        hashes: ["static-hash"],
        analytics: { ga4: false, clarity: false },
        turnstile: false,
        adsense: true,
      }),
    ).toThrow("AdSense strict CSP requires a nonce");
  });

  it("keeps AdSense and Kids disclosures without obsolete activation claims", () => {
    const privacy = JSON.stringify(legalConfig.content.privacy);
    expect(privacy).not.toMatch(
      /preparing to use Google AdSense|AdSense ad serving is not currently|no advertisements are currently/,
    );
    for (const disclosure of [
      "Google AdSense",
      "cookies",
      "web beacons",
      "IP addresses",
      "https://adssettings.google.com",
      "https://policies.google.com/technologies/partner-sites",
      "Children's Privacy",
      "does not use Kids voting data for behavioral advertising or profiling",
      "The Kids collection may serve Google AdSense advertising subject to child-directed age treatment",
      "personalized advertising and remarketing are not used for Kids",
    ])
      expect(privacy).toContain(disclosure);
  });
});
