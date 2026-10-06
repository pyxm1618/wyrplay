import { SiteShell } from "@/components/navigation/site-shell";
import { NotFoundPage } from "@/components/status/status-page";
import "./globals.css";

// Unmatched paths bypass the route-group layouts; reuse their shared shell.
export default function GlobalNotFoundPage() {
  return (
    <SiteShell>
      <NotFoundPage />
    </SiteShell>
  );
}
