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
    "Explore fun, funny, hard, and thought-provoking Would You Rather questions for kids, friends, couples, parties, classrooms, and more.",
  defaultOgImage: "/og/default.svg",
  releaseStatus: "draft",
} as const satisfies SiteSeoConfig;
