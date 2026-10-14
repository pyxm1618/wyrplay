// Read-only browser measurement against a built local application.
// Run before/after with the same environment, viewport and database snapshot.
import { chromium } from "@playwright/test";
import fs from "node:fs";
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => localStorage.setItem("creat-web:analytics-consent:v1", "denied"));
  const scriptReads = [];
  const collectHomeScript = (response) => {
    if (new URL(response.url()).pathname.endsWith(".js")) scriptReads.push(response.text());
  };
  page.on("response", collectHomeScript);
  const response = await page.goto(
    (process.env.CLOSEOUT_BASE_URL || "http://localhost:3000") + "/",
  );
  if (response?.status() !== 200) throw new Error("Homepage must return HTTP 200");
  const html = await response.text();
  await page.locator("[data-home-ready=true]").waitFor();
  await page.waitForLoadState("networkidle");
  page.off("response", collectHomeScript);
  const scripts = await Promise.all(scriptReads);
  const metrics = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) {
      const node = walker.currentNode,
        parent = node.parentElement;
      if (
        !parent ||
        [
          ...(function* () {
            for (let e = parent; e; e = e.parentElement) yield e;
          })(),
        ].some(
          (e) => e.tagName === "DETAILS" && !e.open && !e.querySelector("summary")?.contains(node),
        ) ||
        parent.closest('script,style,noscript,template,[hidden],[aria-hidden="true"]')
      )
        continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      if (![...range.getClientRects()].some((r) => r.width && r.height)) continue;
      let hidden = false;
      for (let p = parent; p; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) {
          hidden = true;
          break;
        }
      }
      if (!hidden) texts.push(node.textContent);
    }
    const text = texts.join(" ").replace(/\s+/g, " ").trim();
    const words = text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) || [];
    const exact = (text.match(/\bwould you rather questions\b/gi) || []).length;
    return {
      domNodes: document.querySelectorAll("*").length,
      directoryItems: document.querySelectorAll(".home-directory-semantic-item").length,
      visibleWords: words.length,
      exactOccurrences: exact,
      density: (exact / words.length) * 100,
      text,
      title: document.title,
      h1: document.querySelector("h1")?.textContent,
      canonical: document.querySelector("link[rel=canonical]")?.href,
      description: document.querySelector("meta[name=description]")?.content,
      structuredData: [...document.querySelectorAll('script[type="application/ld+json"]')].map(
        (e) => JSON.parse(e.textContent),
      ),
      faq: [...document.querySelectorAll(".home-faq details")].map((e) => e.textContent),
      categoryLinks: [...document.querySelectorAll("#categories a")].map((e) =>
        e.getAttribute("href"),
      ),
      robots: document.querySelector("meta[name=robots]")?.content,
    };
  });
  const bank = JSON.parse(
    fs.readFileSync(process.cwd() + "/content/question-bank/questions.json", "utf8"),
  );
  const items = Array.isArray(bank) ? bank : bank.questions;
  const corpus = scripts.join("\n");
  const bankIds = items.filter((q) => corpus.includes(q.id)).length;
  const inHtml = items.filter((q) => html.includes(q.id)).length;
  let votes = [];
  page.on("request", (r) => {
    if (/\/api\/wyr\/(vote|kids-vote|vote-stats)/.test(r.url())) votes.push(r.url());
  });
  await page.goto((process.env.CLOSEOUT_BASE_URL || "http://localhost:3000") + "/find-questions");
  await page.waitForLoadState("networkidle");
  console.log(
    JSON.stringify(
      {
        htmlBytes: Buffer.byteLength(html),
        ...metrics,
        jsBytes: scripts.reduce((n, s) => n + Buffer.byteLength(s), 0),
        bankIdsInHomeJS: bankIds,
        bankQuestionsInHomeJS: items.filter((q) => corpus.includes(q.question)).length,
        bankIdsInHomeHTML: inHtml,
        finderRequests: votes.length,
        finderRequestURLs: votes,
        total: items.length,
        approved: items.filter((q) => q.reviewStatus === "approved").length,
        duplicates: items.length - new Set(items.map((q) => q.id)).size,
      },
      null,
      2,
    ),
  );
  await browser.close();
})();
