export type ConsentState = "granted" | "denied";

export type ConsentSnapshot = Readonly<{
  essential: "granted";
  analytics: ConsentState;
  advertising: ConsentState;
}>;

export const ConsentModePurposeStatusEnum = {
  UNKNOWN: 0,
  GRANTED: 1,
  DENIED: 2,
  NOT_APPLICABLE: 3,
  NOT_CONFIGURED: 4,
} as const;

export type ConsentModePurposeStatus =
  (typeof ConsentModePurposeStatusEnum)[keyof typeof ConsentModePurposeStatusEnum];

export interface GoogleFcConsentModeUserStatus {
  adStoragePurposeConsentStatus: number;
  adUserDataPurposeConsentStatus: number;
  adPersonalizationPurposeConsentStatus: number;
  analyticsStoragePurposeConsentStatus: number;
  [key: string]: unknown;
}

const DEFAULT_CONSENT: ConsentSnapshot = {
  essential: "granted",
  analytics: "denied",
  advertising: "denied",
};

const LEGACY_STORAGE_KEY = "creat-web:analytics-consent:v1";

declare global {
  interface Window {
    googlefc?: {
      showRevocationMessage?: () => void;
      callbackQueue?: unknown[];
      getGoogleConsentModeValues?: () => GoogleFcConsentModeUserStatus | Record<string, unknown>;
      ConsentModePurposeStatusEnum?: typeof ConsentModePurposeStatusEnum;
      [key: string]: unknown;
    };
  }
}

let currentConsent: ConsentSnapshot = DEFAULT_CONSENT;
const listeners = new Set<() => void>();
let initialized = false;

function cleanLegacyStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Safe ignore for restricted storage contexts
  }
}

function notifyListeners(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Ignore subscriber errors
    }
  }
}

function isPurposePermitted(status: unknown): boolean {
  return (
    status === ConsentModePurposeStatusEnum.GRANTED ||
    status === ConsentModePurposeStatusEnum.NOT_APPLICABLE ||
    status === ConsentModePurposeStatusEnum.NOT_CONFIGURED
  );
}

function readGoogleConsentMode(): void {
  if (typeof window === "undefined" || !window.googlefc) return;
  if (typeof window.googlefc.getGoogleConsentModeValues !== "function") return;

  try {
    const status = window.googlefc.getGoogleConsentModeValues() as
      | GoogleFcConsentModeUserStatus
      | undefined;
    if (!status || typeof status !== "object") return;

    // Analytics gating: GRANTED, NOT_APPLICABLE, NOT_CONFIGURED permit analytics; DENIED, UNKNOWN block it
    const nextAnalytics: ConsentState = isPurposePermitted(
      status.analyticsStoragePurposeConsentStatus,
    )
      ? "granted"
      : "denied";

    // Advertising gating: all 3 Ads purposes must be permitted (GRANTED, NOT_APPLICABLE, or NOT_CONFIGURED);
    // any DENIED or UNKNOWN blocks advertising (paused).
    const adsPurposes = [
      status.adStoragePurposeConsentStatus,
      status.adUserDataPurposeConsentStatus,
      status.adPersonalizationPurposeConsentStatus,
    ];

    const nextAdvertising: ConsentState = adsPurposes.every(isPurposePermitted)
      ? "granted"
      : "denied";

    if (
      nextAnalytics === currentConsent.analytics &&
      nextAdvertising === currentConsent.advertising
    ) {
      return;
    }

    currentConsent = {
      essential: "granted",
      analytics: nextAnalytics,
      advertising: nextAdvertising,
    };

    notifyListeners();
  } catch {
    // In case of CMP runtime errors, maintain fail-closed
    if (currentConsent.analytics !== "denied" || currentConsent.advertising !== "denied") {
      currentConsent = DEFAULT_CONSENT;
      notifyListeners();
    }
  }
}

function attachGoogleFcListener(): void {
  if (typeof window === "undefined") return;

  window.googlefc = window.googlefc || {};

  let currentGetValues = window.googlefc.getGoogleConsentModeValues;
  try {
    Object.defineProperty(window.googlefc, "getGoogleConsentModeValues", {
      configurable: true,
      enumerable: true,
      get() {
        return currentGetValues;
      },
      set(fn) {
        currentGetValues = fn;
        readGoogleConsentMode();
      },
    });
  } catch {
    // If not configurable, proceed with callback queue
  }

  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

  // Official Google Privacy & messaging API: CONSENT_MODE_DATA_READY callback
  window.googlefc.callbackQueue.push({
    CONSENT_MODE_DATA_READY: () => {
      readGoogleConsentMode();
    },
  });

  // If googlefc.getGoogleConsentModeValues is already available at attach time, read immediately
  if (typeof currentGetValues === "function") {
    readGoogleConsentMode();
  }
}

function handleAutoReopenParam(): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("open-privacy-settings") === "1") {
      url.searchParams.delete("open-privacy-settings");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
      window.googlefc = window.googlefc || {};
      window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
      window.googlefc.callbackQueue.push(() => {
        if (typeof window.googlefc?.showRevocationMessage === "function") {
          window.googlefc.callbackQueue?.push(window.googlefc.showRevocationMessage);
        }
      });
    }
  } catch {
    // Ignore URL parse errors
  }
}

export function initConsentAdapter(): void {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  cleanLegacyStorage();
  attachGoogleFcListener();
  handleAutoReopenParam();
}

// Auto initialize in browser context
if (typeof window !== "undefined") {
  initConsentAdapter();
}

export function getConsentSnapshot(): ConsentSnapshot {
  return currentConsent;
}

export function getServerConsentSnapshot(): ConsentSnapshot {
  return DEFAULT_CONSENT;
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function showPrivacySettings(): void {
  if (typeof window === "undefined") return;

  // If Google CMP runtime is present on the current page, queue revocation message directly
  if (window.googlefc?.showRevocationMessage) {
    const queue = (window.googlefc.callbackQueue = window.googlefc.callbackQueue || []);
    queue.push(window.googlefc.showRevocationMessage);
    return;
  }

  // If CMP runtime is not loaded on this route (e.g. non-ad routes), safely navigate to CMP host route
  try {
    const target = new URL("/", window.location.origin);
    target.searchParams.set("open-privacy-settings", "1");
    window.location.assign(target.toString());
  } catch {
    // Fallback assignment
    window.location.href = "/?open-privacy-settings=1";
  }
}

export function resetConsentForTesting(): void {
  currentConsent = DEFAULT_CONSENT;
  listeners.clear();
  initialized = false;
}

export function mockGoogleConsentModeForTesting(
  values: Partial<GoogleFcConsentModeUserStatus>,
): void {
  if (typeof window === "undefined") return;
  window.googlefc = window.googlefc || {};
  window.googlefc.ConsentModePurposeStatusEnum = ConsentModePurposeStatusEnum;
  window.googlefc.getGoogleConsentModeValues = () => ({
    adStoragePurposeConsentStatus:
      values.adStoragePurposeConsentStatus ?? ConsentModePurposeStatusEnum.DENIED,
    adUserDataPurposeConsentStatus:
      values.adUserDataPurposeConsentStatus ?? ConsentModePurposeStatusEnum.DENIED,
    adPersonalizationPurposeConsentStatus:
      values.adPersonalizationPurposeConsentStatus ?? ConsentModePurposeStatusEnum.DENIED,
    analyticsStoragePurposeConsentStatus:
      values.analyticsStoragePurposeConsentStatus ?? ConsentModePurposeStatusEnum.DENIED,
    ...values,
  });
  readGoogleConsentMode();
}
