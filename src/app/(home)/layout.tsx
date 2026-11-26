import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnalyticsBoundary } from "@/components/analytics/analytics-boundary";
import { HomepageBadgeMarquee } from "@/components/home/homepage-badge-marquee";
import { SiteShell } from "@/components/navigation/site-shell";
import { rootMetadata } from "@/platform/seo/root-metadata";

export const metadata: Metadata = rootMetadata();

export default function HomeLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <HomepageBadgeMarquee />
      <AnalyticsBoundary />
    </>
  );
}
