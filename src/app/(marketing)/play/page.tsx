import { Suspense } from "react";
import type { Metadata } from "next";
import { playConfig } from "@/config/play.config";
import { routeRegistry } from "@/config/routes.config";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
export const metadata: Metadata = metadataForRoute(routeRegistry, "/play", currentSeoEnvironment());
function PlayFallback() {
  return (
    <div className="play-page" aria-busy="true" aria-label="Loading play session">
      <div className="play-toolbar">
        <span className="text-sm font-medium text-muted">Loading questions…</span>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main>
      <Suspense fallback={<PlayFallback />}>{playConfig.surface}</Suspense>
    </main>
  );
}
