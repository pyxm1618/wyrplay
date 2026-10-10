import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const appServerDir = path.resolve(process.cwd(), ".next/server/app");

if (!fs.existsSync(appServerDir)) {
  console.warn("Directory .next/server/app does not exist yet. Skipping hash extraction.");
  process.exit(0);
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
const routeHashes: Record<string, string[]> = {};
const allHashes = new Set<string>();

for (const file of htmlFiles) {
  const relative = path.relative(appServerDir, file);
  let route = "/" + relative.replace(/\.html$/, "").replace(/(?:^|\/)index$/, "");
  if (route === "") route = "/";

  const html = fs.readFileSync(file, "utf8");
  const inlines = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
  const pageHashes: string[] = [];

  for (const match of inlines) {
    const content = match[1];
    if (typeof content !== "string" || content.trim().length === 0) continue;
    const hash = crypto.createHash("sha256").update(content).digest("base64");
    pageHashes.push(hash);
    allHashes.add(hash);
  }

  routeHashes[route] = pageHashes;
}

const outputPayload = {
  routes: routeHashes,
  all: [...allHashes].sort(),
};
const serializedPayload = JSON.stringify(outputPayload, null, 2) + "\n";

const diagnosticJsonPath = path.resolve(process.cwd(), ".next/static-inline-hashes.json");
fs.writeFileSync(diagnosticJsonPath, serializedPayload, "utf8");

const runtimeJsonPath = path.resolve(process.cwd(), ".runtime/static-inline-hashes.json");
fs.mkdirSync(path.dirname(runtimeJsonPath), { recursive: true });
fs.writeFileSync(runtimeJsonPath, serializedPayload, "utf8");

console.log(
  `Successfully generated static inline CSP hashes for ${Object.keys(routeHashes).length} routes (total unique: ${outputPayload.all.length}) to .next/static-inline-hashes.json and .runtime/static-inline-hashes.json`,
);
