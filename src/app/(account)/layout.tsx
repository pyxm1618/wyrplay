import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { featuresConfig } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { rootMetadata } from "@/platform/seo/root-metadata";

import "../globals.css";

export const metadata: Metadata = {
  ...rootMetadata(),
  robots: { index: false, follow: false },
};

export default async function AccountRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  await connection();
  if (!featuresConfig.auth.enabled) notFound();
  return (
    <html lang={siteConfig.defaultLocale}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-2804737462866511" />
      </head>
      <body>{children}</body>
    </html>
  );
}
