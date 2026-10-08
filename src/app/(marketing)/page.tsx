import type { Metadata } from "next";
import { Suspense } from "react";

import { LandingPage } from "@/components/landing/landing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { homeConfigWithTrendingSlot } from "@/config/home.config";
import { routeRegistry } from "@/config/routes.config";
import {
  TrendingListContent,
  TrendingListSkeleton,
  rankLeaderboard,
} from "@/modules/would-you-rather";
import { loadHomepageLeaderboard } from "@/modules/would-you-rather/server";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd, websiteJsonLd } from "@/platform/seo/structured-data";

export const metadata: Metadata = metadataForRoute(routeRegistry, "/", currentSeoEnvironment());

async function HomepageTrendingAsync() {
  const leaderboard = await loadHomepageLeaderboard();
  if (leaderboard.status === "ready") {
    const items = rankLeaderboard(leaderboard.snapshot.entries, "all")
      .slice(0, 3)
      .map((entry) => ({
        rank: entry.rank,
        id: entry.question.id,
        question: entry.question.question,
        votes: entry.votes,
      }));
    return <TrendingListContent status="ready" items={items} />;
  }
  return <TrendingListContent status="unavailable" items={[]} />;
}

export default async function HomePage() {
  const home = routeRegistry.get("/");
  if (home.class !== "public_indexable") throw new Error("home route must be indexable");

  const trendingSlot = (
    <Suspense fallback={<TrendingListSkeleton />}>
      <HomepageTrendingAsync />
    </Suspense>
  );

  const homeConfig = homeConfigWithTrendingSlot(trendingSlot);

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
