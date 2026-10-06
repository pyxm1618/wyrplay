import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

import { featuresConfig } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";

export function SiteShell({
  children,
  locale = siteConfig.defaultLocale,
}: Readonly<{
  children: ReactNode;
  locale?: string;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} authEnabled={featuresConfig.auth.enabled} />
      {children}
      <SiteFooter />
    </div>
  );
}
