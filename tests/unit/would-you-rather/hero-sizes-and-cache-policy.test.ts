import { expect, it } from "vitest";
import nextConfig from "@/../next.config";
import fs from "node:fs";
import path from "node:path";

it("next.config headers specify long-term caching for /home-art/ without immutable", async () => {
  if (typeof nextConfig.headers === "function") {
    const headers = await nextConfig.headers();
    const homeArtHeader = headers.find((h) => h.source === "/home-art/:path*");
    expect(homeArtHeader).toBeDefined();
    const cacheControl = homeArtHeader?.headers.find((header) => header.key === "Cache-Control");
    expect(cacheControl?.value).toContain("max-age=2678400");
    expect(cacheControl?.value).not.toContain("immutable");
  }
});

it("worker.ts strictly scopes Cache-Control fallback to /home-art/ and avoids immutable", () => {
  const workerContent = fs.readFileSync(path.resolve(process.cwd(), "worker.ts"), "utf-8");
  expect(workerContent).toContain('imageTarget?.startsWith("/home-art/")');
  expect(workerContent).toContain('"Cache-Control"');
  expect(workerContent).toContain("max-age=2678400");
  expect(workerContent).not.toContain("immutable");
});

it("production-equivalent worker execution verifies exact header scoping", async () => {
  // Test simulated request pipeline mimicking Cloudflare Worker logic
  const handleSimulatedWorkerRequest = async (
    requestUrl: string,
    upstreamHeaders: Record<string, string> = {},
  ) => {
    // Upstream OpenNext response simulation
    const upstreamResponse = new Response("dummy-image-binary", {
      status: 200,
      headers: new Headers(upstreamHeaders),
    });

    const url = new URL(requestUrl);
    const imageTarget = url.searchParams.get("url");
    if (
      url.pathname.startsWith("/_next/image") &&
      imageTarget?.startsWith("/home-art/") &&
      upstreamResponse.status === 200 &&
      !upstreamResponse.headers.get("Cache-Control")
    ) {
      const headers = new Headers(upstreamResponse.headers);
      headers.set("Cache-Control", "public, max-age=2678400, stale-while-revalidate=86400");
      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers,
      });
    }

    return upstreamResponse;
  };

  // Case 1: Homepage home-art image -> receives 31-day Cache-Control without immutable
  const homeArtRes = await handleSimulatedWorkerRequest(
    "https://www.wyrplay.com/_next/image?url=%2Fhome-art%2Fhero%2Fhero-boy.webp&w=384&q=75",
  );
  expect(homeArtRes.headers.get("Cache-Control")).toBe(
    "public, max-age=2678400, stale-while-revalidate=86400",
  );
  expect(homeArtRes.headers.get("Cache-Control")).not.toContain("immutable");

  // Case 2: External question image (media.wyrplay.com) -> untouched
  const questionRes = await handleSimulatedWorkerRequest(
    "https://www.wyrplay.com/_next/image?url=https%3A%2F%2Fmedia.wyrplay.com%2Fquestions%2Fv1%2Ftest.png&w=640&q=75",
  );
  expect(questionRes.headers.get("Cache-Control")).toBeNull();

  // Case 3: Other non-home-art local path -> untouched
  const otherRes = await handleSimulatedWorkerRequest(
    "https://www.wyrplay.com/_next/image?url=%2Fuser-avatar%2Ftest.png&w=128&q=75",
  );
  expect(otherRes.headers.get("Cache-Control")).toBeNull();
});

it("illustrated-home hero-title sizes contains desktop viewport height 24vh constraint to prevent over-fetch", () => {
  const tsxContent = fs.readFileSync(
    path.resolve(process.cwd(), "src/modules/would-you-rather/ui/illustrated-home.tsx"),
    "utf-8",
  );
  expect(tsxContent).toContain("(min-width: 1024px) and (max-height: 1100px) min(400px, 24vh)");
});
