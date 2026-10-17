import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  initConsentAdapter,
  resetConsentForTesting,
  setConsentForTesting,
  showPrivacySettings,
  subscribeConsent,
} from "@/platform/consent/consent-adapter";

describe("consent adapter", () => {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };

  beforeEach(() => {
    mockLocalStorage.clear();
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockLocalStorage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    resetConsentForTesting();
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it("fails closed by default", () => {
    const consent = getConsentSnapshot();
    expect(consent).toEqual({
      essential: "granted",
      analytics: "denied",
      advertising: "denied",
    });
  });

  it("returns default consent for server snapshot", () => {
    expect(getServerConsentSnapshot()).toEqual({
      essential: "granted",
      analytics: "denied",
      advertising: "denied",
    });
  });

  it("cleans legacy consent key and does not authorize from it", () => {
    mockLocalStorage.setItem("creat-web:analytics-consent:v1", "granted");
    initConsentAdapter();
    expect(mockLocalStorage.getItem("creat-web:analytics-consent:v1")).toBeNull();
    expect(getConsentSnapshot().analytics).toBe("denied");
  });

  it("notifies subscribers when consent signals update", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    setConsentForTesting({ analytics: "granted" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("denied");

    setConsentForTesting({ advertising: "granted" });
    expect(listener).toHaveBeenCalledTimes(2);
    expect(getConsentSnapshot().advertising).toBe("granted");

    unsubscribe();
    setConsentForTesting({ analytics: "denied" });
    expect(listener).toHaveBeenCalledTimes(2); // no further calls
  });

  it("handles showPrivacySettings invoking googlefc if available", () => {
    const showRevocationMessage = vi.fn();
    (
      globalThis.window as unknown as {
        googlefc?: { showRevocationMessage: () => void };
      }
    ).googlefc = {
      showRevocationMessage,
    };

    showPrivacySettings();
    expect(showRevocationMessage).toHaveBeenCalledTimes(1);
  });

  it("queues revocation message if googlefc.callbackQueue is present", () => {
    const queue: unknown[] = [];
    (
      globalThis.window as unknown as {
        googlefc?: { callbackQueue: unknown[] };
      }
    ).googlefc = {
      callbackQueue: queue,
    };

    showPrivacySettings();
    expect(queue).toHaveLength(1);
  });
});
