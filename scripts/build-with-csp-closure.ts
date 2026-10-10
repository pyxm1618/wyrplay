import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

console.log("====================================================");
console.log("Starting Next.js Build with CSP Runtime Hash Artifact");
console.log("====================================================");

const buildEnv = {
  ...process.env,
  APP_ENV: process.env.APP_ENV ?? "local",
  APP_ORIGIN: process.env.APP_ORIGIN ?? "http://localhost:3000",
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/creat_web_local",
};

function runCommand(cmd: string, stepName: string) {
  console.log(`\n[STEP: ${stepName}] Running: ${cmd}`);
  execSync(cmd, {
    stdio: "inherit",
    env: buildEnv,
  });
}

try {
  const runtimeHashPath = path.resolve(process.cwd(), ".runtime/static-inline-hashes.json");
  fs.mkdirSync(path.dirname(runtimeHashPath), { recursive: true });
  fs.writeFileSync(
    runtimeHashPath,
    JSON.stringify({ routes: {}, all: [] }, null, 2) + "\n",
    "utf8",
  );

  // Build exactly once. The final static HTML produced here is authoritative.
  runCommand("next build --webpack", "Production Build");
  console.log("✓ Production build completed successfully.");

  // Extract hashes after the build into runtime data files. These artifacts are
  // read by Proxy at request time and never feed back into this build graph.
  runCommand("bun scripts/generate-static-csp-hashes.ts", "Generate Runtime CSP Hashes");
  console.log("✓ Runtime CSP hash artifacts generated from the final build.");

  runCommand("bun scripts/verify-static-csp-hashes.ts", "Verify Final Build Hashes");
  console.log("✓ Final build CSP hashes verified successfully.");

  console.log("\n====================================================");
  console.log("Build with CSP Runtime Hash Artifact completed successfully (PASS)");
  console.log("====================================================");
} catch (error) {
  console.error("\n[FAIL] Build with CSP Runtime Hash Artifact encountered an error:", error);
  process.exit(1);
}
