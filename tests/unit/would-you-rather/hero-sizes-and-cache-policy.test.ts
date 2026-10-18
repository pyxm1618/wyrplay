import { expect, it } from "vitest";
import nextConfig from "@/../next.config";
import fs from "node:fs";
import path from "node:path";

it("next.config headers include immutable directive for /home-art/ to trigger OpenNext long-term image caching", async () => {
  if (typeof nextConfig.headers === "function") {
    const headers = await nextConfig.headers();
    const homeArtHeader = headers.find((h) => h.source === "/home-art/:path*");
    expect(homeArtHeader).toBeDefined();
    const cacheControl = homeArtHeader?.headers.find((header) => header.key === "Cache-Control");
    expect(cacheControl?.value).toContain("immutable");
    expect(cacheControl?.value).toContain("max-age=2678400");
  }
});

it("worker.ts includes defense-in-depth cache-control fallback for /_next/image", () => {
  const workerContent = fs.readFileSync(path.resolve(process.cwd(), "worker.ts"), "utf-8");
  expect(workerContent).toContain('url.pathname.startsWith("/_next/image")');
  expect(workerContent).toContain('"Cache-Control"');
  expect(workerContent).toContain("max-age=2678400");
});

it("illustrated-home hero-title sizes contains desktop viewport height 24vh constraint to prevent over-fetch", () => {
  const tsxContent = fs.readFileSync(
    path.resolve(process.cwd(), "src/modules/would-you-rather/ui/illustrated-home.tsx"),
    "utf-8",
  );
  expect(tsxContent).toContain("(min-width: 1024px) and (max-height: 1100px) min(400px, 24vh)");
});
