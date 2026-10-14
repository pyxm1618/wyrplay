import { chromium, type Request, type Response } from "@playwright/test";

interface StepSpec {
  name: string;
  from: string;
  to: string;
  linkSelector: string;
  contentSelector: string;
}

interface StepMeasurement {
  stepName: string;
  clickToRequestMs: number | null;
  ttfbMs: number | null;
  clickToUrlMs: number;
  clickToVisibleMs: number;
  requestUrl?: string | undefined;
  hasNetworkRequest: boolean;
}

const STEPS: StepSpec[] = [
  {
    name: "Home → For Kids",
    from: "/",
    to: "/would-you-rather-questions-for-kids",
    linkSelector:
      'header[data-site-header] nav[aria-label="Primary navigation"] a[href="/would-you-rather-questions-for-kids"]',
    contentSelector: ".kids-page, #kids-title",
  },
  {
    name: "For Kids → Find Questions",
    from: "/would-you-rather-questions-for-kids",
    to: "/find-questions",
    linkSelector:
      'header[data-site-header] nav[aria-label="Primary navigation"] a[href="/find-questions"]',
    contentSelector: ".finder-page, #search",
  },
  {
    name: "Find Questions → Print",
    from: "/find-questions",
    to: "/print",
    linkSelector:
      'header[data-site-header] nav[aria-label="Primary navigation"] a[href="/print"]',
    contentSelector: ".print-page",
  },
  {
    name: "Print → Leaderboards",
    from: "/print",
    to: "/leaderboards",
    linkSelector:
      'header[data-site-header] nav[aria-label="Primary navigation"] a[href="/leaderboards"]',
    contentSelector: ".leaderboard-page, #leaderboard-title",
  },
  {
    name: "Leaderboards → Home",
    from: "/leaderboards",
    to: "/",
    linkSelector:
      'header[data-site-header] nav[aria-label="Primary navigation"] a[href="/"], header[data-site-header] a[href="/"]',
    contentSelector: ".home-main",
  },
  {
    name: "Home → Play",
    from: "/",
    to: "/play",
    linkSelector: 'header[data-site-header] a[href="/play"]',
    contentSelector: ".play-page",
  },
];

const TARGET_ORIGIN = process.env.TARGET_ORIGIN ?? "https://www.wyrplay.com";
const ITERATIONS = Number.parseInt(process.env.BENCH_ITERATIONS ?? "5", 10);

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0;
}

async function runSinglePass(page: import("@playwright/test").Page): Promise<StepMeasurement[]> {
  const results: StepMeasurement[] = [];

  // Start from initial root page
  await page.goto(`${TARGET_ORIGIN}/`, { waitUntil: "networkidle" });

  for (const step of STEPS) {
    // Ensure we are at the expected starting path
    const currentUrl = new URL(page.url());
    if (currentUrl.pathname !== step.from) {
      await page.goto(`${TARGET_ORIGIN}${step.from}`, { waitUntil: "networkidle" });
    }

    const link = page.locator(step.linkSelector).first();
    await link.waitFor({ state: "visible", timeout: 10000 });

    // Track navigation network events
    let firstReqTime: number | null = null;
    let ttfbTime: number | null = null;
    let navUrl: string | undefined = undefined;

    const onRequest = (req: Request) => {
      const url = req.url();
      const isRSC =
        url.includes("_rsc") ||
        req.headers()["rsc"] === "1" ||
        req.headers()["next-router-prefetch"] === "1";
      const isDoc = req.resourceType() === "document";
      const isScript = req.resourceType() === "script" && url.includes("/_next/static/");
      if (isRSC || isDoc || isScript) {
        if (firstReqTime === null) {
          firstReqTime = performance.now();
          navUrl = url;
        }
      }
    };

    const onResponse = (res: Response) => {
      if (firstReqTime !== null && ttfbTime === null) {
        const url = res.url();
        const isRSC = url.includes("_rsc") || res.request().headers()["rsc"] === "1";
        const isDoc = res.request().resourceType() === "document";
        const isScript =
          res.request().resourceType() === "script" && url.includes("/_next/static/");
        if (isRSC || isDoc || isScript) {
          ttfbTime = performance.now();
        }
      }
    };

    page.on("request", onRequest);
    page.on("response", onResponse);

    const clickTime = performance.now();
    await link.click();

    // 1. Wait for URL change
    await page.waitForURL(
      (url) => {
        return url.pathname === step.to;
      },
      { timeout: 15000 },
    );
    const urlChangedTime = performance.now();

    // 2. Wait for target main content to be visible
    const targetContent = page.locator(step.contentSelector).first();
    await targetContent.waitFor({ state: "visible", timeout: 15000 });
    const contentVisibleTime = performance.now();

    page.off("request", onRequest);
    page.off("response", onResponse);

    const clickToUrlMs = Math.round(urlChangedTime - clickTime);
    const clickToVisibleMs = Math.round(contentVisibleTime - clickTime);
    const clickToRequestMs =
      firstReqTime !== null ? Math.round(firstReqTime - clickTime) : null;
    const ttfbMs =
      firstReqTime !== null && ttfbTime !== null
        ? Math.round(ttfbTime - firstReqTime)
        : null;

    const measurement: StepMeasurement = {
      stepName: step.name,
      clickToRequestMs,
      ttfbMs,
      clickToUrlMs,
      clickToVisibleMs,
      requestUrl: navUrl,
      hasNetworkRequest: firstReqTime !== null,
    };

    results.push(measurement);

    // Short cooling delay to prevent queue congestion between steps
    await page.waitForTimeout(300);
  }

  return results;
}

