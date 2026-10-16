"use client";

import { useEffect } from "react";

import { isAdSenseRoute } from "@/platform/advertising/adsense-routes";

const siteCodeUrl =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2804737462866511";

export function AdSenseSiteCode() {
  useEffect(() => {
    if (!isAdSenseRoute(window.location.pathname)) return;
    if (document.querySelector(`script[src="${siteCodeUrl}"]`)) return;

    // The route-scoped CSP admits this official source without changing static rendering.
    // Mount only in successful page content, never in shared layouts or errors.
    const script = document.createElement("script");
    const nonce = document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;
    if (nonce) script.nonce = nonce;
    script.src = siteCodeUrl;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
}

// AdSense cannot be unloaded by removing its script tag. A new document is
// required at advertising boundaries, including when Next has prefetched a link.
export function AdSenseDocumentBoundary() {
  useEffect(() => {
    function navigateAcrossAdSenseBoundary(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      )
        return;
      const destination = new URL(anchor.href);
      const current = window.location;
      if (
        destination.origin !== current.origin ||
        (destination.pathname === current.pathname && destination.search === current.search)
      )
        return;
      if (!isAdSenseRoute(current.pathname) && !isAdSenseRoute(destination.pathname)) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(destination.href);
    }

    document.addEventListener("click", navigateAcrossAdSenseBoundary, true);
    return () => document.removeEventListener("click", navigateAcrossAdSenseBoundary, true);
  }, []);

  return null;
}
