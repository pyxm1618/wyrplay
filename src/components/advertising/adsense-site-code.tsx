"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  subscribeConsent,
} from "@/platform/consent/consent-adapter";

const siteCodeUrl =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2804737462866511";

type AdSenseQueue = unknown[] & {
  pauseAdRequests?: number;
  requestNonPersonalizedAds?: number;
};

declare global {
  interface Window {
    adsbygoogle?: AdSenseQueue;
  }
}

let currentAdPauseState = 1;

export function setAdSensePauseState(paused: boolean): void {
  if (typeof window === "undefined") return;
  currentAdPauseState = paused ? 1 : 0;
  const queue = (window.adsbygoogle = (window.adsbygoogle ?? []) as AdSenseQueue);
  try {
    Object.defineProperty(queue, "pauseAdRequests", {
      configurable: true,
      enumerable: true,
      get() {
        return currentAdPauseState;
      },
      set(val: number) {
        currentAdPauseState = val;
      },
    });
  } catch {
    queue.pauseAdRequests = currentAdPauseState;
  }
}

// Immediately synchronize pause state whenever consent adapter notifies outside React cycle
if (typeof window !== "undefined") {
  subscribeConsent(() => {
    setAdSensePauseState(getConsentSnapshot().advertising !== "granted");
  });
}

function getScriptNonce(): string | undefined {
  if (typeof document === "undefined") return undefined;
  for (const s of Array.from(document.scripts)) {
    if (s.nonce) return s.nonce;
  }
  return document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;
}

export function AdSenseSiteCode() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  // Synchronize AdSense ad-request pause state with advertising consent
  useEffect(() => {
    setAdSensePauseState(consent.advertising !== "granted");
  }, [consent.advertising]);

  // Bootstrap AdSense site script so Google Privacy & messaging / CMP can operate
  useEffect(() => {
    setAdSensePauseState(getConsentSnapshot().advertising !== "granted");

    if (document.querySelector(`script[src="${siteCodeUrl}"]`)) return;

    const nonce = getScriptNonce();
    if (!nonce) return;

    const script = document.createElement("script");
    script.nonce = nonce;
    script.src = siteCodeUrl;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
}
