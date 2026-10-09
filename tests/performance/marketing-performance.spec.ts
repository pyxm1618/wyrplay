import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Route } from "@playwright/test";

declare global {
  interface Window {
    __cwv?: { cls: number; inp: number; lcp: number };
    __homeDiagnostic?: {
      lcp: { element: string; url: string; start: number; size: number } | null;
      longTasks: { start: number; duration: number }[];
    };
  }
}

const routes = ["/", "/would-you-rather-questions-for-kids"] as const;

for (const route of routes) {
  test(`${route} stays within marketing release budgets`, async ({ page, request }) => {
    const consoleErrors: string[] = [];
    const serverErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 500) {
        serverErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    // Live vote persistence is covered by integration/E2E suites. Keep this
    // performance gate deterministic so it measures the redesigned page itself.
    const fulfillEmptyVoteStats = async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          hasVoted: false,
          selectedOption: null,
          votesA: 0,
          votesB: 0,
          total: 0,
          percentageA: 50,
          percentageB: 50,
        }),
      });
    };

    await page.route("**/api/wyr/vote?*", fulfillEmptyVoteStats);
    await page.route("**/api/wyr/kids-vote?*", fulfillEmptyVoteStats);

    if (route === "/") {
      await page.addInitScript(() => {
        window.__homeDiagnostic = { lcp: null, longTasks: [] };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const item = entry as PerformanceEntry & {
              element?: Element;
              url?: string;
              size?: number;
            };
            const element = item.element;
            const classes = typeof element?.className === "string" ? element.className : "";
            window.__homeDiagnostic!.lcp = {
              element: element
                ? `${element.tagName.toLowerCase()}#${element.id}.${classes}`
                : "(no element)",
              url: item.url ?? "",
              start: item.startTime,
              size: item.size ?? 0,
            };
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const item of list.getEntries()) {
            window.__homeDiagnostic!.longTasks.push({
              start: Math.round(item.startTime),
              duration: Math.round(item.duration),
            });
          }
        }).observe({ type: "longtask", buffered: true });
      });
    }

    await page.addInitScript(() => {
      window.__cwv = { cls: 0, inp: 0, lcp: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!shift.hadRecentInput) window.__cwv!.cls += shift.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last) window.__cwv!.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const interaction = entry as PerformanceEntry & {
            duration?: number;
            interactionId?: number;
          };
          if ((interaction.interactionId ?? 0) > 0) {
            window.__cwv!.inp = Math.max(window.__cwv!.inp, interaction.duration ?? 0);
          }
        }
      }).observe({
        type: "event",
        buffered: true,
        durationThreshold: 16,
      } as PerformanceObserverInit & { durationThreshold: number });
    });

    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    expect(response?.headers()["x-robots-tag"]).toContain("noindex");

    const title = await page.title();
    expect(title.trim().length).toBeGreaterThanOrEqual(20);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.trim().length ?? 0).toBeGreaterThanOrEqual(70);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(structuredData.length).toBeGreaterThan(0);
    for (const value of structuredData) expect(() => JSON.parse(value)).not.toThrow();

    const imageProblems = await page.locator("img").evaluateAll((images) =>
      images.flatMap((image) => {
        const width = Number(image.getAttribute("width"));
        const height = Number(image.getAttribute("height"));
        if (width > 0 && height > 0) return [];
        return [image.getAttribute("src") ?? "unknown-image"];
      }),
    );
    expect(imageProblems).toEqual([]);

    const internalLinks = await page
      .locator('a[href^="/"]')
      .evaluateAll(
        (links) =>
          [...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean))] as string[],
      );
    for (const href of internalLinks) {
      if (href.startsWith("/api/")) continue;
      const linked = await request.get(href, { maxRedirects: 0 });
      expect(linked.status(), `broken internal link: ${href}`).toBeLessThan(400);
    }

    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(
      accessibility.violations.filter(
        (violation) => violation.impact === "critical" || violation.impact === "serious",
      ),
    ).toEqual([]);

    const firstLink = page.locator('a[href^="/"]').first();
    if ((await firstLink.count()) > 0) {
      await firstLink.evaluate((element) => {
        element.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            const until = performance.now() + 20;
            while (performance.now() < until) {
              // Deliberately create a measurable lab interaction without navigation.
            }
          },
          { once: true },
        );
      });
      await firstLink.click();
      await page.waitForTimeout(100);
    }

    if (route === "/") {
      const diagnostics = await page.evaluate(() => ({
        lcp: window.__homeDiagnostic?.lcp,
        longTasks: (window.__homeDiagnostic?.longTasks ?? [])
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 8),
        css: (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
          .filter((item) => item.name.includes(".css"))
          .map((item) => ({
            name: item.name.split("/").at(-1),
            start: Math.round(item.startTime),
            duration: Math.round(item.duration),
            bytes: item.transferSize,
          })),
      }));
      console.log(
        `[HOME PERF DIAGNOSTIC ${test.info().project.name}] ${JSON.stringify(diagnostics)}`,
      );
    }

    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const scripts = resources.filter((resource) => resource.initiatorType === "script");
      const images = resources.filter((resource) => resource.initiatorType === "img");
      return {
        cls: window.__cwv?.cls ?? 0,
        inp: window.__cwv?.inp ?? 0,
        lcp: window.__cwv?.lcp ?? 0,
        scriptBytes: scripts.reduce((sum, item) => sum + item.encodedBodySize, 0),
        scriptCount: scripts.length,
        oversizedImages: images
          .filter((image) => image.encodedBodySize > 500_000)
          .map((image) => ({ name: image.name, bytes: image.encodedBodySize })),
      };
    });

    expect(serverErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(metrics.cls).toBeLessThanOrEqual(0.1);
    expect(metrics.lcp).toBeGreaterThan(0);
    expect(metrics.lcp).toBeLessThanOrEqual(2500);
    expect(metrics.inp).toBeGreaterThan(0);
    expect(metrics.inp).toBeLessThanOrEqual(200);
    expect(metrics.scriptBytes).toBeLessThanOrEqual(350_000);
    expect(metrics.scriptCount).toBeLessThanOrEqual(20);
    expect(metrics.oversizedImages).toEqual([]);
  });
}

