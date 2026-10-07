import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/navigation/site-shell";
import { siteConfig } from "@/config/site.config";
import { rootMetadata } from "@/platform/seo/root-metadata";

import "../globals.css";

export const metadata: Metadata = rootMetadata();

export default async function LegalLayout({ children }: Readonly<{ children: ReactNode }>) {
  await connection();
  return (
    <html lang={siteConfig.defaultLocale} data-theme="dark">
      <head>
        <meta name="google-adsense-account" content="ca-pub-2804737462866511" />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
