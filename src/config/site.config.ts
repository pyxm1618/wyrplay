import type { ProductConfig } from "@/platform/config/types";

export const siteConfig = {
  slug: "wyrplay",
  name: "WYRPlay",
  canonicalOrigin: "https://www.wyrplay.com",
  defaultLocale: "en",
  supportedLocales: ["en"],
  localeLabels: { en: "English" },
  localePrefixStrategy: "as-needed",
} as const satisfies ProductConfig["site"];
