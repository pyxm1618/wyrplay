import { describe, expect, it } from "vitest";
import {
  parseStoredSavedIds,
  savedQuestionCommand,
} from "@/modules/would-you-rather/domain/saved-questions";

describe("saved question boundaries", () => {
  it("deduplicates while preserving unavailable IDs", () => {
    expect(parseStoredSavedIds('["wyr-000001","future-unavailable-id","wyr-000001"]')).toEqual([
      "wyr-000001",
      "future-unavailable-id",
    ]);
  });
  it("rejects corrupt storage instead of replacing it with empty success", () => {
    for (const value of ["not-json", "{}", "[1]", '[""]'])
      expect(() => parseStoredSavedIds(value)).toThrow();
  });
  it("accepts additive import and item-level removal only", () => {
    expect(savedQuestionCommand.parse({ action: "import", ids: ["future-id"] })).toEqual({
      action: "import",
      ids: ["future-id"],
    });
    expect(savedQuestionCommand.safeParse({ action: "replace", ids: [] }).success).toBe(false);
    expect(savedQuestionCommand.safeParse({ action: "remove" }).success).toBe(false);
  });
});
