import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ConsentModePurposeStatusEnum,
  getConsentSnapshot,
  getServerConsentSnapshot,
  initConsentAdapter,
  mockGoogleConsentModeForTesting,
  resetConsentForTesting,
  showPrivacySettings,
  subscribeConsent,
} from "@/platform/consent/consent-adapter";

describe("consent adapter with Google Privacy & messaging API", () => {
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
      location: {
        origin: "http://localhost:3000",
        href: "http://localhost:3000/",
        assign: vi.fn(),
      },
      history: {
        replaceState: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    resetConsentForTesting();
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it("fails closed by default when googlefc is absent or not configured", () => {
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

  it("correctly maps official Google Consent Mode values using purpose enums", () => {
    // 1. All GRANTED (Enum = 1)
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("granted");

    // 2. Only Analytics GRANTED, Ads DENIED (Enum = 2)
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("denied");

    // 3. AdStorage GRANTED but adUserData DENIED -> Advertising must be denied
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(getConsentSnapshot().advertising).toBe("denied");

    // 4. AdStorage GRANTED but adPersonalization DENIED -> Advertising must be denied
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
    });
    expect(getConsentSnapshot().advertising).toBe("denied");

    // 5. All DENIED (Enum = 2)
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
    });
    expect(getConsentSnapshot().analytics).toBe("denied");
    expect(getConsentSnapshot().advertising).toBe("denied");

    // 6. NOT_CONFIGURED (Enum = 4) -> Fail closed
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
    });
    expect(getConsentSnapshot().analytics).toBe("denied");
    expect(getConsentSnapshot().advertising).toBe("denied");

    // 7. UNKNOWN (Enum = 0) -> Fail closed
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.UNKNOWN,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.UNKNOWN,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.UNKNOWN,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.UNKNOWN,
    });
    expect(getConsentSnapshot().analytics).toBe("denied");
    expect(getConsentSnapshot().advertising).toBe("denied");
  });

  it("notifies subscribers when googlefc consent mode changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
    });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("denied");

    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(listener).toHaveBeenCalledTimes(2);
    expect(getConsentSnapshot().advertising).toBe("granted");

    unsubscribe();
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
    });
    expect(listener).toHaveBeenCalledTimes(2); // no further calls after unsubscribe
  });

  it("registers CONSENT_MODE_DATA_READY handler on googlefc.callbackQueue", () => {
    const queue: unknown[] = [];
    (globalThis.window as unknown as { googlefc?: { callbackQueue: unknown[] } }).googlefc = {
      callbackQueue: queue,
    };

    initConsentAdapter();
    expect(queue).toHaveLength(1);
    const item = queue[0] as { CONSENT_MODE_DATA_READY?: () => void };
    expect(typeof item.CONSENT_MODE_DATA_READY).toBe("function");
  });

  it("strictly uses googlefc.callbackQueue.push(googlefc.showRevocationMessage)", () => {
    const showRevocationMessage = () => {};
    const queue: unknown[] = [];
    (
      globalThis.window as unknown as {
        googlefc?: { showRevocationMessage: () => void; callbackQueue: unknown[] };
      }
    ).googlefc = {
      showRevocationMessage,
      callbackQueue: queue,
    };

    showPrivacySettings();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toBe(showRevocationMessage);
  });

  it("navigates to CMP host route when googlefc runtime is not present on current page", () => {
    const assign = vi.fn();
    (
      globalThis.window as unknown as {
        location: { origin: string; href: string; assign: (url: string) => void };
        googlefc?: unknown;
      }
    ).location = {
      origin: "http://localhost:3000",
      href: "http://localhost:3000/questions",
      assign,
    };

    showPrivacySettings();
    expect(assign).toHaveBeenCalledWith("http://localhost:3000/?open-privacy-settings=1");
  });
});
