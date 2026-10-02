"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { marketingChrome } from "./marketing-chrome";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** One route-level decision keeps marketing header, controls and footer in one unified chrome. */
export function MarketingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const chrome = marketingChrome(pathname);
  return (
    <div className={`flex min-h-screen flex-col ${chrome.themeClass ?? ""}`}>
      <SiteHeader appearance={chrome.headerAppearance} ownHeader={chrome.ownHeader} />
      {children}
      <SiteFooter appearance={chrome.footerAppearance} />
    </div>
  );
}
