import { execSync } from "node:child_process";

console.log("====================================================");
console.log("Starting Next.js Build with CSP Hash Closure");
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
  // 1. Build A
  runCommand("next build --webpack", "Build A");
  console.log("✓ Build A completed successfully.");

  // 2. Generate Hashes from Build A
  runCommand("bun scripts/generate-static-csp-hashes.ts", "Generate Hashes");
  console.log("✓ Static CSP hashes generated from Build A.");

  // 3. Build B (Compile with updated static-inline-hashes.ts)
  runCommand("next build --webpack", "Build B");
  console.log("✓ Build B completed with updated compiled hashes.");

  // 4. Verify Final Build Hashes
  runCommand("bun scripts/verify-static-csp-hashes.ts", "Verify Final Build Hashes");
  console.log("✓ Final build CSP hashes verified successfully.");

  console.log("\n====================================================");
  console.log("Build with CSP Closure completed successfully (PASS)");
  console.log("====================================================");
} catch (error) {
  console.error("\n[FAIL] Build with CSP Closure encountered an error:", error);
  process.exit(1);
}
