export type ConsentState = "granted" | "denied";

export type ConsentSnapshot = Readonly<{
  essential: "granted";
  analytics: ConsentState;
  advertising: ConsentState;
}>;

const DEFAULT_CONSENT: ConsentSnapshot = {
  essential: "granted",
  analytics: "denied",
  advertising: "denied",
};

const LEGACY_STORAGE_KEY = "creat-web:analytics-consent:v1";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    googlefc?: {
      showRevocationMessage?: () => void;
      callbackQueue?: unknown[];
      getConsentStatus?: () => unknown;
    };
    __tcfapi?: (
      command: string,
      version: number,
      callback: (tcData: unknown, success: boolean) => void,
      parameter?: unknown,
    ) => void;
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

function parseConsentUpdate(args: unknown[]): {
  analytics?: ConsentState | undefined;
  advertising?: ConsentState | undefined;
} | null {
  if (args.length < 3) return null;
  const [command, subcommand, params] = args;
  if (command !== "consent" || subcommand !== "update" || typeof params !== "object" || !params) {
    return null;
  }

  const record = params as Record<string, unknown>;
  let analytics: ConsentState | undefined;
  let advertising: ConsentState | undefined;

  if (record.analytics_storage === "granted") {
    analytics = "granted";
  } else if (record.analytics_storage === "denied") {
    analytics = "denied";
  }

  if (record.ad_storage === "granted") {
    advertising = "granted";
  } else if (record.ad_storage === "denied") {
    advertising = "denied";
  }

  if (analytics === undefined && advertising === undefined) return null;
  return { analytics, advertising };
}

function updateConsent(updates: {
  analytics?: ConsentState | undefined;
  advertising?: ConsentState | undefined;
}): void {
  const nextAnalytics = updates.analytics ?? currentConsent.analytics;
  const nextAdvertising = updates.advertising ?? currentConsent.advertising;

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
}

function inspectDataLayer(): void {
  if (typeof window === "undefined" || !Array.isArray(window.dataLayer)) return;
  for (const item of window.dataLayer) {
    let args: unknown[] | null = null;
    if (Array.isArray(item)) {
      args = item;
    } else if (item && typeof item === "object") {
      args = Array.prototype.slice.call(item as unknown[]);
    }
    if (args) {
      const updates = parseConsentUpdate(args);
      if (updates) updateConsent(updates);
    }
  }
}

function attachGtagInterceptor(): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];

  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }

  const originalPush = window.dataLayer.push.bind(window.dataLayer);

  window.dataLayer.push = function (...items: unknown[]) {
    const result = originalPush(...items);
    for (const item of items) {
      let args: unknown[] | null = null;
      if (Array.isArray(item)) {
        args = item;
      } else if (item && typeof item === "object") {
        args = Array.prototype.slice.call(item as unknown[]);
      }
      if (args) {
        const updates = parseConsentUpdate(args);
        if (updates) updateConsent(updates);
      }
    }
    return result;
  };

  // Inspect existing records in dataLayer
  inspectDataLayer();

  // Also support custom event dispatch for signals
  window.addEventListener("wyrplay:consent-signal", ((event: CustomEvent) => {
    if (event.detail && typeof event.detail === "object") {
      const { analytics, advertising } = event.detail as {
        analytics?: ConsentState;
        advertising?: ConsentState;
      };
      updateConsent({ analytics, advertising });
    }
  }) as EventListener);
}

function attachTcfListener(): void {
  if (typeof window === "undefined") return;

  // Use Google-supported IAB TCF API version (v2 standard)
  if (typeof window.__tcfapi === "function") {
    try {
      window.__tcfapi("addEventListener", 2, (tcData, success) => {
        if (!success || !tcData || typeof tcData !== "object") return;
        inspectDataLayer();
      });
    } catch {
      // Ignore if CMP is in unsupported state
    }
  }
}

function attachGoogleFcListener(): void {
  if (typeof window === "undefined") return;

  if (window.googlefc) {
    window.googlefc.callbackQueue = window.googlefc.callbackQueue ?? [];
    window.googlefc.callbackQueue.push({
      CONSENT_DATA_READY: () => {
        inspectDataLayer();
      },
    });
  }
}

export function initConsentAdapter(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  cleanLegacyStorage();
  attachGtagInterceptor();
  attachTcfListener();
  attachGoogleFcListener();
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

export function showPrivacySettings(): void {
  if (typeof window === "undefined") return;

  if (typeof window.googlefc?.showRevocationMessage === "function") {
    window.googlefc.showRevocationMessage();
    return;
  }

  if (window.googlefc && Array.isArray(window.googlefc.callbackQueue)) {
    window.googlefc.callbackQueue.push({
      CONSENT_DATA_READY: () => {
        window.googlefc?.showRevocationMessage?.();
      },
    });
  }
}

// Helper for tests to update consent without foreign popup UI
export function setConsentForTesting(updates: {
  analytics?: ConsentState | undefined;
  advertising?: ConsentState | undefined;
}): void {
  updateConsent(updates);
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
