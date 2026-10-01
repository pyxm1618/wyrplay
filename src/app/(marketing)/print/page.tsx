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
export default function Page() {
  return (
    <main>
      <Suspense fallback={<p>Loading your questions…</p>}>{printConfig.surface}</Suspense>
    </main>
  );
}
