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
      <div
        data-home-startup-fame-badge
        className="flex w-full flex-wrap items-center justify-center gap-3 py-4 print:hidden"
      >
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
        <a
          data-home-better-launch-badge
          href="https://www.betterlaunch.co/product/wyr-play"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.betterlaunch.co/badge-live-gradient.svg"
            alt="Launching on Better Launch"
            width="200"
            height="56"
          />
        </a>
      </div>
      <AnalyticsBoundary />
    </>
  );
}
