"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SiteBrand } from "./site-brand";

import { featuresConfig } from "@/config/features.config";
import { navigationConfig, type NavigationItem } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { ThemeToggle } from "@/modules/would-you-rather";
import { localePath } from "@/platform/i18n/routing";

const desktopLink =
  "rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface hover:text-foreground";
const mobileLink =
  "block rounded-xl px-3 py-3 text-base font-semibold text-foreground transition-colors hover:bg-surface-muted";

function isActive(pathname: string, item: NavigationItem): boolean {
  const activeRoutes = item.activeRoutes ?? [item.href];
  return activeRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function SiteHeader({
  locale = siteConfig.defaultLocale,
}: Readonly<{
  locale?: string;
}> = {}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const homeHref = localePath(siteConfig, locale, "/");
  const toLocaleHref = (href: string) => localePath(siteConfig, locale, href);

  return (
    <header
      data-site-header
        className="sticky top-0 z-40 border-b border-border bg-background/95 text-foreground backdrop-blur-md print:hidden"
        onKeyDown={(event) => {
          if (event.key === "Escape") setMobileMenuOpen(false);
        }}
    >
      {pathname === homeHref ? (
        <a
          href="#play"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to play
        </a>
      ) : null}
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <SiteBrand href={homeHref} className="shrink-0" />

          <nav
            aria-label="Primary navigation"
            className="ml-4 hidden flex-1 items-center justify-center gap-1 lg:flex"
          >
            {navigationConfig.header.primary.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={toLocaleHref(item.href)}
                  aria-current={active ? "page" : undefined}
                  className={`${desktopLink} ${active ? "bg-surface text-foreground" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {featuresConfig.auth.enabled ? (
              <>
                <Link
                  href={toLocaleHref(navigationConfig.header.auth.loggedOut[0].href)}
                  className="hidden px-2 py-2 text-sm font-semibold text-muted hover:text-foreground xl:inline-flex"
                >
                  {navigationConfig.header.auth.loggedOut[0].label}
                </Link>
                <Link
                  href={toLocaleHref(navigationConfig.header.auth.loggedOut[1].href)}
                  className="hidden rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted xl:inline-flex"
                >
                  {navigationConfig.header.auth.loggedOut[1].label}
                </Link>
              </>
            ) : null}
            <Link
              href={toLocaleHref(navigationConfig.header.primaryCta.href)}
              className="hidden items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background shadow-sm transition hover:opacity-90 sm:inline-flex"
            >
              {navigationConfig.header.primaryCta.label}
            </Link>
            <button
              type="button"
              aria-controls="site-mobile-navigation"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-surface-muted lg:hidden"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                {mobileMenuOpen ? "×" : "☰"}
              </span>
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div id="site-mobile-navigation" className="border-t border-border bg-background lg:hidden">
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
            >
              {navigationConfig.header.primary.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={toLocaleHref(item.href)}
                    aria-current={active ? "page" : undefined}
                    className={`${mobileLink} ${active ? "bg-surface-muted" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={toLocaleHref(navigationConfig.header.primaryCta.href)}
                className="mt-2 flex items-center justify-center rounded-xl bg-foreground px-4 py-3 text-base font-bold text-background"
                onClick={() => setMobileMenuOpen(false)}
              >
                {navigationConfig.header.primaryCta.label}
              </Link>
              {featuresConfig.auth.enabled ? (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
                  {navigationConfig.header.auth.loggedOut.map((item) => (
                    <Link
                      key={item.href}
                      href={toLocaleHref(item.href)}
                      className="rounded-xl border border-border px-3 py-3 text-center text-sm font-semibold text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </nav>
          </div>
        ) : null}
    </header>
  );
}
