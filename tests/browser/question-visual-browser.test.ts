import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("@/modules/would-you-rather/data/question-visuals", () => ({
  getQuestionVisual: () => ({
    // Edge markers expose horizontal cropping without a production asset registration.
    src: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><path fill="#ff0000" d="M0 0h20v100H0z"/><path fill="#00ff00" d="M20 0h160v100H20z"/><path fill="#0000ff" d="M180 0h20v100h-20z"/></svg>')}`,
    width: 200,
    height: 100,
    alt: "Test master with distinct left and right edges",
  }),
}));

import { QuestionVisual } from "@/modules/would-you-rather/ui/question-visual";

it("preserves both edges of a full master inside Finder's forced thumbnail dimensions", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const visualMarkup = renderToStaticMarkup(
      createElement(QuestionVisual, {
        questionId: "test-only-visual",
        mode: "full",
        className: "question-art",
      }),
    );
    const styles = [
      "src/modules/would-you-rather/ui/question-visual.css",
      "src/modules/would-you-rather/ui/finder/finder.css",
      "src/modules/would-you-rather/ui/finder/finder-responsive.css",
    ]
      .map((path) => readFileSync(resolve(path), "utf8"))
      .join("\n");
    await page.setContent(`<style>${styles}</style><div class="finder-page">${visualMarkup}</div>`);
    const frame = page.locator(".question-visual-frame");
    await page.locator(".question-visual-img").evaluate(async (image) => {
      await (image as HTMLImageElement).decode();
    });
    // Verify desktop and both mobile thumbnail constraints using the real stylesheet.
    for (const [width, thumbnailWidth, thumbnailHeight] of [
      [1280, 111, 83],
      [900, 90, 68],
      [600, 74, 55],
    ] as const) {
      await page.setViewportSize({ width, height: 800 });
      const bounds = await frame.boundingBox();
      expect(bounds?.width).toBe(thumbnailWidth);
      expect(bounds?.height).toBe(thumbnailHeight);
      const edgePixels = await page.evaluate(
        async (screenshot) => {
          const captured = new window.Image();
          captured.src = `data:image/png;base64,${screenshot}`;
          await captured.decode();
          const canvas = document.createElement("canvas");
          canvas.width = captured.width;
          canvas.height = captured.height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Screenshot canvas context unavailable");
          context.drawImage(captured, 0, 0);
          const centerRow = Math.floor(captured.height / 2);
          return [2, captured.width - 3].map((x) =>
            [...context.getImageData(x, centerRow, 1, 1).data].slice(0, 3),
          );
        },
        (await frame.screenshot()).toString("base64"),
      );
      expect(edgePixels[0], `left master edge at viewport ${width}`).toEqual([255, 0, 0]);
      expect(edgePixels[1], `right master edge at viewport ${width}`).toEqual([0, 0, 255]);
    }
  } finally {
    await browser.close();
  }
}, 30_000);
