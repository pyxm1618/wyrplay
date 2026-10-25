import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import {
  projectQuestionsForClient,
  QUESTIONS_DATABASE,
} from "@/modules/would-you-rather/data/questions";
import { filterFinderQuestions } from "@/modules/would-you-rather/domain/finder";
import { filterPrintQuestions } from "@/modules/would-you-rather/domain/print-question-pool";
import { resolveQuestionPool } from "@/modules/would-you-rather/domain/question-pool";
import { getPrintSheetRowContent } from "@/modules/would-you-rather/domain/print-layout";
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

it("projects only client-required question fields without changing interactive filtering", () => {
  const projected = projectQuestionsForClient(QUESTIONS_DATABASE);
  expect(projected).toHaveLength(QUESTIONS_DATABASE.length);
  expect(JSON.stringify(projected).length).toBeLessThan(
    JSON.stringify(QUESTIONS_DATABASE).length,
  );

  for (const omitted of [
    "reviewNotes",
    "primaryAgeBand",
    "scenarios",
    "collections",
    "audience",
    "occasion",
    "style",
  ]) {
    expect(projected[0]).not.toHaveProperty(omitted);
  }

  expect(filterFinderQuestions(projected, { age: "kids" }).map((q) => q.id)).toEqual(
    filterFinderQuestions(QUESTIONS_DATABASE, { age: "kids" }).map((q) => q.id),
  );
  expect(filterPrintQuestions(projected, { collection: "funny" }).map((q) => q.id)).toEqual(
    filterPrintQuestions(QUESTIONS_DATABASE, { collection: "funny" }).map((q) => q.id),
  );
  expect(filterPrintQuestions(projected, { occasion: "party" }).map((q) => q.id)).toEqual(
    filterPrintQuestions(QUESTIONS_DATABASE, { occasion: "party" }).map((q) => q.id),
  );
  expect(resolveQuestionPool(projected, null).map((q) => q.id)).toEqual(
    resolveQuestionPool(QUESTIONS_DATABASE, null).map((q) => q.id),
  );
});

it("uses the real open topic contract and exposes both sheet option labels", () => {
  const validationSource = readFileSync(
    "src/modules/would-you-rather/domain/validation.ts",
    "utf8",
  );
  expect(validationSource).not.toContain("VALID_TOPICS");

  const question = QUESTIONS_DATABASE[0]!;
  expect(getPrintSheetRowContent(question)).toEqual({
    question: question.question,
    optionA: `A: ${question.optionA}`,
    optionB: `B: ${question.optionB}`,
  });
});
