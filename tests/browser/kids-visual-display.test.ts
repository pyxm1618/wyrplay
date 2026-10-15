import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import { hasQuestionVisual } from "@/modules/would-you-rather/data/question-visuals";
import { KidsChoicePanels } from "@/modules/would-you-rather/ui/kids/art";

it("all 21 registered questions inherit square image-first cards while unregistered cards retain their fallback", async () => {
  const illustrated = QUESTIONS_DATABASE.filter((q) => hasQuestionVisual(q.id));
  expect(illustrated).toHaveLength(21);
  const fallback = QUESTIONS_DATABASE.find((q) => !hasQuestionVisual(q.id));
  if (!fallback) throw new Error("Missing unregistered fallback question");
  const styles = [
    "src/app/[segment]/kids.css",
    "src/modules/would-you-rather/ui/question-visual.css",
  ]
    .map((p) => readFileSync(p, "utf8"))
    .join("\n");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const markup = [...illustrated, fallback]
      .map((q) =>
        renderToStaticMarkup(
          createElement(KidsChoicePanels, { questionId: q.id, a: q.optionA, b: q.optionB }),
        ),
      )
      .join("");
    await page.setContent(
      `<style>*{box-sizing:border-box}${styles}</style><div class="kids-page">${markup}</div>`,
    );
    const choices = page.locator(".kids-choices");
    for (let index = 0; index < illustrated.length; index++) {
      const cards = choices.nth(index).locator(".kids-choice");
      const heights: number[] = [];
      for (const card of await cards.all()) {
        const box = (await card.boundingBox())!;
        const image = (await card.locator(".kids-choice-visual").boundingBox())!;
        const caption = (await card.locator(".kids-choice-text").boundingBox())!;
        expect(image.width, illustrated[index]!.id).toBeGreaterThan(box.width * 0.9);
        expect(image.height).toBeCloseTo(image.width, 0);
        expect(caption.y).toBeGreaterThanOrEqual(image.y + image.height);
        heights.push(box.height);
      }
      expect(heights[0]).toBe(heights[1]);
    }
    const original = choices.last();
    expect(await original.locator(".kids-choice-visual").count()).toBe(0);
    expect(await original.locator(".kids-choice-doodles").count()).toBe(2);
    expect(
      await original
        .locator(".kids-choice-frame")
        .first()
        .evaluate((e) => getComputedStyle(e).display),
    ).not.toBe("none");
  } finally {
    await browser.close();
  }
}, 30_000);
