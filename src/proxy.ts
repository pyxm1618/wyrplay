import { NextRequest, NextResponse } from "next/server";

import { featuresConfig } from "@/config/features.config";
import { buildContentSecurityPolicy } from "@/platform/security/content-security-policy";
import { STATIC_INLINE_HASHES } from "@/platform/security/static-inline-hashes";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.APP_ENV === "production";

function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

const dynamicPathPatterns = [
  /^\/$/,
  /^\/leaderboards(?:\/.*)?$/,
  /^\/account(?:\/.*)?$/,
  /^\/sign-in(?:\/.*)?$/,
  /^\/sign-up(?:\/.*)?$/,
  /^\/auth(?:\/.*)?$/,
  /^\/checkout(?:\/.*)?$/,
  /^\/api(?:\/.*)?$/,
];

function isDynamicRoute(pathname: string): boolean {
  if (isDevelopment) return true;
  return dynamicPathPatterns.some((pattern) => pattern.test(pathname));
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDynamic = isDynamicRoute(pathname);
  const nonce = isDynamic ? createNonce() : undefined;
  const hashes = !isDynamic ? STATIC_INLINE_HASHES : undefined;

  const contentSecurityPolicy = buildContentSecurityPolicy({
    nonce,
    hashes,
    development: isDevelopment,
    production: isProduction,
    analytics: {
      ga4: featuresConfig.analytics.enabled && featuresConfig.analytics.ga4,
      clarity: featuresConfig.analytics.enabled && featuresConfig.analytics.clarity,
    },
    turnstile: isDynamic && featuresConfig.auth.enabled && featuresConfig.auth.magicLink,
  });

  const requestHeaders = new Headers(request.headers);
  if (nonce) {
    requestHeaders.set("x-nonce", nonce);
  } else {
    requestHeaders.delete("x-nonce");
  }
  requestHeaders.set("content-security-policy", contentSecurityPolicy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon\\.ico|favicon-.*\\.png|apple-touch-icon\\.png|android-chrome-.*\\.png|brand/|og/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
