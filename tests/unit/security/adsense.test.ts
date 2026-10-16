import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { isAdSenseRoute } from "@/platform/advertising/adsense-routes";
import { buildContentSecurityPolicy } from "@/platform/security/content-security-policy";
import { legalConfig } from "@/config/legal.config";
import { proxy } from "@/proxy";

const enabled = [
  "/",
  "/questions",
  "/funny-would-you-rather-questions",
  "/hard-would-you-rather-questions",
  "/would-you-rather-questions-for-friends",
  "/would-you-rather-questions-for-couples",
];
const excluded = [
  "/would-you-rather-questions-for-kids",
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

  it("adds script trust only to the opt-in policy", () => {
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
    expect(advertising).toContain("https://pagead2.googlesyndication.com");
    expect(advertising.match(/script-src ([^;]+)/)?.[1]).not.toMatch(
      /unsafe-inline|unsafe-eval|\*/,
    );
    expect(original).not.toMatch(
      /strict-dynamic|googlesyndication|doubleclick|adtrafficquality|fundingchoicesmessages/,
    );
  });

  it.each([...enabled, ...excluded])("scopes the response CSP for %s", (route) => {
    const csp = proxy(new NextRequest(`https://www.wyrplay.com${route}`)).headers.get(
      "content-security-policy",
    );
    expect(csp?.includes("https://pagead2.googlesyndication.com")).toBe(enabled.includes(route));
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
      "does not load or serve Google AdSense advertising",
    ])
      expect(privacy).toContain(disclosure);
  });
});
