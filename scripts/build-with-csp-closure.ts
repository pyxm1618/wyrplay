import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

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

function readGeneratedHashes(tsPath: string): string {
  return fs.existsSync(tsPath) ? fs.readFileSync(tsPath, "utf8").trim() : "";
}

try {
  const tsPath = path.resolve(process.cwd(), "src/platform/security/static-inline-hashes.ts");
  const initialContent = readGeneratedHashes(tsPath);

  // Build A establishes the current static HTML for this exact source revision.
  runCommand("next build --webpack", "Build A");
  console.log("✓ Build A completed successfully.");

  // Generate the hash set required by Build A.
  runCommand("bun scripts/generate-static-csp-hashes.ts", "Generate Hashes A");
  console.log("✓ Static CSP hashes extracted from Build A.");

  const hashesA = readGeneratedHashes(tsPath);

  if (initialContent !== hashesA) {
    console.log(
      "\n[Notice] Static hashes changed after Build A. Running Build B to compile the new set...",
    );

    // Build B compiles hashesA into Proxy.
    runCommand("next build --webpack", "Build B");
    console.log("✓ Build B completed with hashes from Build A.");

    // Re-read Build B's HTML. If it drifted because the generated hash module
    // changed the bundle graph, allow exactly one bounded convergence build.
    runCommand("bun scripts/generate-static-csp-hashes.ts", "Generate Hashes B");
    const hashesB = readGeneratedHashes(tsPath);

    if (hashesB !== hashesA) {
      console.log(
        "\n[Notice] Build B produced a different static hash set. Running one final bounded Build C...",
      );

      // Build C compiles hashesB. No further rebuild is allowed: the final
      // verification below fails closed if Build C still does not match.
      runCommand("next build --webpack", "Build C");
      console.log("✓ Build C completed with hashes from Build B.");
    } else {
      console.log("\n✓ Build B hash set is stable; no third build is required.");
    }
  } else {
    console.log(
      "\n✓ Committed static hashes already match Build A. No convergence rebuild is required.",
    );
  }

  // Verify the final build's actual inline hashes are covered by the exact
  // hash set compiled into its Proxy bundle. Any further drift fails closed.
  runCommand("bun scripts/verify-static-csp-hashes.ts", "Verify Final Build Hashes");
  console.log("✓ Final build CSP hashes verified successfully.");

  console.log("\n====================================================");
  console.log("Build with CSP Closure completed successfully (PASS)");
  console.log("====================================================");
} catch (error) {
  console.error("\n[FAIL] Build with CSP Closure encountered an error:", error);
  process.exit(1);
}
