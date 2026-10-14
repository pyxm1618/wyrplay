import { expect, it, vi } from "vitest";

const { waitUntil, write } = vi.hoisted(() => ({
  waitUntil: vi.fn(),
  write: vi.fn(),
}));
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({ ctx: { waitUntil } }),
}));
vi.mock("@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache", () => ({
  default: { name: "cf-r2-incremental-cache", get: vi.fn(), set: write, delete: vi.fn() },
}));
import cache from "../../scripts/cloudflare-incremental-cache";

it("retains an unfinished stale-cache write even when its caller does not await it", async () => {
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  write.mockReturnValueOnce(pending);
  const result = cache.set(
    "snapshot",
    { kind: "FETCH", data: { headers: {}, body: "{}", url: "" }, revalidate: 60 },
    "fetch",
  );
  expect(waitUntil).toHaveBeenCalledWith(pending);
  expect(result).toBe(pending);
  finish();
  await result;
});
