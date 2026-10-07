import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site.config";
import { rootMetadata } from "@/platform/seo/root-metadata";

import "./globals.css";

export const metadata: Metadata = rootMetadata();

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={siteConfig.defaultLocale} data-theme="dark">
      <body nonce={nonce}>{children}</body>
    </html>
  );
}