test("/find-questions stays within deterministic release budget and passes axe accessibility", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const serverErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 500) {
      serverErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  const fulfillEmptyVoteStats = async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        hasVoted: false,
        selectedOption: null,
        votesA: 0,
        votesB: 0,
        total: 0,
        percentageA: 50,
        percentageB: 50,
      }),
    });
  };

  await page.route("**/api/wyr/vote?*", fulfillEmptyVoteStats);
  await page.route("**/api/wyr/kids-vote?*", fulfillEmptyVoteStats);

  await page.addInitScript(() => {
    window.__cwv = { cls: 0, inp: 0, lcp: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) window.__cwv!.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries.at(-1);
      if (last) window.__cwv!.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const interaction = entry as PerformanceEntry & {
          duration?: number;
          interactionId?: number;
        };
        if ((interaction.interactionId ?? 0) > 0) {
          window.__cwv!.inp = Math.max(window.__cwv!.inp, interaction.duration ?? 0);
        }
      }
    }).observe({
      type: "event",
      buffered: true,
      durationThreshold: 16,
    } as PerformanceObserverInit & { durationThreshold: number });
  });

  const response = await page.goto("/find-questions", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".question-card")).toHaveCount(10);

  // Horizontal overflow check
  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(noOverflow).toBe(true);

  // Axe accessibility audit
  const accessibility = await new AxeBuilder({ page }).analyze();
  const criticalOrSerious = accessibility.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );
  expect(criticalOrSerious).toEqual([]);

  const firstSelect = page.locator(".select-button").first();
  if ((await firstSelect.count()) > 0) {
    await firstSelect.click();
    await page.waitForTimeout(50);
  }

  const metrics = await page.evaluate(() => ({
    cls: window.__cwv?.cls ?? 0,
    inp: window.__cwv?.inp ?? 0,
    lcp: window.__cwv?.lcp ?? 0,
  }));

  expect(serverErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(metrics.cls).toBeLessThanOrEqual(0.1);
  expect(metrics.lcp).toBeGreaterThan(0);
  expect(metrics.lcp).toBeLessThanOrEqual(2500);
  expect(metrics.inp).toBeLessThanOrEqual(200);
});
