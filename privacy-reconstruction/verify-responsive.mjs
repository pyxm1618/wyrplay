import { chromium } from "@playwright/test";

const b = await chromium.launch({ headless: true });
const p = await b.newPage();
await p.goto("http://127.0.0.1:3210/privacy");
await p.waitForSelector(".privacy-hero");
await p.waitForTimeout(1000);

const viewports = [
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

const results = [];
for (const vp of viewports) {
  await p.setViewportSize({ width: vp.width, height: vp.height });
  await p.waitForTimeout(500);
  const scrollWidth = await p.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await p.evaluate(() => document.documentElement.clientWidth);
  const overflow = scrollWidth > clientWidth;
  await p.screenshot({
    path: `privacy-reconstruction/round-01/report/candidate-${vp.name}.png`,
    fullPage: false,
  });
  results.push({ name: vp.name, width: vp.width, scrollWidth, clientWidth, overflow });
}

console.log(JSON.stringify(results, null, 2));
await b.close();
