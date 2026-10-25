import { accessSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";

const staticDirectories = [
  "home-art",
  "kids-art",
  "finder",
  "leaderboard-art",
  "leaderboard-fonts",
  "home-fonts",
  "play-art",
  "status-art",
  "account-art",
  "brand",
  "og",
] as const;

it("keeps dynamic requests worker-first while confirmed public asset directories are assets-first", () => {
  const wrangler = readFileSync("wrangler.jsonc", "utf8");
  expect(wrangler).toContain('"/*"');
  for (const directory of staticDirectories) {
    accessSync(`public/${directory}`);
    expect(wrangler).toContain(`"!/${directory}/*"`);
  }
  for (const dynamicException of ["!/api/*", "!/_next/image/*", "!/play*", "!/print*"]) {
    expect(wrangler).not.toContain(`"${dynamicException}"`);
  }
});

it("preserves specialized public-asset cache headers without overriding Cloudflare MIME or ETag", () => {
  const headers = readFileSync("public/_headers", "utf8");
  expect(headers).toContain("/_next/static/*");
  expect(headers).toContain("Cache-Control: public, max-age=31536000, immutable");
  for (const route of [
    "/kids-art/optimized/*",
    "/home-art/*",
    "/home-fonts/*",
    "/finder/fonts/*",
    "/leaderboard-fonts/*",
  ]) {
    expect(headers).toContain(route);
  }
  expect(headers).not.toMatch(/^\s*Content-Type:/m);
  expect(headers).not.toMatch(/^\s*ETag:/m);
});
