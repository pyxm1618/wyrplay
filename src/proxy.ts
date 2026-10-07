import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

import { featuresConfig } from "@/config/features.config";
import { buildContentSecurityPolicy } from "@/platform/security/content-security-policy";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.APP_ENV === "production";

function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

const sensitivePathPatterns = [
  /^\/account(?:\/.*)?$/,
  /^\/sign-in(?:\/.*)?$/,
  /^\/sign-up(?:\/.*)?$/,
  /^\/auth(?:\/.*)?$/,
  /^\/checkout(?:\/.*)?$/,
  /^\/api(?:\/.*)?$/,
];

function isSensitiveRoute(pathname: string): boolean {
  return sensitivePathPatterns.some((pattern) => pattern.test(pathname));
}

let cachedHashes: string[] | null = null;

function getStaticInlineHashes(): string[] {
  if (cachedHashes) return cachedHashes;
  try {
    const filePath = path.resolve(process.cwd(), ".next/static-inline-hashes.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(raw);
      if (Array.isArray(data.all)) {
        cachedHashes = data.all;
        return cachedHashes!;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isSensitive = isSensitiveRoute(pathname);
  const nonce = isSensitive ? createNonce() : undefined;
  const hashes = !isSensitive ? getStaticInlineHashes() : undefined;

  const contentSecurityPolicy = buildContentSecurityPolicy({
    nonce,
    hashes,
    development: isDevelopment,
    production: isProduction,
    analytics: {
      ga4: featuresConfig.analytics.enabled && featuresConfig.analytics.ga4,
      clarity: featuresConfig.analytics.enabled && featuresConfig.analytics.clarity,
    },
    turnstile: isSensitive && featuresConfig.auth.enabled && featuresConfig.auth.magicLink,
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
