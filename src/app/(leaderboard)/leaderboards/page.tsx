import { routeRegistry } from "@/config/routes.config";
import { LeaderboardPage, type LeaderboardResult } from "@/modules/would-you-rather";
import { getLeaderboardSnapshot } from "@/modules/would-you-rather/server";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

export const metadata = metadataForRoute(routeRegistry, "/leaderboards", currentSeoEnvironment());
export default async function LeaderboardsRoute() {
  let result: LeaderboardResult;
  try {
    result = { status: "ready", snapshot: await getLeaderboardSnapshot() };
  } catch {
    // The failure is handled by an explicit unavailable state and retry action.
    // Do not turn database failures into zero votes or expose database details.
    result = { status: "unavailable" };
  }
  return <LeaderboardPage result={result} />;
}
