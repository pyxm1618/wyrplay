import { expect, test } from "@playwright/test";

const viewportSelector = "[data-home-badge-marquee='viewport']";
const trackSelector = "[data-home-badge-marquee='track']";
const primaryGroupSelector = "[data-home-badge-group='primary']";
const cloneGroupSelector = "[data-home-badge-group='clone']";
const footerSelector = "[data-site-footer]";
const badgeAfterFooterSelector =
  "xpath=//*[@data-site-footer]/following::*[@data-home-startup-fame-badge]";
const betterLaunchBadgeSelector = "[data-home-better-launch-badge]";

const EXPECTED_BADGES = [
  {
    href: "https://startupfa.me/s/wyrplay?utm_source=www.wyrplay.com",
    src: "https://startupfa.me/badge?t=small&theme=default",
    alt: "WYR Play - Featured on Startup Fame",
    width: "240",
    height: "36",
  },
  {
    href: "https://www.betterlaunch.co/product/wyr-play",
    src: "https://www.betterlaunch.co/badge-live-gradient.svg",
    alt: "Launching on Better Launch",
    width: "200",
    height: "56",
  },
  {
    href: "https://shipstry.com/",
    src: "https://shipstry.com/badges/featured.svg",
    alt: "Featured on Shipstry",
    width: "220",
    height: "52",
  },
  {
    href: "https://startupbase.io/products/wyr-play?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light",
    src: "https://statics.startupbase.io/site/badges/launched-on-sb.svg",
    alt: "Launched on StartupBase",
    width: "206.25",
    height: "55",
  },
  {
    href: "https://firstlook.tools",
    src: "https://firstlook.tools/badge/badge_light.svg",
    alt: "Featured on First Look",
    width: "200",
    height: "54",
  },
  {
    href: "https://twelve.tools",
    src: "https://twelve.tools/badge0-white.svg",
    alt: "Featured on Twelve Tools",
    width: "148",
    height: "40",
  },
  {
    href: "https://www.codehype.ai/product/wyr-play?utm_source=codehype_badge",
    src: "https://www.codehype.ai/badges/wyr-play.svg?variant=find-us&v=20",
    alt: "Featured on CodeHype",
    width: "180",
    height: "65",
  },
  {
    href: "https://www.founder.best?ref=founderbest&utm_source=founder.best&utm_medium=referral",
    src: "https://www.founder.best/api/badge/featured/wyr-play",
    alt: "Featured on Founder.best",
    width: "1195",
    height: "390",
  },
  {
    href: "https://bestsky.tools?utm_source=badge",
    src: "https://assets.bestsky.tools/badges/featured-light.svg",
    alt: "Featured on BestskyTools",
    width: "150",
    height: "48.461538",
  },
] as const;

test("homepage badge marquee is server-rendered below footer with nine primary badges in order", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.locator(footerSelector)).toHaveCount(1);
  await expect(page.locator(badgeAfterFooterSelector)).toHaveCount(1);
  await expect(page.locator(viewportSelector)).toBeVisible();

  const primaryLinks = page.locator(`${primaryGroupSelector} > a`);
  await expect(primaryLinks).toHaveCount(9);

  for (const [index, badge] of EXPECTED_BADGES.entries()) {
    const link = primaryLinks.nth(index);
    await expect(link).toHaveAttribute("href", badge.href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).not.toHaveAttribute("tabindex", "-1");

    const image = link.locator("img");
    await expect(image).toHaveAttribute("src", badge.src);
    await expect(image).toHaveAttribute("alt", badge.alt);
    await expect(image).toHaveAttribute("width", badge.width);
    await expect(image).toHaveAttribute("height", badge.height);
  }

  const betterLaunchLink = page.locator(betterLaunchBadgeSelector);
  await expect(betterLaunchLink).toHaveCount(1);
  await expect(betterLaunchLink).toHaveAttribute(
    "href",
    "https://www.betterlaunch.co/product/wyr-play",
  );

  const startupBaseImage = primaryLinks.nth(3).locator("img");
  await expect(startupBaseImage).toHaveAttribute("style", /width:\s*auto/);

  const codeHypeImage = primaryLinks.nth(6).locator("img");
  await expect(codeHypeImage).toHaveAttribute("loading", "lazy");
  await expect(codeHypeImage).toHaveAttribute("decoding", "async");
  await expect(codeHypeImage).toHaveAttribute("style", /max-width:\s*180px/);
  await expect(codeHypeImage).toHaveAttribute("style", /height:\s*auto/);

  const founderImage = primaryLinks.nth(7).locator("img");
  await expect(founderImage).toHaveAttribute(
    "src",
    /^https:\/\/www\.founder\.best\/api\/badge\/featured\/[^{}]+$/,
  );
  await expect(founderImage).not.toHaveAttribute("src", /\{slug\}/);
  await expect(founderImage).toHaveAttribute("style", /width:\s*auto/);

  const bestskyImage = primaryLinks.nth(8).locator("img");
  await expect(bestskyImage).toHaveAttribute("width", "150");
  await expect(bestskyImage).toHaveAttribute("height", "48.461538");

  await context.close();
});

