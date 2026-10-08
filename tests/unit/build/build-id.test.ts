import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getBuildId } from "@/platform/build/build-id";

describe("getBuildId", () => {
  const originalVercel = process.env.VERCEL_GIT_COMMIT_SHA;
  const originalGithub = process.env.GITHUB_SHA;

  beforeEach(() => {
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.GITHUB_SHA;
  });

  afterEach(() => {
    if (originalVercel !== undefined) {
      process.env.VERCEL_GIT_COMMIT_SHA = originalVercel;
    } else {
      delete process.env.VERCEL_GIT_COMMIT_SHA;
    }

    if (originalGithub !== undefined) {
      process.env.GITHUB_SHA = originalGithub;
    } else {
      delete process.env.GITHUB_SHA;
    }
  });

  it("returns identical build id across consecutive invocations on the same commit", () => {
    const id1 = getBuildId();
    const id2 = getBuildId();
    expect(id1).toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
    expect(id1).not.toBe("wyrplay-build");
  });

  it("prioritizes VERCEL_GIT_COMMIT_SHA when set and varies across different commits", () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "commit-sha-alpha-1234567890abcdef";
    const buildIdA = getBuildId();
    expect(buildIdA).toBe("commit-sha-alpha-1234567890abcdef");

    process.env.VERCEL_GIT_COMMIT_SHA = "commit-sha-beta-abcdef1234567890";
    const buildIdB = getBuildId();
    expect(buildIdB).toBe("commit-sha-beta-abcdef1234567890");

    expect(buildIdA).not.toBe(buildIdB);
  });

  it("uses GITHUB_SHA when VERCEL_GIT_COMMIT_SHA is absent and varies across commits", () => {
    process.env.GITHUB_SHA = "gh-sha-1111111111111111";
    const buildId1 = getBuildId();
    expect(buildId1).toBe("gh-sha-1111111111111111");

    process.env.GITHUB_SHA = "gh-sha-2222222222222222";
    const buildId2 = getBuildId();
    expect(buildId2).toBe("gh-sha-2222222222222222");

    expect(buildId1).not.toBe(buildId2);
  });

  it("does not use a hardcoded string or random uuid", () => {
    const id = getBuildId();
    expect(id).not.toBe("wyrplay-build");
    expect(typeof id).toBe("string");
  });
});
