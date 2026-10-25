import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.resolve(file), "utf8");

describe("presentation style ownership", () => {
  it("loads presenter styles with the component on every entry route", () => {
    expect(read("src/modules/would-you-rather/ui/presenter-modal.tsx")).toContain(
      'import "./presenter.css"',
    );
    const css = read("src/modules/would-you-rather/ui/presenter.css");
    expect(css).toMatch(/\.presenter-page\s*\{[^}]*position: fixed/s);
    expect(css).toContain('import "./play/fonts.css"');
    expect(css).not.toContain('import "./play/play.css"');
  });
  it("owns option typography and constrains mobile options to the overlay content box", () => {
    const css = read("src/modules/would-you-rather/ui/presenter.css");
    expect(css).toMatch(
      /\.presenter-page \.play-options \.option-panel h2\s*\{[^}]*font: 400 70px\/1\.05 PlayHand/s,
    );
    expect(css).not.toContain(".presenter-page .option-panel h2");
    expect(css).toMatch(
      /@media \(max-width: 700px\)[\s\S]*?\.presenter-page \.play-options\s*\{[^}]*width: 100%;[^}]*margin: 0/s,
    );
  });
  it("defines print fonts without depending on play route CSS", () => {
    expect(read("src/app/(marketing)/print/print.css")).toContain(
      'import "../../../modules/would-you-rather/ui/play/fonts.css"',
    );
    const css = read("src/modules/would-you-rather/ui/play/fonts.css");
    expect(css).toContain("font-family: PlayHand");
    expect(css).toContain("font-family: PlayBody");
    expect(css).toContain('format("woff2")');
  });
  it("keeps homepage styles owned by the homepage rather than marketing layout", () => {
    expect(read("src/app/(marketing)/layout.tsx")).not.toContain('import "./home.css"');
    expect(read("src/app/(marketing)/page.tsx")).toContain('import "./home.css"');
  });
});
