import { expect, it } from "vitest";
import type { ReactElement } from "react";
import { homeConfig, homeConfigWithLeaderboard } from "@/config/home.config";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import type { WyrExperienceProps } from "@/modules/would-you-rather/ui/wyr-experience";

it("derives a bounded approved homepage pool from the canonical bank", () => {
  const surface = homeConfig.sections[0].surface.props.children as ReactElement<WyrExperienceProps>;
  expect(surface.props.questions).toHaveLength(12);
  for (const q of surface.props.questions) {
    expect(q.reviewStatus).toBe("approved");
    expect(QUESTIONS_DATABASE).toContain(q);
  }
  expect(surface.props.approvedQuestionCount).toBe(
    QUESTIONS_DATABASE.filter((q) => q.reviewStatus === "approved").length,
  );
});
it("the optional leaderboard surface only serializes three trending entries", () => {
  const config = homeConfigWithLeaderboard({
    status: "ready",
    snapshot: {
      entries: QUESTIONS_DATABASE.map((question) => ({
        question,
        total: 1,
        month: 1,
        week: 1,
      })),
      totalVotes: 0,
      anonymousVoters: 0,
      generatedAt: new Date(0).toISOString(),
    },
  });
  const surface = config.sections[0]!.surface.props.children as ReactElement<WyrExperienceProps>;
  expect(surface.props.leaderboard?.status).toBe("ready");
  if (surface.props.leaderboard?.status === "ready")
    expect(surface.props.leaderboard.snapshot.entries).toHaveLength(3);
});
