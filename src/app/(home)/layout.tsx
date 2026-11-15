import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnalyticsBoundary } from "@/components/analytics/analytics-boundary";
import { SiteShell } from "@/components/navigation/site-shell";
import { rootMetadata } from "@/platform/seo/root-metadata";

export const metadata: Metadata = rootMetadata();

export default function HomeLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <div data-home-startup-fame-badge className="flex w-full justify-center py-4 print:hidden">
        <a
          href="https://startupfa.me/s/wyrplay?utm_source=www.wyrplay.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://startupfa.me/badge?t=small&theme=default"
            alt="WYR Play - Featured on Startup Fame"
            width="240"
            height="36"
          />
        </a>
      </div>
      <AnalyticsBoundary />
    </>
  );
}
