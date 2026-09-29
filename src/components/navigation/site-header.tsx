import Link from "next/link";

import { siteConfig } from "@/config/site.config";
import { ThemeToggle } from "@/modules/would-you-rather";
import { localePath } from "@/platform/i18n/routing";

const navLink =
  "text-sm font-medium text-muted transition-colors hover:text-foreground";

export function SiteHeader({ locale = siteConfig.defaultLocale }: Readonly<{ locale?: string }>) {
  const homeHref = localePath(siteConfig, locale, "/");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3 text-base font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          href={homeHref}
          aria-label={`${siteConfig.name} Home`}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#e27d32] to-[#19a4b8] text-xs font-black text-white shadow-sm">
            WYR
          </span>
          <span className="hidden font-serif text-lg tracking-tight sm:inline">
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
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
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/#play"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background shadow transition hover:opacity-90 active:scale-95 sm:text-sm"
          >
            Start Playing
          </Link>
        </div>
      </div>
    </header>
  );
}
