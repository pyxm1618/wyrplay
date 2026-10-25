import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather/data/questions";
import { CategoryExplorer } from "@/modules/would-you-rather/ui/category-explorer";
import { QuestionDirectory } from "@/modules/would-you-rather/ui/question-directory";

it("preserves raw scenario and deep mood tags without duplicates", () => {
  for (const q of QUESTIONS_DATABASE) {
    for (const scenario of ["sleepover", "icebreakers", "birthday-party"]) {
      if (q.scenarios?.includes(scenario)) expect(q.occasions).toContain(scenario);
    }
    if (q.moods?.some((mood) => mood === "deep" || mood === "thoughtful"))
      expect(q.tones).toContain("deep");
    expect(q.tones).toEqual([...new Set(q.tones)]);
    expect(q.suitability.workplace).toBe("unreviewed");
  }
});
it("links Finder categories without truncating description text", () => {
  const html = renderToStaticMarkup(createElement(CategoryExplorer));
  expect(html).toContain("/find-questions?age=adults");
  expect(html).toContain("/find-questions?occasion=icebreakers");
  expect(html).toContain("High-energy fun suitable for guests of all ages");
});
it("server renders a bounded directory with an accessible show-more action", () => {
  const html = renderToStaticMarkup(
    createElement(QuestionDirectory, { questions: QUESTIONS_DATABASE }),
  );
  expect(html.match(/<article/g)).toHaveLength(20);
  expect(html).toContain("Show more");
});
it("aligns dark utilities with the root manual theme", () => {
  expect(readFileSync("src/app/globals.css", "utf8")).toContain(
    '@custom-variant dark (&:where(html[data-theme="dark"], html[data-theme="dark"] *));',
  );
});
