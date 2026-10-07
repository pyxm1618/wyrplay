import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site.config";
import { rootMetadata } from "@/platform/seo/root-metadata";

import "./globals.css";

export const metadata: Metadata = rootMetadata();

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={siteConfig.defaultLocale} data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
