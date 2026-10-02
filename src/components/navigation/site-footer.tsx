import Link from "next/link";

import { siteConfig } from "@/config/site.config";

const legalLinks = [
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Acceptable use", "/acceptable-use"],
  ["Contact", "/contact"],
] as const;

export function SiteFooter({ appearance = "default" }: { appearance?: "default" | "illustrated" }) {
  return (
    <footer
      className={`mt-auto border-t border-border bg-surface-muted ${appearance === "illustrated" ? "site-footer-illustrated" : ""}`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted">
          © {new Date().getUTCFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <nav aria-label="Legal navigation" className="flex flex-wrap gap-x-5 gap-y-2">
          {legalLinks.map(([label, href]) => (
            <Link
              href={href}
              key={href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
