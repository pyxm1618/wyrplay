export type ConsentState = "granted" | "denied";

export type ConsentSnapshot = Readonly<{
  essential: "granted";
  analytics: ConsentState;
  advertising: ConsentState;
}>;

export type GoogleConsentModeValue =
  | "GRANTED"
  | "DENIED"
  | "NOT_APPLICABLE"
  | "NOT_CONFIGURED"
  | "UNKNOWN";

export type GoogleConsentModeValues = {
  ad_storage?: GoogleConsentModeValue;
  analytics_storage?: GoogleConsentModeValue;
  ad_user_data?: GoogleConsentModeValue;
  ad_personalization?: GoogleConsentModeValue;
  [key: string]: unknown;
};

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
      getGoogleConsentModeValues?: () => GoogleConsentModeValues | Record<string, unknown>;
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

function mapConsentValue(value: unknown): ConsentState {
  // Fail-closed: only explicit GRANTED confers consent
  return value === "GRANTED" ? "granted" : "denied";
}

function readGoogleConsentMode(): void {
  if (typeof window === "undefined" || !window.googlefc) return;
  if (typeof window.googlefc.getGoogleConsentModeValues !== "function") return;

  try {
    const values = window.googlefc.getGoogleConsentModeValues() as
      | GoogleConsentModeValues
      | undefined;
    if (!values || typeof values !== "object") return;

    const nextAnalytics = mapConsentValue(values.analytics_storage);
    const nextAdvertising = mapConsentValue(values.ad_storage);

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
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

  // Official Google Privacy & messaging API: CONSENT_MODE_DATA_READY callback
  window.googlefc.callbackQueue.push({
    CONSENT_MODE_DATA_READY: () => {
      readGoogleConsentMode();
    },
  });

  // If googlefc.getGoogleConsentModeValues is already available at attach time, read immediately
  if (typeof window.googlefc.getGoogleConsentModeValues === "function") {
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
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  cleanLegacyStorage();
  attachGoogleFcListener();
  handleAutoReopenParam();
}

export function getConsentSnapshot(): ConsentSnapshot {
  if (!initialized && typeof window !== "undefined") {
    initConsentAdapter();
  }
  return currentConsent;
}

export function getServerConsentSnapshot(): ConsentSnapshot {
  return DEFAULT_CONSENT;
}

export function subscribeConsent(listener: () => void): () => void {
  if (!initialized && typeof window !== "undefined") {
    initConsentAdapter();
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reopen Google CMP privacy message.
 * Strictly uses official Google mechanism: googlefc.callbackQueue.push(googlefc.showRevocationMessage).
 * If on a route without Google CMP runtime, navigates to the CMP host route to ensure site-wide accessibility.
 */
export function showPrivacySettings(): void {
  if (typeof window === "undefined") return;

  if (window.googlefc && typeof window.googlefc.showRevocationMessage === "function") {
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push(window.googlefc.showRevocationMessage);
    return;
  }

  // If already on the CMP host route (/), queue on callbackQueue so it triggers when CMP loads
  if (window.location.pathname === "/") {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push(() => {
      if (typeof window.googlefc?.showRevocationMessage === "function") {
        window.googlefc.callbackQueue?.push(window.googlefc.showRevocationMessage);
      }
    });
    return;
  }

  // If on another route, navigate to the CMP host route (/)
  const targetUrl = new URL("/", window.location.origin);
  targetUrl.searchParams.set("open-privacy-settings", "1");
  window.location.assign(targetUrl.toString());
}

// Helper for testing to simulate official googlefc consent mode values and trigger update
export function mockGoogleConsentModeForTesting(values: GoogleConsentModeValues): void {
  if (typeof window === "undefined") return;
  window.googlefc = window.googlefc || {};
  window.googlefc.getGoogleConsentModeValues = () => values;
  readGoogleConsentMode();
}

// Reset state for tests
export function resetConsentForTesting(): void {
  initialized = false;
  currentConsent = DEFAULT_CONSENT;
  notifyListeners();
}

if (typeof window !== "undefined") {
  initConsentAdapter();
}
