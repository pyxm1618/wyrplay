"use client";

import { useEffect, useRef } from "react";

const SCRIPT_ID = "creat-web-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  ready(callback: () => void): void;
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      size: "flexible" | "compact";
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      "timeout-callback": () => void;
      "response-field": boolean;
    },
  ): string;
  reset(widgetId?: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

function ensureTurnstileScript(onReady: () => void): () => void {
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  const handleReady = () => window.turnstile?.ready(onReady);

  if (window.turnstile) {
    window.turnstile.ready(onReady);
    return () => undefined;
  }

  if (existing) {
    existing.addEventListener("load", handleReady);
    return () => existing.removeEventListener("load", handleReady);
  }

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = SCRIPT_SRC;
  // Turnstile refuses `turnstile.ready()` when its own script tag carries
  // async or defer, and throws instead of rendering the widget. A dynamically
  // inserted script is already non-blocking, so clearing both attributes costs
  // nothing and keeps ready() usable.
  script.async = false;
  script.defer = false;
  script.addEventListener("load", handleReady);
  document.head.append(script);
  return () => script.removeEventListener("load", handleReady);
}

export function TurnstileWidget({
  siteKey,
  resetSignal,
  onToken,
  onUnavailable,
}: Readonly<{
  siteKey: string;
  resetSignal: number;
  onToken: (token: string | null) => void;
  onUnavailable: () => void;
}>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onUnavailableRef = useRef(onUnavailable);

  useEffect(() => {
    onTokenRef.current = onToken;
    onUnavailableRef.current = onUnavailable;
  }, [onToken, onUnavailable]);

  useEffect(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    const cleanupScriptListener = ensureTurnstileScript(() => {
      if (disposed || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
      const container = containerRef.current;
      let currentSize: "flexible" | "compact" | undefined;
      const renderForWidth = () => {
        if (disposed || !window.turnstile) return;
        // Cloudflare flexible still needs 300px. Use its official compact
        // layout below that threshold, including after viewport changes.
        const size = container.getBoundingClientRect().width < 300 ? "compact" : "flexible";
        if (size === currentSize) return;
        const previousId = widgetIdRef.current;
        if (previousId) window.turnstile.remove(previousId);
        onTokenRef.current(null);
        currentSize = size;
        container.style.minHeight = size === "compact" ? "140px" : "65px";
        widgetIdRef.current = window.turnstile.render(container, {
          sitekey: siteKey,
          action: "magic-link",
          size,
          callback: (token) => onTokenRef.current(token),
          "error-callback": () => {
            onTokenRef.current(null);
            onUnavailableRef.current();
          },
          "expired-callback": () => onTokenRef.current(null),
          "timeout-callback": () => onTokenRef.current(null),
          "response-field": false,
        });
      };
      renderForWidth();
      resizeObserver = new ResizeObserver(renderForWidth);
      resizeObserver.observe(container);
    });

    return () => {
      disposed = true;
      cleanupScriptListener();
      resizeObserver?.disconnect();
      const widgetId = widgetIdRef.current;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      widgetIdRef.current = null;
      onTokenRef.current(null);
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetSignal === 0) return;
    const widgetId = widgetIdRef.current;
    if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
    onTokenRef.current(null);
  }, [resetSignal]);

  return (
    <div
      ref={containerRef}
      style={{ minHeight: 65, width: "100%" }}
      role="group"
      aria-label="Human verification"
    />
  );
}
