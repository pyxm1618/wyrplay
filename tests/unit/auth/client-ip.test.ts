import { describe, expect, it } from "vitest";

import { extractTrustedClientIp } from "@/platform/auth/client-ip";

describe("trusted client IP extraction", () => {
  it("accepts explicit test IP only in local and test modes", () => {
    const headers = new Headers({ "x-real-ip": "203.0.113.10" });
    expect(extractTrustedClientIp(headers, "test")).toBe("203.0.113.10");
    expect(extractTrustedClientIp(headers, "production")).toBe("unknown");
  });

  it("accepts the Cloudflare client IP in production", () => {
    const headers = new Headers({
      "cf-connecting-ip": "198.51.100.4",
    });
    expect(extractTrustedClientIp(headers, "production")).toBe("198.51.100.4");
  });

  it("rejects malformed or untrusted forwarded values", () => {
    expect(
      extractTrustedClientIp(
        new Headers({ "x-vercel-id": "fake", "x-forwarded-for": "198.51.100.4" }),
        "production",
      ),
    ).toBe("unknown");
    expect(
      extractTrustedClientIp(new Headers({ "x-forwarded-for": "198.51.100.4" }), "production"),
    ).toBe("unknown");
    expect(
      extractTrustedClientIp(
        new Headers({ "x-vercel-id": "sin1::abc", "x-forwarded-for": "not-an-ip" }),
        "production",
      ),
    ).toBe("unknown");
  });
});
