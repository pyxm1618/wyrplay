import { expect, it } from "vitest";
import { crossesDocumentBoundary } from "@/platform/advertising/adsense-routes";
it("uses document navigation across the home and child-directed policy boundaries", () => {
  for (const destination of [
    "/",
    "/?open-privacy-settings=1",
    "/#categories",
    "/would-you-rather-questions-for-kids",
    "/would-you-rather-questions-for-kids#play",
  ]) {
    expect(crossesDocumentBoundary("/find-questions", destination)).toBe(true);
  }
  expect(crossesDocumentBoundary("/would-you-rather-questions-for-kids", "/find-questions")).toBe(
    true,
  );
  expect(crossesDocumentBoundary("/", "/play")).toBe(true);
  expect(crossesDocumentBoundary("/find-questions", "/play")).toBe(false);
  expect(crossesDocumentBoundary("/", "/#play")).toBe(false);
});
