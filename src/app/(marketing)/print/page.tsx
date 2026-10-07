import { Suspense } from "react";
import type { Metadata } from "next";
import { printConfig } from "@/config/play.config";
import { routeRegistry } from "@/config/routes.config";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
export const metadata: Metadata = metadataForRoute(
  routeRegistry,
  "/print",
  currentSeoEnvironment(),
);
function PrintFallback() {
  return (
    <div className="print-page" aria-busy="true" aria-label="Loading print session">
      <div className="print-toolbar">
        <span className="text-sm font-medium text-muted">Preparing printable cards…</span>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main>
      <Suspense fallback={<PrintFallback />}>{printConfig.surface}</Suspense>
    </main>
  );
}
