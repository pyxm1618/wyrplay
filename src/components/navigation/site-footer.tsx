import Link from "next/link";

import { SiteBrand } from "./site-brand";

import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";

function FooterColumn({
  title,
  links,
}: Readonly<{
  title: string;
  links: readonly { readonly label: string; readonly href: string }[];
}>) {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm leading-relaxed text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SiteFooter() {
  const categoryLinks = [
    ...navigationConfig.footer.questionCategories,
    navigationConfig.footer.allCategories,
  ];

  return (
    <footer
      data-site-footer
      className="mt-auto border-t border-border bg-surface-muted text-foreground print:hidden"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1.35fr_0.9fr_1.1fr]">
        <section>
          <SiteBrand />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Fun questions. Better conversations.
          </p>
          <p className="mt-6 text-xs text-muted">
            © {new Date().getUTCFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </section>

        <FooterColumn title="Explore" links={navigationConfig.footer.explore} />
        <FooterColumn title="Question Categories" links={categoryLinks} />
        <FooterColumn title="Support" links={navigationConfig.footer.support} />
        <FooterColumn title="Legal" links={navigationConfig.footer.legal} />
      </div>
    </footer>
  );
}
