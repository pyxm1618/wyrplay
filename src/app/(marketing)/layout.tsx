import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { AnalyticsBoundary } from "@/components/analytics/analytics-boundary";
import { SiteShell } from "@/components/navigation/site-shell";
import { siteConfig } from "@/config/site.config";
import { rootMetadata } from "@/platform/seo/root-metadata";

import "../globals.css";
import "./home.css";

export const metadata: Metadata = rootMetadata();

export default async function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
  await connection();
  return (
    <html lang={siteConfig.defaultLocale} data-theme="dark">
      <body>
        <SiteShell>{children}</SiteShell>
        <AnalyticsBoundary />
      </body>
    </html>
  );
}
