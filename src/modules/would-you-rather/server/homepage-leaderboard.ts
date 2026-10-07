import "server-only";

import { unstable_cache } from "next/cache";
import type { LeaderboardResult } from "../domain/leaderboard";
import { getLeaderboardSnapshot } from "./leaderboard-service";

/**
 * Scoped homepage leaderboard loader with a 60-second TTL cache.
 * Keeps the core leaderboard service unmemoized so /leaderboards retains
 * its native request-time query semantics, while protecting the homepage
 * hero & arena from database contention.
 */
export async function loadHomepageLeaderboard(): Promise<LeaderboardResult> {
  const cached = unstable_cache(
    async () => {
      try {
        const snapshot = await getLeaderboardSnapshot();
        return {
          status: "ready" as const,
          snapshot,
        };
      } catch {
        return { status: "unavailable" as const };
      }
    },
    ["homepage-leaderboard-snapshot-v1"],
    {
      revalidate: 60,
      tags: ["homepage-leaderboard"],
    },
  );

  try {
    return await cached();
  } catch {
    return { status: "unavailable" };
  }
}
