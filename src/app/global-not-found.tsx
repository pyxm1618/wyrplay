import { NotFoundPage } from "@/components/status/status-page";
import { siteConfig } from "@/config/site.config";

import "./globals.css";

export default function GlobalNotFoundPage() {
  return (
    <html lang={siteConfig.defaultLocale}>
      <body>
        <NotFoundPage />
      </body>
    </html>
  );
}
