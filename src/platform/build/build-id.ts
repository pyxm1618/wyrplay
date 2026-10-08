import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export function getBuildId(): string {
  const vercelCommit = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (vercelCommit) {
    return vercelCommit;
  }

  const githubCommit = process.env.GITHUB_SHA?.trim();
  if (githubCommit) {
    return githubCommit;
  }

  try {
    const gitHead = execSync("git rev-parse HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (gitHead) {
      return gitHead;
    }
  } catch {
    // Git not available or not a repository
  }

  try {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
      const content = fs.readFileSync(pkgPath, "utf8");
      return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
    }
  } catch {
    // Fallback if package.json read fails
  }

  return "wyrplay-source-revision";
}
