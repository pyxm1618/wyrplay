import type { ReactNode } from "react";
import { AnalyticsBoundary } from "@/components/analytics/analytics-boundary";
import { SiteShell } from "@/components/navigation/site-shell";
import { rootMetadata } from "@/platform/seo/root-metadata";

export const metadata = rootMetadata();

export default function LeaderboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="leaderboard-body min-h-screen" data-theme="light">
      <SiteShell>{children}</SiteShell>
      <AnalyticsBoundary />
    </div>
  );
}
