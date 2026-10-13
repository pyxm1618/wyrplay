import fs from "node:fs";
import path from "node:path";

const artifactPath = path.resolve(".runtime/static-inline-hashes.json");
const artifact: unknown = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

if (
  typeof artifact !== "object" ||
  artifact === null ||
  !("all" in artifact) ||
  !Array.isArray(artifact.all) ||
  artifact.all.length === 0 ||
  !artifact.all.every(
    (hash: unknown) => typeof hash === "string" && /^[A-Za-z0-9+/]{43}=$/.test(hash),
  )
) {
  throw new Error("Cloudflare packaging requires the verified runtime CSP hash artifact");
}
if (!fs.existsSync(".open-next/worker.js")) {
  throw new Error("Cloudflare packaging requires a completed OpenNext build");
}

// Wrangler includes this exact file as a Text module in the read-only /bundle VFS.
// The existing Proxy continues to read process.cwd()/.runtime without code changes.
const packagedPath = path.resolve(".open-next/.runtime/static-inline-hashes.json");
fs.mkdirSync(path.dirname(packagedPath), { recursive: true });
fs.copyFileSync(artifactPath, packagedPath);
if (!fs.readFileSync(artifactPath).equals(fs.readFileSync(packagedPath))) {
  throw new Error("Packaged Cloudflare CSP artifact differs from the verified build artifact");
}
console.log(`Packaged verified CSP runtime artifact (${artifact.all.length} hashes)`);
