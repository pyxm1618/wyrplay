"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { marketingChrome } from "./marketing-chrome";

import { siteConfig } from "@/config/site.config";
import { featuresConfig } from "@/config/features.config";
import { IllustratedHomeHeader, ThemeToggle } from "@/modules/would-you-rather";
import { localePath } from "@/platform/i18n/routing";

const navLink = "text-sm font-medium text-muted transition-colors hover:text-foreground";
const mobileNavLink =
  "block py-2 text-base font-medium text-foreground transition-colors hover:text-[#e27d32]";

export function SiteHeader({
  locale = siteConfig.defaultLocale,
  appearance,
  ownHeader,
}: Readonly<{
  locale?: string;
  appearance?: "default" | "illustrated-home";
  ownHeader?: boolean;
}> = {}) {
  const pathname = usePathname();
  const chrome = marketingChrome(pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const homeHref = localePath(siteConfig, locale, "/");

  const closeMenu = () => setMobileMenuOpen(false);

  const isOwnHeader = ownHeader ?? chrome.ownHeader;
  const currentAppearance = appearance ?? chrome.headerAppearance;

  if (isOwnHeader) return null;
  if (currentAppearance === "illustrated-home") {
    return (
      <div className="illustrated-home homepage">
        <IllustratedHomeHeader authEnabled={featuresConfig.auth.enabled} />
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3 text-base font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          href={homeHref}
          aria-label={`${siteConfig.name} Home`}
          onClick={closeMenu}
        >
          <Image
            src="/brand/logo.svg"
            alt={`${siteConfig.name} Logo`}
            width={32}
            height={32}
            className="size-8 object-contain"
            priority
          />
          <span className="font-serif text-lg tracking-tight sm:inline">{siteConfig.name}</span>
        </Link>

        {/* 桌面端主导航 */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:gap-6 xl:flex">
          <Link className={navLink} href="/find-questions">
            Find Questions
          </Link>
          <Link className={navLink} href="/#play">
            Play
          </Link>
          <Link className={navLink} href="/#questions">
            Questions
          </Link>
          <Link className={navLink} href="/would-you-rather-questions-for-kids">
            Kids
          </Link>
          <Link className={navLink} href="/funny-would-you-rather-questions">
            Funny
          </Link>
          <Link className={navLink} href="/hard-would-you-rather-questions">
            Hard
          </Link>
          <Link className={navLink} href="/would-you-rather-questions-for-friends">
            Friends
          </Link>
          <Link className={navLink} href="/would-you-rather-questions-for-couples">
            Couples
          </Link>
          <Link className={navLink} href="/leaderboards">
            Leaderboards
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/#play"
            className="hidden items-center justify-center rounded-full bg-[#121418] text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-semibold shadow transition hover:opacity-90 active:scale-95 sm:inline-flex sm:text-sm"
          >
            Start Playing
          </Link>

          {/* 移动端汉堡菜单触发按钮 */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-surface xl:hidden"
          >
            {mobileMenuOpen ? (
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 移动端展开菜单 */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-5 py-4 xl:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-2">
            <Link className={mobileNavLink} href="/find-questions" onClick={closeMenu}>
              Find Questions
            </Link>
            <Link className={mobileNavLink} href="/#play" onClick={closeMenu}>
              🎮 Play Live Dilemmas
            </Link>
            <Link className={mobileNavLink} href="/#questions" onClick={closeMenu}>
              📋 All Questions Directory
            </Link>
            <Link className={mobileNavLink} href="/leaderboards" onClick={closeMenu}>
              Leaderboards
            </Link>
            <div className="my-1 border-t border-border/60" />
            <Link
              className={mobileNavLink}
              href="/would-you-rather-questions-for-kids"
              onClick={closeMenu}
            >
              🧒 Kids Questions
            </Link>
            <Link
              className={mobileNavLink}
              href="/funny-would-you-rather-questions"
              onClick={closeMenu}
            >
              😂 Funny Questions
            </Link>
            <Link
              className={mobileNavLink}
              href="/hard-would-you-rather-questions"
              onClick={closeMenu}
            >
              🧠 Hard Dilemmas
            </Link>
            <Link
              className={mobileNavLink}
              href="/would-you-rather-questions-for-friends"
              onClick={closeMenu}
            >
              👥 Friends Dilemmas
            </Link>
            <Link
              className={mobileNavLink}
              href="/would-you-rather-questions-for-couples"
              onClick={closeMenu}
            >
              ❤️ Couples Dilemmas
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