async function main() {
  console.log(`Starting Navigation Benchmark`);
  console.log(`Target Origin: ${TARGET_ORIGIN}`);
  console.log(`Iterations: ${ITERATIONS}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const allRuns: StepMeasurement[][] = [];

  for (let i = 1; i <= ITERATIONS; i++) {
    process.stdout.write(`Pass ${i}/${ITERATIONS}... `);
    try {
      const passResults = await runSinglePass(page);
      allRuns.push(passResults);
      console.log(`Done.`);
    } catch (err) {
      console.log(`Failed: ${(err as Error).message}`);
    }
  }

  await browser.close();

  console.log("\n========================================================");
  console.log(`Benchmark Summary (${allRuns.length} successful iterations)`);
  console.log("========================================================\n");

  for (let s = 0; s < STEPS.length; s++) {
    const step = STEPS[s];
    if (!step) continue;
    const measurements = allRuns
      .map((r) => r[s])
      .filter((m): m is StepMeasurement => Boolean(m));

    const clickToReqs = measurements
      .map((m) => m.clickToRequestMs)
      .filter((v): v is number => v !== null);
    const ttfbs = measurements
      .map((m) => m.ttfbMs)
      .filter((v): v is number => v !== null);
    const clickToUrls = measurements.map((m) => m.clickToUrlMs);
    const clickToVisibles = measurements.map((m) => m.clickToVisibleMs);

    console.log(`[Route] ${step.name} (${step.from} → ${step.to})`);
    console.log(
      `  Network request triggered: ${measurements.filter((m) => m.hasNetworkRequest).length}/${measurements.length}`,
    );
    if (clickToReqs.length > 0) {
      console.log(
        `  click → request:       P50 = ${percentile(clickToReqs, 50)}ms | P95 = ${percentile(clickToReqs, 95)}ms`,
      );
      console.log(
        `  navigation/RSC TTFB:   P50 = ${percentile(ttfbs, 50)}ms | P95 = ${percentile(ttfbs, 95)}ms`,
      );
    } else {
      console.log(`  click → request:       (prefetched/client-cached - 0 network req)`);
      console.log(`  navigation/RSC TTFB:   (prefetched/client-cached - 0ms)`);
    }
    console.log(
      `  click → URL changed:   P50 = ${percentile(clickToUrls, 50)}ms | P95 = ${percentile(clickToUrls, 95)}ms`,
    );
    console.log(
      `  click → visible:       P50 = ${percentile(clickToVisibles, 50)}ms | P95 = ${percentile(clickToVisibles, 95)}ms`,
    );
    console.log("");
  }
}

main().catch((err) => {
  console.error("Fatal benchmark error:", err);
  process.exit(1);
});
