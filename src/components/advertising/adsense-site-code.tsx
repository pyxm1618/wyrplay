"use client";

import { useEffect } from "react";

const siteCodeUrl =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2804737462866511";

export function AdSenseSiteCode() {
  useEffect(() => {
    if (document.querySelector(`script[src="${siteCodeUrl}"]`)) return;

    const nonce = document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;
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