test("marquee is a single seamless row with non-focusable cloned groups", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(primaryGroupSelector)).toHaveCount(1);
  await expect(page.locator(cloneGroupSelector)).toHaveCount(3);
  await expect(page.locator(`${viewportSelector} > ${trackSelector}`)).toHaveCount(1);

  for (const clone of await page.locator(cloneGroupSelector).all()) {
    await expect(clone).toHaveAttribute("aria-hidden", "true");
    await expect(clone.locator("> a")).toHaveCount(9);
    await expect(clone.locator("> a[tabindex='-1']")).toHaveCount(9);
  }
  await expect(page.locator(`${viewportSelector} a[tabindex='-1']`)).toHaveCount(27);
  await expect(page.locator(`${viewportSelector} a`)).toHaveCount(36);

  const layout = await page.evaluate(() => {
    const track = document.querySelector<HTMLElement>("[data-home-badge-marquee='track']")!;
    const viewport = document.querySelector<HTMLElement>("[data-home-badge-marquee='viewport']")!;
    const groups = [...track.querySelectorAll<HTMLElement>("[data-home-badge-group]")];
    const trackStyle = getComputedStyle(track);
    return {
      trackDisplay: trackStyle.display,
      trackFlexWrap: trackStyle.flexWrap,
      animationName: trackStyle.animationName,
      animationDuration: trackStyle.animationDuration,
      animationTimingFunction: trackStyle.animationTimingFunction,
      animationIterationCount: trackStyle.animationIterationCount,
      viewportOverflowX: getComputedStyle(viewport).overflowX,
      groupFlexShrink: groups.map((group) => getComputedStyle(group).flexShrink),
      groupTops: groups.map((group) => Math.round(group.getBoundingClientRect().top)),
      groupHeights: groups.map((group) => Math.round(group.getBoundingClientRect().height)),
      trackWiderThanViewport: track.scrollWidth > viewport.clientWidth,
    };
  });

  expect(layout.trackDisplay).toBe("flex");
  expect(layout.trackFlexWrap).toBe("nowrap");
  expect(layout.animationName).toContain("wyr-badge-marquee");
  expect(layout.animationDuration).toBe("42s");
  expect(layout.animationTimingFunction).toBe("linear");
  expect(layout.animationIterationCount).toBe("infinite");
  expect(layout.viewportOverflowX).toBe("hidden");
  expect(layout.groupFlexShrink).toEqual(["0", "0", "0", "0"]);
  expect(new Set(layout.groupTops).size).toBe(1);
  expect(new Set(layout.groupHeights).size).toBe(1);
  expect(Math.max(...layout.groupHeights)).toBeLessThan(100);
  expect(layout.trackWiderThanViewport).toBe(true);

  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    );
    expect(noOverflow, `horizontal page overflow at ${width}px`).toBe(true);
  }
});

test("hover pauses the marquee and keyboard focus enables manual access", async ({ page }) => {
  await page.goto("/");
  const viewport = page.locator(viewportSelector);
  await viewport.scrollIntoViewIfNeeded();

  const playState = () =>
    page.locator(trackSelector).evaluate((track) => getComputedStyle(track).animationPlayState);

  await expect.poll(playState).toBe("running");
  await viewport.hover();
  await expect.poll(playState).toBe("paused");
  await page.mouse.move(0, 0);
  await expect.poll(playState).toBe("running");

  // Establish keyboard modality so :focus-visible applies to the focused anchor.
  await page.keyboard.press("Tab");
  const firstPrimaryLink = page.locator(`${primaryGroupSelector} > a`).first();
  await firstPrimaryLink.focus();
  await expect(firstPrimaryLink).toBeFocused();

  const focusState = await page.evaluate(() => {
    const track = document.querySelector<HTMLElement>("[data-home-badge-marquee='track']")!;
    const viewport = document.querySelector<HTMLElement>("[data-home-badge-marquee='viewport']")!;
    const focused = document.activeElement!.getBoundingClientRect();
    const bounds = viewport.getBoundingClientRect();
    return {
      animationName: getComputedStyle(track).animationName,
      overflowX: getComputedStyle(viewport).overflowX,
      focusVisible: document.activeElement!.matches(":focus-visible"),
      focusWithinViewport: focused.left >= bounds.left - 1 && focused.right <= bounds.right + 1,
    };
  });
  expect(focusState.focusVisible).toBe(true);
  expect(focusState.animationName).toBe("none");
  expect(focusState.overflowX).toBe("auto");
  expect(focusState.focusWithinViewport).toBe(true);
});

test("prefers-reduced-motion disables animation and hides cloned groups", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");

  await expect(page.locator(primaryGroupSelector)).toBeVisible();
  await expect(page.locator(`${primaryGroupSelector} > a`)).toHaveCount(9);
  await expect(page.locator(cloneGroupSelector)).toHaveCount(3);

  const reduced = await page.evaluate(() => {
    const track = document.querySelector<HTMLElement>("[data-home-badge-marquee='track']")!;
    const viewport = document.querySelector<HTMLElement>("[data-home-badge-marquee='viewport']")!;
    const clones = [...document.querySelectorAll<HTMLElement>("[data-home-badge-group='clone']")];
    return {
      animationName: getComputedStyle(track).animationName,
      overflowX: getComputedStyle(viewport).overflowX,
      cloneDisplays: clones.map((clone) => getComputedStyle(clone).display),
      noPageOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
    };
  });
  expect(reduced.animationName).toBe("none");
  expect(reduced.overflowX).toBe("auto");
  expect(reduced.cloneDisplays).toEqual(["none", "none", "none"]);
  expect(reduced.noPageOverflow).toBe(true);

  await context.close();
});

test("badge rail stays on the homepage only", async ({ page }) => {
  for (const route of ["/find-questions", "/would-you-rather-questions-for-kids"]) {
    await page.goto(route);
    await expect(page.locator(viewportSelector)).toHaveCount(0);
    await expect(page.locator(trackSelector)).toHaveCount(0);
    for (const badge of EXPECTED_BADGES) {
      await expect(page.locator(`a[href="${badge.href}"]`)).toHaveCount(0);
    }
  }
});
