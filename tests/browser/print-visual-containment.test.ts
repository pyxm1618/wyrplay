import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

const printSettings = vi.hoisted(() => ({ paper: "a4" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(`paper=${printSettings.paper}&format=cards`),
}));
vi.mock("@/modules/would-you-rather/data/question-visuals", () => ({
  getQuestionVisual: (id: string) =>
    id === "wyr-000503"
      ? {
          // Test-only master; no production artwork is registered.
          src: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="100" height="100" fill="red"/><rect x="100" width="100" height="100" fill="blue"/></svg>')}`,
          width: 200,
          height: 100,
          alt: "Test-only left red and right blue master",
        }
      : undefined,
}));

import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import { createPrintLayout } from "@/modules/would-you-rather/domain/print-layout";
import { PrintPage } from "@/modules/would-you-rather/ui/play/print-page";

it("keeps illustrated captions inside native A4 and Letter card cut lines", async () => {
  const question = QUESTIONS_DATABASE.find((item) => item.id === "wyr-000503");
  if (!question) throw new Error("Approved long-caption regression question is missing");
  const questions = Array(4).fill(question);
  const styles = readFileSync(resolve("src/modules/would-you-rather/ui/play/print.css"), "utf8");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ media: "print" });
    for (const paper of ["a4", "letter"] as const) {
      printSettings.paper = paper;
      const layout = createPrintLayout(questions, "cards", paper, (text) => text.length * 6.2);
      const markup = renderToStaticMarkup(
        createElement(PrintPage, { questions, authEnabled: false }),
      );
      // Relevant application preflight rules accompany its actual print stylesheet.
      await page.setContent(
        `<style>*{box-sizing:border-box}body{margin:0;font-family:Arial}h3,p{margin:0}img{display:block;max-width:100%}${styles}</style>${markup}`,
      );
      await page
        .locator('.print-document img[src^="data:image/svg+xml"]')
        .evaluateAll((images) =>
          Promise.all(images.map((image) => (image as HTMLImageElement).decode())),
        );
      const cards = await page.locator(".print-page-sheet").evaluateAll((sheets) =>
        sheets.flatMap((sheet) =>
          Array.from(sheet.children).map((placement) => {
            const card = placement.firstElementChild;
            if (!card) throw new Error("Print placement has no card content");
            return {
              bottom: card.getBoundingClientRect().bottom,
              captions: Array.from(card.querySelectorAll("p")).map((caption) => ({
                text: caption.textContent,
                bottom: caption.getBoundingClientRect().bottom,
              })),
            };
          }),
        ),
      );
      expect(cards).toHaveLength(layout.pages.flat().length);
      expect(cards).toHaveLength(4);
      for (const [index, card] of cards.entries()) {
        expect(card.captions.map((caption) => caption.text)).toEqual([
          question.optionA,
          question.optionB,
        ]);
        for (const caption of card.captions) {
          expect(
            caption.bottom,
            `${paper} card ${index + 1}: ${JSON.stringify(caption.text)}`,
          ).toBeLessThanOrEqual(card.bottom + 0.5);
        }
      }
    }
  } finally {
    await browser.close();
  }
}, 30_000);
