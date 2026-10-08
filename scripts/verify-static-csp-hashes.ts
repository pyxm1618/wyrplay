import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { STATIC_INLINE_HASHES } from "../src/platform/security/static-inline-hashes";

const appServerDir = path.resolve(process.cwd(), ".next/server/app");

if (!fs.existsSync(appServerDir)) {
  console.error("ERROR: Directory .next/server/app does not exist. Run build first.");
  process.exit(1);
}

function scanHtmlFiles(dir: string): string[] {
  let files: string[] = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(scanHtmlFiles(full));
    } else if (item.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = scanHtmlFiles(appServerDir);
const foundHashes = new Set<string>();
const hashToFiles = new Map<string, string[]>();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const inlines = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];

  for (const match of inlines) {
    const content = match[1];
    if (typeof content !== "string" || content.trim().length === 0) continue;
    const hash = crypto.createHash("sha256").update(content).digest("base64");
    foundHashes.add(hash);
    const existing = hashToFiles.get(hash) ?? [];
    existing.push(path.relative(appServerDir, file));
    hashToFiles.set(hash, existing);
  }
}

const compiledHashSet = new Set<string>(STATIC_INLINE_HASHES);
const missingHashes: string[] = [];

for (const hash of foundHashes) {
  if (!compiledHashSet.has(hash)) {
    missingHashes.push(hash);
  }
}

console.log("=== CSP Static Inline Hash Verification ===");
console.log(`Scanned HTML files: ${htmlFiles.length}`);
console.log(`Unique inline script hashes found: ${foundHashes.size}`);
console.log(`Compiled STATIC_INLINE_HASHES count: ${STATIC_INLINE_HASHES.length}`);

if (missingHashes.length > 0) {
  console.error(
    `\n[FAIL] Found ${missingHashes.length} missing inline hashes not present in compiled STATIC_INLINE_HASHES:`,
  );
  for (const h of missingHashes) {
    console.error(`  - ${h} (found in: ${(hashToFiles.get(h) ?? []).join(", ")})`);
  }
  process.exit(1);
}

console.log(
  `\n[PASS] All ${foundHashes.size} static inline hashes are covered by compiled STATIC_INLINE_HASHES. Missing: 0.`,
);
process.exit(0);
