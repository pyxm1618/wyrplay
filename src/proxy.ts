import { NextRequest, NextResponse } from "next/server";

import { featuresConfig } from "@/config/features.config";
import { buildContentSecurityPolicy } from "@/platform/security/content-security-policy";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.APP_ENV === "production";

function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy({
    nonce,
    development: isDevelopment,
    production: isProduction,
    analytics: {
      ga4: featuresConfig.analytics.enabled && featuresConfig.analytics.ga4,
      clarity: featuresConfig.analytics.enabled && featuresConfig.analytics.clarity,
    },
    turnstile: featuresConfig.auth.enabled && featuresConfig.auth.magicLink,
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", contentSecurityPolicy);

  if (isProduction && request.nextUrl.pathname === "/test-bench") {
    const response = new NextResponse(null, { status: 404 });
    response.headers.set("content-security-policy", contentSecurityPolicy);
    return response;
  }

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
