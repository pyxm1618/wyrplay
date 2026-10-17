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
let realAdSenseTarget: unknown = [];
let isInterceptorInstalled = false;

const dummyArrayTarget: unknown[] = [];
const proxyInstance = new Proxy(dummyArrayTarget, {
  get(_t, prop) {
    if (prop === "pauseAdRequests") {
      return currentAdPauseState;
    }
    const targetObj = (realAdSenseTarget ?? dummyArrayTarget) as object;
    const val = Reflect.get(targetObj, prop);
    if (typeof val === "function") {
      return (val as (...args: unknown[]) => unknown).bind(targetObj);
    }
    return val;
  },
  set(_t, prop, value) {
    if (prop === "pauseAdRequests") {
      currentAdPauseState = Number(value);
      if (realAdSenseTarget && typeof realAdSenseTarget === "object") {
        try {
          (realAdSenseTarget as { pauseAdRequests?: number }).pauseAdRequests = currentAdPauseState;
        } catch {
          // ignore external setter errors
        }
      }
      return true;
    }
    const targetObj = (realAdSenseTarget ?? dummyArrayTarget) as object;
    return Reflect.set(targetObj, prop, value);
  },
  has(_t, prop) {
    if (prop === "pauseAdRequests") return true;
    const targetObj = (realAdSenseTarget ?? dummyArrayTarget) as object;
    return Reflect.has(targetObj, prop);
  },
  ownKeys() {
    const targetObj = (realAdSenseTarget ?? dummyArrayTarget) as object;
    return Reflect.ownKeys(targetObj);
  },
  getOwnPropertyDescriptor(_t, prop) {
    if (prop === "pauseAdRequests") {
      return {
        configurable: true,
        enumerable: true,
        value: currentAdPauseState,
        writable: true,
      };
    }
    const targetObj = (realAdSenseTarget ?? dummyArrayTarget) as object;
    return Reflect.getOwnPropertyDescriptor(targetObj, prop);
  },
}) as AdSenseQueue;

function ensureProxyInstalled(): void {
  if (typeof window === "undefined" || isInterceptorInstalled) return;
  isInterceptorInstalled = true;

  if (window.adsbygoogle && window.adsbygoogle !== proxyInstance) {
    realAdSenseTarget = window.adsbygoogle;
  }

  try {
    Object.defineProperty(window, "adsbygoogle", {
      configurable: true,
      enumerable: true,
      get() {
        return proxyInstance;
      },
      set(newVal: unknown) {
        realAdSenseTarget = newVal;
        if (newVal && typeof newVal === "object") {
          try {
            (newVal as { pauseAdRequests?: number }).pauseAdRequests = currentAdPauseState;
          } catch {
            // Ignore if Google's internal object throws
          }
        }
      },
    });
  } catch {
    window.adsbygoogle = proxyInstance;
  }
}

export function setAdSensePauseState(paused: boolean): void {
  if (typeof window === "undefined") return;
  currentAdPauseState = paused ? 1 : 0;
  ensureProxyInstalled();
  if (realAdSenseTarget && typeof realAdSenseTarget === "object") {
    try {
      (realAdSenseTarget as { pauseAdRequests?: number }).pauseAdRequests = currentAdPauseState;
    } catch {
      // ignore
    }
  }
}

// Immediately synchronize pause state whenever consent adapter notifies outside React cycle
if (typeof window !== "undefined") {
  ensureProxyInstalled();
  setAdSensePauseState(getConsentSnapshot().advertising !== "granted");
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
