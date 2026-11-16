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
        <a href="https://shipstry.com/" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://shipstry.com/badges/featured.svg"
            alt="Featured on Shipstry"
            width="220"
            height="52"
          />
        </a>
        <a
          href="https://startupbase.io/products/wyr-play?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://statics.startupbase.io/site/badges/launched-on-sb.svg"
            alt="Launched on StartupBase"
            height="55"
            style={{ height: "55px", width: "auto" }}
          />
        </a>
      </div>
      <AnalyticsBoundary />
    </>
  );
}
