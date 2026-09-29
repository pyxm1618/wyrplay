import { siteConfig } from "@/config/site.config";
import type { SiteSeoConfig } from "@/platform/seo/types";

export const seoConfig = {
  siteName: siteConfig.name,
  canonicalOrigin: siteConfig.canonicalOrigin,
  defaultLocale: siteConfig.defaultLocale,
  supportedLocales: siteConfig.supportedLocales,
  localeLabels: siteConfig.localeLabels,
  localePrefixStrategy: siteConfig.localePrefixStrategy,
  defaultTitle: "Would You Rather Questions",
  titleTemplate: "%s · Would You Rather",
  defaultDescription:
    "Browse Would You Rather questions for kids, adults, couples, friends and parties. Pick A or B, play instantly, and find the perfect dilemma for any group.",
  defaultOgImage: "/og/default.svg",
  releaseStatus: "reviewed",
} as const satisfies SiteSeoConfig;
