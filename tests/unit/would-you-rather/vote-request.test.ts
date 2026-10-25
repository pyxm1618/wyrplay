import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/platform/config/env", () => ({
  env: { appOrigin: "https://www.wyrplay.com", appEnv: "production" },
}));
import {
  validateVoteRequest,
  resolveVoterCookie,
  consumeVoteLimit,
} from "@/platform/security/vote-request";
const request = (headers: Record<string, string> = {}, body = "{}") =>
  new Request("https://www.wyrplay.com/api/wyr/vote", {
    method: "POST",
    headers: { origin: "https://www.wyrplay.com", "content-type": "application/json", ...headers },
    body,
  });
describe("vote request boundary", () => {
  it("rejects foreign or missing origins", async () => {
    expect((await validateVoteRequest(request({ origin: "https://evil.test" }))).status).toBe(403);
    expect((await validateVoteRequest(request({ origin: "" }))).status).toBe(403);
  });
  it("requires JSON media type", async () => {
    expect((await validateVoteRequest(request({ "content-type": "text/plain" }))).status).toBe(415);
    expect(
      (await validateVoteRequest(request({ "content-type": "application/jsonp" }))).status,
    ).toBe(415);
  });
  it("caps actual bytes even without content-length", async () => {
    expect((await validateVoteRequest(request({}, "x".repeat(4097)))).status).toBe(413);
  });
  it("rejects malformed JSON and accepts JSON", async () => {
    expect((await validateVoteRequest(request({}, "{"))).status).toBe(400);
    expect(await validateVoteRequest(request())).toEqual({ body: {} });
  });
  it("accepts only a UUID cookie, replacing arbitrary strings", () => {
    for (const cookie of [undefined, "", "attacker", "x".repeat(10000), "aggregate:123"]) {
      const value = resolveVoterCookie(cookie);
      expect(value.isNew).toBe(true);
      expect(value.voterId).toMatch(/^[0-9a-f-]{36}$/);
    }
    expect(resolveVoterCookie("12345678-1234-4234-8234-123456789012")).toEqual({
      voterId: "12345678-1234-4234-8234-123456789012",
      isNew: false,
    });
  });
  it("atomically rate limits trusted IPs without storing raw IP or a browser identity", async () => {
    const execute = vi.fn().mockResolvedValue([{ count: 61 }]);
    expect(
      (await consumeVoteLimit(request({ "CF-Connecting-IP": "203.0.113.1" }), { execute } as never))
        ?.status,
    ).toBe(429);
    expect(execute).toHaveBeenCalledOnce();
  });
  it("fails closed without a trusted IP instead of sharing an unknown bucket", async () => {
    const execute = vi.fn();
    expect((await consumeVoteLimit(request(), { execute } as never))?.status).toBe(503);
    expect(execute).not.toHaveBeenCalled();
  });
});
