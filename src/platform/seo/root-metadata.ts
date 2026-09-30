import type { Metadata } from "next";

import { seoConfig } from "@/config/seo.config";
import { currentSeoEnvironment, metadataOrigin } from "@/platform/seo/environment-policy";

export function rootMetadata(): Metadata {
  const mode = currentSeoEnvironment();
  const appOrigin = process.env.APP_ORIGIN;

  return {
    metadataBase: metadataOrigin({
      mode,
      ...(appOrigin ? { appOrigin } : {}),
      canonicalOrigin: seoConfig.canonicalOrigin,
    }),
    title: {
      default: seoConfig.defaultTitle,
      template: seoConfig.titleTemplate,
    },
    description: seoConfig.defaultDescription,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/brand/logo.svg", type: "image/svg+xml" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/manifest.webmanifest",
  };
}
