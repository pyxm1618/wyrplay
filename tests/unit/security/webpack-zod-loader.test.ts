import { describe, expect, it } from "vitest";
import { z } from "zod";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const zodCspLoader = require("../../../scripts/webpack-zod-csp-loader.cjs");

describe("webpack-zod-csp-loader", () => {
  const mockZodUtilSnippet = `
export const allowsEval = cached(() => {
    if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
        return false;
    }
    try {
        const F = Function;
        new F("");
        return true;
    }
    catch (_) {
        return false;
    }
});
export function isPlainObject(o) { return true; }
`;

  it("replaces the exact allowsEval Function probe with 'return false;'", () => {
    const transformed = zodCspLoader.call(
      { resourcePath: "/node_modules/zod/v4/core/util.js" },
      mockZodUtilSnippet,
    );

    expect(transformed).not.toContain("const F = Function");
    expect(transformed).not.toContain('new F("")');
    expect(transformed).toContain("return false;");
    expect(transformed).toContain("export function isPlainObject(o)");
  });

  it("fails closed when the probe pattern is not found in the input", () => {
    const sourceWithoutProbe = `
export function isPlainObject(o) {
  return typeof o === "object" && o !== null;
}
`;

    expect(() => {
      zodCspLoader.call({ resourcePath: "/node_modules/zod/v4/core/util.js" }, sourceWithoutProbe);
    }).toThrowError(/Failed to locate 'allowsEval' Function probe/);
  });

  it("fails closed when non-string source is passed", () => {
    expect(() => {
      zodCspLoader(12345);
    }).toThrowError(TypeError);
  });

  it("verifies that Zod schemas and validation behavior remain intact", () => {
    const schema = z.object({
      id: z.string().min(1),
      count: z.number().int().positive(),
      tags: z.array(z.string()),
    });

    const validData = { id: "wyr-001", count: 42, tags: ["fun", "party"] };
    const parsed = schema.parse(validData);
    expect(parsed).toEqual(validData);

    const invalidResult = schema.safeParse({ id: "", count: -1, tags: "not-an-array" });
    expect(invalidResult.success).toBe(false);
  });
});
