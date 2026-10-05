import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

import { siteConfig } from "@/config/site.config";
import { ThemeSync } from "@/modules/would-you-rather";

export function SiteShell({
  children,
  locale = siteConfig.defaultLocale,
}: Readonly<{
  children: ReactNode;
  locale?: string;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <ThemeSync />
      <SiteHeader locale={locale} />
      {children}
      <SiteFooter />
    </div>
  );
}
