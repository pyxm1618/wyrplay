import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ConsentModePurposeStatusEnum,
  getConsentSnapshot,
  isConsentResolved,
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

  it("distinguishes an unresolved snapshot from a real CMP denial", () => {
    expect(isConsentResolved()).toBe(false);
    const listener = vi.fn();
    subscribeConsent(listener);
    mockGoogleConsentModeForTesting({ analyticsStoragePurposeConsentStatus: 2 });
    expect(isConsentResolved()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getConsentSnapshot().analytics).toBe("denied");
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
    // 1. All GRANTED (Enum = 1) -> allow
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("granted");

    // 2. All NOT_APPLICABLE (Enum = 3) -> allow
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_APPLICABLE,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_APPLICABLE,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_APPLICABLE,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_APPLICABLE,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("granted");

    // 3. Relevant NOT_CONFIGURED (Enum = 4) -> allow
    // Case 3a: all NOT_CONFIGURED -> allow
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("granted");

    // Case 3b: Analytics NOT_CONFIGURED with Ads GRANTED -> allow both
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("granted");

    // Case 3c: Ads NOT_CONFIGURED with Analytics GRANTED -> allow both
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.NOT_CONFIGURED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("granted");

    // 4. Any DENIED (Enum = 2) -> deny
    // Case 4a: Analytics DENIED with Ads GRANTED
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(getConsentSnapshot().analytics).toBe("denied");
    expect(getConsentSnapshot().advertising).toBe("granted");

    // Case 4b: adStorage DENIED with others GRANTED
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("denied");

    // Case 4c: adUserData DENIED with others GRANTED
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("denied");

    // Case 4d: adPersonalization DENIED with others GRANTED
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("denied");

    // Case 4e: all DENIED
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.DENIED,
    });
    expect(getConsentSnapshot().analytics).toBe("denied");
    expect(getConsentSnapshot().advertising).toBe("denied");

    // 5. Any UNKNOWN (Enum = 0) -> deny / fail-closed
    // Case 5a: Analytics UNKNOWN with Ads GRANTED
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.UNKNOWN,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(getConsentSnapshot().analytics).toBe("denied");
    expect(getConsentSnapshot().advertising).toBe("granted");

    // Case 5b: adStorage UNKNOWN with others GRANTED
    mockGoogleConsentModeForTesting({
      analyticsStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adStoragePurposeConsentStatus: ConsentModePurposeStatusEnum.UNKNOWN,
      adUserDataPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
      adPersonalizationPurposeConsentStatus: ConsentModePurposeStatusEnum.GRANTED,
    });
    expect(getConsentSnapshot().analytics).toBe("granted");
    expect(getConsentSnapshot().advertising).toBe("denied");

    // Case 5c: all UNKNOWN -> fail-closed
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

  it("rereads Google consent values after a TCF consent change", () => {
    let analytics = 1;
    let onConsentChange: (() => void) | undefined;
    window.googlefc = {
      callbackQueue: [],
      getGoogleConsentModeValues: () => ({
        analyticsStoragePurposeConsentStatus: analytics,
        adStoragePurposeConsentStatus: 2,
        adUserDataPurposeConsentStatus: 2,
        adPersonalizationPurposeConsentStatus: 2,
      }),
    };
    window.__tcfapi = (_command, _version, callback) => {
      onConsentChange = () => callback({ eventStatus: "useractioncomplete" }, true);
    };
    initConsentAdapter();
    const queue = window.googlefc.callbackQueue as Array<{ CONSENT_MODE_DATA_READY?: () => void }>;
    queue[0]?.CONSENT_MODE_DATA_READY?.();
    expect(getConsentSnapshot().analytics).toBe("granted");
    analytics = 2;
    onConsentChange?.();
    expect(getConsentSnapshot().analytics).toBe("denied");
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
