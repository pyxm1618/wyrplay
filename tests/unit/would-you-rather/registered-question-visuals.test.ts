import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/would-you-rather/data/question-visuals", () => ({
  hasQuestionVisual: (id: string) => id === "test-registered-visual",
  getQuestionVisual: (id: string) =>
    id === "test-registered-visual"
      ? { src: "/play-art/logo.png", width: 200, height: 100, alt: "Test artwork" }
      : undefined,
}));

import { KidsChoicePanels } from "@/modules/would-you-rather/ui/kids/art";

describe("registered kids question artwork", () => {
  it("keeps the colored choice frames behind the artwork, labels and selected badge", () => {
    const html = renderToStaticMarkup(
      createElement(KidsChoicePanels, {
        questionId: "test-registered-visual",
        a: "First choice",
        b: "Second choice",
        selected: "A",
        onChoose: () => {},
      }),
    );
    expect(html.match(/class="kids-choice-frame"/g)).toHaveLength(2);
    expect(html.match(/class="kids-choice-visual"/g)).toHaveLength(2);
    expect(html).toContain("First choice");
    expect(html).toContain("Second choice");
    expect(html).toContain("Your choice ✓");
  });
});
