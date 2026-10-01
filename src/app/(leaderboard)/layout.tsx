import type { ReactNode } from "react";
import { connection } from "next/server";
import { AnalyticsBoundary } from "@/components/analytics/analytics-boundary";
import { siteConfig } from "@/config/site.config";
import { rootMetadata } from "@/platform/seo/root-metadata";
import "../globals.css";

export const metadata = rootMetadata();
export default async function LeaderboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  await connection();
  return (
    <html lang={siteConfig.defaultLocale} data-theme="light">
      <body className="leaderboard-body">
        {children}
        <AnalyticsBoundary />
      </body>
    </html>
  );
}
