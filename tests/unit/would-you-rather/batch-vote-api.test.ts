import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { isVotableQuestion } from "@/modules/would-you-rather/server/voting-service";
vi.mock("server-only", () => ({}));
const batch = vi.hoisted(() => vi.fn());
vi.mock("@/modules/would-you-rather/server", () => ({
  isVotableQuestion,
  getQuestionVoteStatsBatch: batch,
}));
import { GET } from "@/app/api/wyr/vote-stats/route";
afterEach(() => {
  batch.mockReset();
  vi.restoreAllMocks();
});
function request(ids: readonly string[]) {
  return new NextRequest(
    `http://localhost/api/wyr/vote-stats?${new URLSearchParams(ids.map((id) => ["questionId", id]))}`,
  );
}
for (const ids of [
  [],
  ["unknown"],
  ["wyr-000001", "wyr-000001"],
  Array.from({ length: 11 }, (_, i) => `wyr-${String(i + 1).padStart(6, "0")}`),
]) {
  it(`rejects invalid batch input before querying: ${JSON.stringify(ids)}`, async () => {
    expect((await GET(request(ids))).status).toBe(400);
    expect(batch).not.toHaveBeenCalled();
  });
}
it("returns only page aggregates with no identity cookie and no-store", async () => {
  const summaries = {
    "wyr-000001": {
      votesA: 1,
      votesB: 0,
      total: 1,
      percentageA: 100,
      percentageB: 0,
      hasVoted: false,
      selectedOption: null,
    },
  };
  batch.mockResolvedValue(summaries);
  const response = await GET(request(["wyr-000001"]));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(summaries);
  expect(response.headers.get("set-cookie")).toBeNull();
  expect(response.headers.get("cache-control")).toContain("no-store");
});
it("records unexpected batch errors on the server and sends a stable public error", async () => {
  batch.mockRejectedValue(new Error("private driver detail"));
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await GET(request(["wyr-000001"]));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Failed to load vote stats" });
  expect(log).toHaveBeenCalled();
});
