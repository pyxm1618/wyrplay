import { expect, test } from "@playwright/test";

test("authentication header offers only the opposite account route and official brand", async ({
  page,
}) => {
  await page.goto("/sign-in");
  const header = page.locator(".auth-page header");
  await expect(header.getByRole("link", { name: "Sign up", exact: true })).toBeVisible();
  await expect(header.locator('a[href="/sign-in"]')).toHaveCount(0);
  await expect(header.locator("button[disabled]")).toHaveCount(0);
  await expect(header.locator('img[src="/brand/logo.svg"]')).toHaveCount(1);
  await expect(page.locator(".benefits")).toHaveCount(0);
});

const viewports = [
  [320, 568],
  [360, 800],
  [375, 667],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 800],
  [1440, 900],
  [1680, 900],
  [1920, 900],
  [1920, 1080],
  [2560, 1080],
] as const;

for (const route of ["/sign-in", "/sign-up", "/auth/magic-link/confirm"]) {
  test(`${route} keeps content readable across mobile, tablet, short desktop and ultrawide`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      window.turnstile = {
        ready(callback) {
          callback();
        },
        render(container, options) {
          const panel = document.createElement("div");
          panel.dataset.testSize = options.size;
          panel.style.cssText =
            options.size === "compact"
              ? "width:150px;height:140px"
              : "width:100%;min-width:300px;height:65px";
          panel.textContent = "Test verification panel";
          container.replaceChildren(panel);
          queueMicrotask(() => options.callback("XXXX.DUMMY.TOKEN.XXXX"));
          return "responsive-test";
        },
        reset() {},
        remove() {},
      };
    });
    const measurements = [];
    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await page.goto(route);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((image) => image.decode()));
      });
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator(".hero-description")).toBeVisible();
      await expect(page.locator(".auth-card")).toBeVisible();
      const dimensions = await page.evaluate(() => {
        const card = document.querySelector(".auth-card") as HTMLElement;
        const hero = document.querySelector(".auth-hero") as HTMLElement;
        const a = card.getBoundingClientRect(),
          b = hero.getBoundingClientRect();
        return {
          viewport: [innerWidth, innerHeight],
          scrollWidth: document.documentElement.scrollWidth,
          cardWidth: card.clientWidth,
          cardScrollWidth: card.scrollWidth,
          overlap: a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top,
          fonts: document.fonts.check("20px WyrBody") && document.fonts.check("40px WyrDisplay"),
        };
      });
      expect(dimensions.scrollWidth).toBe(width);
      expect(dimensions.cardScrollWidth).toBeLessThanOrEqual(dimensions.cardWidth);
      expect(dimensions.overlap).toBe(false);
      expect(dimensions.fonts).toBe(true);
      measurements.push(dimensions);
      if (width === 390 || (width === 1440 && height === 900)) {
        await page.screenshot({
          path: testInfo.outputPath(
            `${route.includes("confirm") ? "confirm" : route.slice(1)}-${width}x${height}.png`,
          ),
          fullPage: true,
        });
      }
      if (!route.includes("confirm")) {
        const label = page.locator(".magic-button span");
        const labelSize = await label.evaluate((element) => ({
          height: element.getBoundingClientRect().height,
          lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
        }));
        expect(labelSize.height).toBeLessThanOrEqual(labelSize.lineHeight + 1);
        await page.getByRole("button", { name: "Continue with Magic Link" }).click();
        await expect(page.getByLabel("Email address")).toBeFocused();
        const panel = page.locator("[data-test-size]");
        await expect(panel).toHaveAttribute("data-test-size", width < 375 ? "compact" : "flexible");
        await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeEnabled();
        const bounds = await panel.boundingBox();
        if (!bounds) throw new Error("Verification panel missing");
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      }
    }
    await testInfo.attach("viewport-measurements", {
      body: JSON.stringify(measurements, null, 2),
      contentType: "application/json",
    });
  });
}

test("Turnstile switches official size on resize and invalidates the previous token", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.turnstile = {
      ready(callback) {
        callback();
      },
      render(container, options) {
        container.dataset.testSize = options.size;
        if (options.size === "flexible")
          queueMicrotask(() => options.callback("XXXX.DUMMY.TOKEN.XXXX"));
        return options.size;
      },
      reset() {},
      remove() {},
    };
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue with Magic Link" }).click();
  await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeEnabled();
  await page.setViewportSize({ width: 320, height: 568 });
  await expect(page.locator('[aria-label="Human verification"]')).toHaveAttribute(
    "data-test-size",
    "compact",
  );
  await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeDisabled();
});

