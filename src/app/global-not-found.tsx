import { SiteShell } from "@/components/navigation/site-shell";
import { NotFoundPage } from "@/components/status/status-page";
import { siteConfig } from "@/config/site.config";

import "./globals.css";

export const metadata = {
  title: `Page Not Found | ${siteConfig.name}`,
};

export default function GlobalNotFoundPage() {
  return (
    <html lang={siteConfig.defaultLocale}>
      <body style={{ margin: 0, background: "#fff8ee" }}>
        <SiteShell>
          <NotFoundPage />
        </SiteShell>
      </body>
    </html>
  );
}
