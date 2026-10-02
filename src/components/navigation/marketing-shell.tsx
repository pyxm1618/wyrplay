"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** One route-level decision keeps the homepage header, controls and footer in one theme. */
export function MarketingShell({ children }: { children: ReactNode }) {
  const illustrated = usePathname() === "/";
  return (
    <div className={`flex min-h-screen flex-col ${illustrated ? "homepage-brand-theme" : ""}`}>
      <SiteHeader appearance={illustrated ? "illustrated-home" : "default"} />
      {children}
      <SiteFooter appearance={illustrated ? "illustrated" : "default"} />
    </div>
  );
}
