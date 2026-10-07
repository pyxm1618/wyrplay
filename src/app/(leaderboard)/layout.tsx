import type { ReactNode } from "react";
import { connection } from "next/server";
import { AnalyticsBoundary } from "@/components/analytics/analytics-boundary";
import { SiteShell } from "@/components/navigation/site-shell";
import { siteConfig } from "@/config/site.config";
import { rootMetadata } from "@/platform/seo/root-metadata";
import "../globals.css";

export const metadata = rootMetadata();
export default async function LeaderboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  await connection();
  return (
    <html lang={siteConfig.defaultLocale} data-theme="light">
      <head>
        <meta name="google-adsense-account" content="ca-pub-2804737462866511" />
      </head>
      <body className="leaderboard-body">
        <SiteShell>{children}</SiteShell>
        <AnalyticsBoundary />
      </body>
    </html>
  );
}
