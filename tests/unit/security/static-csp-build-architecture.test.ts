import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("static CSP build architecture", () => {
  it("builds Next.js once and prepares a traced runtime artifact before that build", () => {
    const source = read("scripts/build-with-csp-closure.ts");
    const builds = source.match(/next build --webpack/g) ?? [];
    expect(builds).toHaveLength(1);
    expect(source).toContain(".runtime/static-inline-hashes.json");
  });

  it("generates runtime hash artifacts without rewriting compiled TypeScript source", () => {
    const source = read("scripts/generate-static-csp-hashes.ts");
    expect(source).toContain(".runtime/static-inline-hashes.json");
    expect(source).not.toContain("src/platform/security/static-inline-hashes.ts");
  });

  it("loads static-page CSP hashes from the runtime artifact before falling back", () => {
    const source = read("src/proxy.ts");
    expect(source).toContain(".runtime/static-inline-hashes.json");
    expect(source).toContain("STATIC_INLINE_HASHES");
  });
});
