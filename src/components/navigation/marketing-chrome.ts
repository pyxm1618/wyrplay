export type MarketingChromeConfig = {
  ownHeader: boolean;
  headerAppearance: "default" | "illustrated-home";
  footerAppearance: "default" | "illustrated" | "finder";
  themeClass?: string;
};

/** Unified route chrome decision for marketing layout, header, footer and theme. */
export function marketingChrome(pathname: string): MarketingChromeConfig {
  const isHome = pathname === "/";
  const isFinder = pathname === "/find-questions";
  const isPlay = pathname === "/play";
  const isPrint = pathname === "/print";

  return {
    ownHeader: isFinder || isPlay || isPrint,
    headerAppearance: isHome ? "illustrated-home" : "default",
    footerAppearance: isHome ? "illustrated" : isFinder ? "finder" : "default",
    themeClass: isHome ? "homepage-brand-theme" : undefined,
  };
}
