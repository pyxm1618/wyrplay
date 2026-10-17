import { afterEach, describe, expect, it, vi } from "vitest";

describe("featuresConfig production profile selection", () => {
  const originalAppEnv = process.env.APP_ENV;

  afterEach(() => {
    process.env.APP_ENV = originalAppEnv;
    vi.resetModules();
  });

  it("selects production features profile when APP_ENV is production", async () => {
    process.env.APP_ENV = "production";
    vi.resetModules();
    const { featuresConfig } = await import("@/config/features.config");

    expect(featuresConfig.analytics).toEqual({
      enabled: true,
      ga4: true,
      clarity: false,
      consentRequired: true,
    });

    expect(featuresConfig.auth).toEqual({
      enabled: false,
      google: false,
      magicLink: false,
      password: false,
    });
    expect(featuresConfig.email).toEqual({ enabled: false });
    expect(featuresConfig.commerce).toEqual({
      enabled: false,
      oneTime: false,
      subscriptions: false,
      credits: false,
    });
  });
});
