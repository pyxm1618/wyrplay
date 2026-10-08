import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnalyticsBoundary } from "@/components/analytics/analytics-boundary";
import { SiteShell } from "@/components/navigation/site-shell";
import { seoLandingPages } from "@/config/seo-landings.config";
import { siteConfig } from "@/config/site.config";
import { isSupportedLocale } from "@/platform/i18n/routing";
import { rootMetadata } from "@/platform/seo/root-metadata";

export const metadata: Metadata = rootMetadata();

type SegmentLayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{ readonly segment: string }>;
};

export function generateStaticParams() {
  const landingSegments = seoLandingPages.map((page) => page.route.replace(/^\//, ""));
  const localeSegments = siteConfig.supportedLocales.filter(
    (locale) => locale !== siteConfig.defaultLocale,
  );
  return [...new Set([...landingSegments, ...localeSegments])].map((segment) => ({ segment }));
}

export default async function SegmentLayout({ children, params }: SegmentLayoutProps) {
  const { segment } = await params;
  const locale =
    segment !== siteConfig.defaultLocale && isSupportedLocale(siteConfig, segment)
      ? segment
      : siteConfig.defaultLocale;

  return (
    <>
      <SiteShell locale={locale}>{children}</SiteShell>
      <AnalyticsBoundary />
    </>
  );
}
