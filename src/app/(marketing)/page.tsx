import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { homeConfigWithLeaderboard } from "@/config/home.config";
import { routeRegistry } from "@/config/routes.config";
import { getLeaderboardSnapshot } from "@/modules/would-you-rather/server";
import type { LeaderboardResult } from "@/modules/would-you-rather";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd, websiteJsonLd } from "@/platform/seo/structured-data";

export const metadata: Metadata = metadataForRoute(routeRegistry, "/", currentSeoEnvironment());

export default async function HomePage() {
  const home = routeRegistry.get("/");
  if (home.class !== "public_indexable") throw new Error("home route must be indexable");

  let leaderboard: LeaderboardResult;
  try {
    leaderboard = { status: "ready", snapshot: await getLeaderboardSnapshot() };
  } catch {
    leaderboard = { status: "unavailable" };
  }
  const homeConfig = homeConfigWithLeaderboard(leaderboard);
  return (
    <main className="home-main">
      <JsonLd
        value={websiteJsonLd({
          name: routeRegistry.site.siteName,
          url: routeRegistry.site.canonicalOrigin,
          description: routeRegistry.site.defaultDescription,
        })}
      />
      <JsonLd
        value={webApplicationJsonLd({
          name: home.title,
          url: routeRegistry.site.canonicalOrigin,
          description: home.description,
        })}
      />
      <LandingPage sections={homeConfig.sections} />
    </main>
  );
}
