import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnalyticsBoundary } from "@/components/analytics/analytics-boundary";
import { SiteShell } from "@/components/navigation/site-shell";
import { rootMetadata } from "@/platform/seo/root-metadata";

import "./home.css";

export const metadata: Metadata = rootMetadata();

export default function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <AnalyticsBoundary />
    </>
  );
}
