import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const projectRoot = process.cwd();

// 1. Load Vercel launcher from .vercel/output
const launcherPath = path.resolve(
  projectRoot,
  ".vercel/output/functions/_middleware.func/___next_launcher.cjs",
);
if (!fs.existsSync(launcherPath)) {
  console.error("Vercel launcher not found at", launcherPath);
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const launcher = require(launcherPath);

const outputDir = path.resolve(projectRoot, ".vercel/output");
const staticDir = path.join(outputDir, "static");
const functionsDir = path.join(outputDir, "functions");

// Map routes to their prerendered HTML file in .vercel/output
const prerenderMap: Record<string, string> = {
  "/find-questions": path.join(functionsDir, "find-questions.prerender-fallback.html"),
  "/play": path.join(functionsDir, "play.prerender-fallback.html"),
  "/print": path.join(functionsDir, "print.prerender-fallback.html"),
  "/would-you-rather-questions-for-kids": path.join(
    functionsDir,
    "would-you-rather-questions-for-kids.prerender-fallback.html",
  ),
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1:4100"}`);
    const rawPathname = url.pathname;
    const pathname = decodeURIComponent(rawPathname);

    // Static asset handling (/_next/static/*, fonts, images, etc.)
    if (pathname.startsWith("/_next/static/")) {
      const relPath = pathname.replace(/^\/_next\/static\//, "");
      const filePath = path.join(staticDir, "_next/static", relPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimeTypes: Record<string, string> = {
          ".js": "application/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".woff2": "font/woff2",
          ".png": "image/png",
        };
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    // Public assets directly from staticDir
    const possibleStaticFile = path.join(staticDir, pathname);
    if (fs.existsSync(possibleStaticFile) && fs.statSync(possibleStaticFile).isFile()) {
      res.writeHead(200);
      fs.createReadStream(possibleStaticFile).pipe(res);
      return;
    }

    // Run Vercel middleware launcher
    const middlewareReq = {
      url: `https://preview.wyrplay.com${pathname}`,
      method: req.method || "GET",
      headers: new Headers(req.headers as Record<string, string>),
    };
    const middlewareRes = await launcher(middlewareReq);

    const headers: Record<string, string | string[]> = {};
    if (middlewareRes.headers) {
      if (typeof middlewareRes.headers.forEach === "function") {
        middlewareRes.headers.forEach((v: string, k: string) => {
          headers[k.toLowerCase()] = v;
        });
      } else {
        for (const [k, v] of Object.entries(middlewareRes.headers)) {
          headers[k.toLowerCase()] = v as string;
        }
      }
    }

    const prerenderFile = prerenderMap[pathname];
    console.log(
      `[Server] ${req.method} ${pathname} -> prerender: ${prerenderFile} (exists: ${prerenderFile && fs.existsSync(prerenderFile)})`,
    );
    if (prerenderFile && fs.existsSync(prerenderFile)) {
      const htmlContent = fs.readFileSync(prerenderFile);
      headers["content-type"] = "text/html; charset=utf-8";
      res.writeHead(200, headers);
      res.end(htmlContent);
      return;
    }

    console.log(`[Server] Not found: ${pathname}`);
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not Found in mock server");
  } catch (err) {
    console.error("Server error:", err);
    res.writeHead(500, { "content-type": "text/plain" });
    res.end("Internal error");
  }
});

const PORT = 4123;

async function runVerification() {
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`Vercel output verification server running at http://127.0.0.1:${PORT}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const testRoutes = [
    {
      path: "/find-questions",
      name: "Find Questions",
      interactiveCheck: async () => {
        // Find Questions search input or category button
        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
        if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await searchInput.fill("party");
          console.log("  ✓ Search input filled successfully");
        } else {
          // Check category pill or button
          const button = page.locator("button").first();
          if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
            await button.click();
            console.log("  ✓ Filter button clickable");
          }
        }
      },
    },
    {
      path: "/play",
      name: "Play",
      interactiveCheck: async () => {
        // Choice buttons in game
        const choiceButton = page.locator("button").first();
        if (await choiceButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await choiceButton.click();
          console.log("  ✓ Play choice button clicked");
        }
      },
    },
    {
      path: "/print",
      name: "Print",
      interactiveCheck: async () => {
        // Print preset button
        const button = page.locator("button").first();
        if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
          await button.click();
          console.log("  ✓ Print preset button clicked");
        }
      },
    },
    {
      path: "/would-you-rather-questions-for-kids",
      name: "Kids SEO Landing",
      interactiveCheck: async () => {
        // Vote button or next question button
        const button = page.locator("button").first();
        if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
          await button.click();
          console.log("  ✓ Kids question button clicked");
        }
      },
    },
  ];

  let allPassed = true;

  for (const route of testRoutes) {
    console.log(`\n--- Testing ${route.name} (${route.path}) ---`);
    const cspViolations: string[] = [];
    const hydrationErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (
        text.toLowerCase().includes("content security policy") ||
        text.toLowerCase().includes("violates the following content security policy") ||
        text.toLowerCase().includes("refused to execute") ||
        text.toLowerCase().includes("refused to apply")
      ) {
        cspViolations.push(text);
      }
      if (
        text.includes("Minified React error #418") ||
        text.includes("Minified React error #423") ||
        text.includes("Minified React error #425") ||
        text.includes("Hydration failed") ||
        text.includes("Text content does not match server-rendered HTML")
      ) {
        hydrationErrors.push(text);
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    const response = await page.goto(`http://127.0.0.1:${PORT}${route.path}`, {
      waitUntil: "networkidle",
    });

    const cspHeader = response?.headers()["content-security-policy"];
    console.log("Status:", response?.status());
    console.log("CSP Header present:", !!cspHeader);
    const hashCount = (cspHeader?.match(/sha256-/g) || []).length;
    console.log("CSP sha256 hashes count:", hashCount);
    console.log("CSP nonce present:", cspHeader?.includes("nonce-"));

    // Wait a moment for any hydration or asynchronous execution
    await page.waitForTimeout(1000);

    // Perform interactive check
    await route.interactiveCheck();

    console.log("CSP violations:", cspViolations.length);
    if (cspViolations.length > 0) {
      console.error("  Details:", cspViolations);
      allPassed = false;
    }

    console.log("Hydration errors:", hydrationErrors.length);
    if (hydrationErrors.length > 0) {
      console.error("  Details:", hydrationErrors);
      allPassed = false;
    }

    console.log("Page errors:", pageErrors.length);
    if (pageErrors.length > 0) {
      console.error("  Details:", pageErrors);
      allPassed = false;
    }

    if (
      cspViolations.length === 0 &&
      hydrationErrors.length === 0 &&
      pageErrors.length === 0 &&
      hashCount > 0
    ) {
      console.log(`✅ ${route.name} passed all checks!`);
    } else {
      console.error(`❌ ${route.name} failed checks!`);
      allPassed = false;
    }
  }

  await browser.close();
  server.close();

  if (!allPassed) {
    console.error("\n❌ Vercel output CSP verification FAILED.");
    process.exit(1);
  } else {
    console.log("\n✅ All 4 routes passed Vercel runtime CSP & hydration verification!");
    process.exit(0);
  }
}

runVerification().catch((err) => {
  console.error("Verification script crashed:", err);
  process.exit(1);
});
