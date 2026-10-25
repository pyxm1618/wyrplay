"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  subscribeConsent,
  isConsentResolved,
  type ConsentState,
} from "@/platform/consent/consent-adapter";

import {
  isAnalyticsLocationSafe,
  sanitizeAnalyticsEvent,
  type SanitizedAnalyticsEvent,
} from "@/platform/analytics/events";

const SCRIPT_IDS = ["creat-web-ga4", "creat-web-clarity"] as const;
let activeMeasurementId: string | undefined;
let clarityScriptRequested = false;
const ANALYTICS_COOKIE_PREFIXES = ["_ga", "_clck", "_clsk"] as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

function loadScript(id: string, src: string): HTMLScriptElement | undefined {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.append(script);
  return script;
}

function emitAnalyticsEvent(event: SanitizedAnalyticsEvent): void {
  window.gtag?.("event", event.name, event.properties);
  window.clarity?.("event", event.name);
}

function startGa4(measurementId: string): void {
  activeMeasurementId = measurementId;
  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = false;
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }
  window.gtag("js", new Date());
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  loadScript(
    "creat-web-ga4",
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
  );
}

function startClarity(projectId: string): void {
  const clarity = ((...args: unknown[]) => {
    clarity.q = clarity.q ?? [];
    clarity.q.push(args);
  }) as NonNullable<Window["clarity"]>;
  window.clarity = window.clarity ?? clarity;
  // A new grant supersedes queued lifecycle decisions, but keeps vendor project setup.
  if (window.clarity.q) {
    window.clarity.q = window.clarity.q.filter(
      (command) =>
        command[0] !== "stop" &&
        command[0] !== "consentv2" &&
        !(command[0] === "start" && command.length === 1),
    );
  }
  window.clarity("start");
  window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
  if (!clarityScriptRequested) {
    clarityScriptRequested = true;
    document.getElementById("creat-web-clarity")?.remove();
    const script = loadScript(
      "creat-web-clarity",
      `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`,
    );
    script?.addEventListener("error", () => {
      clarityScriptRequested = false;
    });
  }
}

function clearAnalyticsCookies(): void {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=", 1)[0]?.trim();
    if (!name || !ANALYTICS_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))) continue;
    const expiration = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    document.cookie = expiration;
    // GA4's default cookie domain can be a parent of the current hostname.
    const labels = window.location.hostname.split(".");
    for (let index = 0; index < labels.length - 1; index += 1) {
      document.cookie = `${expiration}; Domain=${labels.slice(index).join(".")}`;
    }
  }
}

function stopAnalytics(clearCookies = true): void {
  if (activeMeasurementId) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${activeMeasurementId}`] = true;
  }
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
  window.clarity?.("stop");
  for (const scriptId of SCRIPT_IDS) document.getElementById(scriptId)?.remove();
  if (clearCookies) clearAnalyticsCookies();
  if (window.dataLayer) window.dataLayer.length = 0;
  // A prepared vendor script may still arrive after removal; keep its denied/stop queue.
}

export function AnalyticsClient({
  ga4MeasurementId,
  clarityProjectId,
  consentRequired,
}: Readonly<{
  ga4MeasurementId?: string;
  clarityProjectId?: string;
  consentRequired: boolean;
}>) {
  const consentSnapshot = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  const consentResolved = useSyncExternalStore(subscribeConsent, isConsentResolved, () => false);
  const consent: ConsentState = consentRequired ? consentSnapshot.analytics : "granted";
  const pathname = usePathname();
  useEffect(() => {
    // A fail-closed initial snapshot is not a CMP decision to withdraw consent.
    if (consentRequired && !consentResolved) return;
    if (consent !== "granted") {
      stopAnalytics();
      return;
    }

    if (
      !isAnalyticsLocationSafe({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      })
    ) {
      stopAnalytics();
      return;
    }

    if (ga4MeasurementId) startGa4(ga4MeasurementId);
    if (clarityProjectId) startClarity(clarityProjectId);

    return () => stopAnalytics(false);
  }, [clarityProjectId, consent, consentRequired, consentResolved, ga4MeasurementId]);

  useEffect(() => {
    if ((consentRequired && !consentResolved) || consent !== "granted") return;

    if (
      !isAnalyticsLocationSafe({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      })
    ) {
      return;
    }

    emitAnalyticsEvent(
      sanitizeAnalyticsEvent({
        name: "page_view",
        properties: {
          path: window.location.pathname,
          locale: document.documentElement.lang || "en",
        },
      }),
    );
  }, [consent, consentRequired, consentResolved, pathname]);

  return null;
}
