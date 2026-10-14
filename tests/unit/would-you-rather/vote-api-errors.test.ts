import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const services = vi.hoisted(() => ({
  isValidQuestion: vi.fn(() => true),
  isVotableQuestion: vi.fn(() => true),
  getQuestionVoteStats: vi.fn(),
  recordVote: vi.fn(),
  recordAggregateOnlyVote: vi.fn(),
  usesAggregateOnlyVoting: vi.fn(),
}));
vi.mock("@/modules/would-you-rather/server", () => services);
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
import * as general from "@/app/api/wyr/vote/route";
import * as kids from "@/app/api/wyr/kids-vote/route";
afterEach(() => vi.restoreAllMocks());
for (const [name, route, aggregate] of [
  ["general", general, false],
  ["Kids", kids, true],
] as const) {
  for (const method of ["GET", "POST"] as const) {
    it(`${name} ${method} hides unexpected driver errors and records server diagnostics`, async () => {
      services.usesAggregateOnlyVoting.mockReturnValue(aggregate);
      const internal = new Error("Invalid option: database driver private detail");
      services.getQuestionVoteStats.mockRejectedValue(internal);
      services.recordVote.mockRejectedValue(internal);
      services.recordAggregateOnlyVote.mockRejectedValue(internal);
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      const response = await route[method](
        new NextRequest("http://localhost/api/wyr/vote?questionId=wyr-000001", {
          method,
          ...(method === "POST"
            ? { body: JSON.stringify({ questionId: "wyr-000001", option: "A" }) }
            : {}),
        }),
      );
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: method === "GET" ? "Failed to load vote stats" : "Failed to record vote",
      });
      expect(log).toHaveBeenCalled();
    });
  }
}