test("confirmation never submits on load, clears fragment and exposes network failure", async ({
  page,
  request,
}) => {
  const loading = await request.get("/auth/magic-link/confirm");
  expect(await loading.text()).toContain("Preparing secure confirmation");
  const requests: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST") requests.push(req.url());
  });
  await page.route("**/api/auth/magic-link/confirm", (route) => route.abort());
  await page.goto("/auth/magic-link/confirm#token=ui-network-test&returnTo=%2Faccount");
  await expect(page).toHaveURL(/\/auth\/magic-link\/confirm$/);
  await expect(page.getByRole("button", { name: "Confirm sign in", exact: true })).toBeEnabled();
  expect(requests).toHaveLength(0);
  await page.getByRole("button", { name: "Confirm sign in", exact: true }).click();
  await expect(page.locator(".auth-card").getByRole("alert")).toContainText(
    "invalid, expired, or already used",
  );
  await expect(page.getByRole("button", { name: "Confirm sign in", exact: true })).toBeDisabled();
});

test("authentication pages and expanded email form have no WCAG AA axe violations", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
  for (const route of ["/sign-in", "/sign-up", "/auth/magic-link/confirm"]) {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    if (!route.includes("confirm"))
      await page.getByRole("button", { name: "Continue with Magic Link" }).click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    // First tab starts at the home logo; expanding the form focuses its email label.
    if (!route.includes("confirm")) await expect(page.getByLabel("Email address")).toBeFocused();
  }
});

test("email sending, success, challenge loading and confirmation submitting stay explicit", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.turnstile = {
      ready(callback) {
        callback();
      },
      render(container, options) {
        const verify = document.createElement("button");
        verify.type = "button";
        verify.textContent = "Complete test verification";
        verify.onclick = () => options.callback("XXXX.DUMMY.TOKEN.XXXX");
        container.replaceChildren(verify);
        return "status-test";
      },
      reset() {},
      remove() {},
    };
  });
  let releaseRequest!: () => void;
  const requestGate = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  await page.route("**/api/auth/magic-link/request", async (route) => {
    await requestGate;
    await route.fulfill({ status: 202, contentType: "application/json", body: "{}" });
  });
  await page.goto("/sign-up");
  await page.getByRole("button", { name: "Continue with Magic Link" }).click();
  await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeDisabled();
  await page.getByLabel("Email address").fill("status@example.com");
  await page.getByRole("button", { name: "Complete test verification" }).click();
  await page.getByRole("button", { name: "Send secure sign-in link" }).click();
  await expect(page.getByRole("button", { name: "Sending…", exact: true })).toBeDisabled();
  releaseRequest();
  await expect(page.locator("#sign-in-status")).toContainText("a sign-in link has been sent");
  let releaseConfirm!: () => void;
  const confirmationGate = new Promise<void>((resolve) => {
    releaseConfirm = resolve;
  });
  await page.route("**/api/auth/magic-link/confirm", async (route) => {
    await confirmationGate;
    await route.fulfill({ status: 400, contentType: "application/json", body: "{}" });
  });
  await page.goto("/auth/magic-link/confirm#token=state-test&returnTo=%2Faccount");
  await page.getByRole("button", { name: "Confirm sign in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirming…", exact: true })).toBeDisabled();
  releaseConfirm();
  await expect(page.locator(".auth-card").getByRole("alert")).toContainText(
    "invalid, expired, or already used",
  );
});

test("provider callback errors stay visible for Google and expired email links", async ({
  page,
}) => {
  for (const [error, message] of [
    ["google", "Google sign-in could not be completed"],
    ["magic-link", "invalid, expired, or already used"],
  ]) {
    await page.goto(`/sign-in?error=${error}`);
    await expect(page.locator(".auth-card").getByRole("alert")).toContainText(message!);
  }
});

test("challenge expiry and provider error disable sending without claiming success", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.turnstile = {
      ready(callback) {
        callback();
      },
      render(container, options) {
        const verify = document.createElement("button");
        verify.type = "button";
        verify.textContent = "Verify test challenge";
        verify.onclick = () => options.callback("XXXX.DUMMY.TOKEN.XXXX");
        const expire = document.createElement("button");
        expire.type = "button";
        expire.textContent = "Expire test challenge";
        expire.onclick = () => options["expired-callback"]();
        const fail = document.createElement("button");
        fail.type = "button";
        fail.textContent = "Fail test challenge";
        fail.onclick = () => options["error-callback"]();
        container.replaceChildren(verify, expire, fail);
        return "challenge-state-test";
      },
      reset() {},
      remove() {},
    };
  });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Continue with Magic Link" }).click();
  await page.getByRole("button", { name: "Verify test challenge" }).click();
  await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeEnabled();
  await page.getByRole("button", { name: "Expire test challenge" }).click();
  await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeDisabled();
  await page.getByRole("button", { name: "Verify test challenge" }).click();
  await page.getByRole("button", { name: "Fail test challenge" }).click();
  await expect(page.locator("#sign-in-status")).toContainText(
    "Human verification expired or could not be completed",
  );
  await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeDisabled();
});
