import type { Metadata } from "next";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site.config";
import { rootMetadata } from "@/platform/seo/root-metadata";

import "./globals.css";

export const metadata: Metadata = rootMetadata();

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={siteConfig.defaultLocale} data-theme="dark">
      <head>
        <meta name="google-adsense-account" content="ca-pub-2804737462866511" />
      </head>
      <body>{children}</body>
    </html>
  );
}
