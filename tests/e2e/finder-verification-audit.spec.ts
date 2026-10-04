import { expect, test } from "@playwright/test";

test.describe("Storage error isolation", () => {
  test("saved localStorage invalid JSON triggers accurate notice without blocking finder", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("creat-web:analytics-consent:v1", "denied");
      localStorage.setItem("wyrplay:saved-questions:v1", "{bad-json");
    });
    await page.goto("/find-questions");
    const notice = page.locator(".notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(
      "Saved questions could not be read. You can save questions again.",
    );
    // Page remains fully functional
    await expect(page.locator(".question-card")).toHaveCount(10);
    await expect(page.locator(".panel-heading")).toContainText("457 curated questions");
  });

  test("Finder sessionStorage invalid JSON triggers accurate restore notice", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("creat-web:analytics-consent:v1", "denied");
      sessionStorage.setItem("wyrplay:finder-session:v1", "{corrupt-session-data");
    });
    await page.goto("/find-questions?restore=1");
    const notice = page.locator(".notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("Previous search and filter session could not be restored.");
    // Page remains fully functional
    await expect(page.locator(".question-card")).toHaveCount(10);
  });

  test("localStorage unavailable triggers unavailable notice and does not block finder", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });
    await page.goto("/find-questions");
    const notice = page.locator(".notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("Saved questions are unavailable in this browser.");
    // Page remains fully functional
    await expect(page.locator(".question-card")).toHaveCount(10);
  });

  test("sessionStorage unavailable triggers restore notice on restore and does not block finder", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("creat-web:analytics-consent:v1", "denied");
      Object.defineProperty(window, "sessionStorage", {
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });
    await page.goto("/find-questions?restore=1");
    const notice = page.locator(".notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("Previous search and filter session could not be restored.");
    // Page remains fully functional
    await expect(page.locator(".question-card")).toHaveCount(10);
  });

  test("both storages fail independently without mutual interference", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("wyrplay:saved-questions:v1", "{bad-json");
      sessionStorage.setItem(
        "wyrplay:finder-session:v1",
        JSON.stringify({
          query: "food",
          keyword: "food",
          draft: {},
          criteria: {},
          pageNumber: 1,
          selected: [],
        }),
      );
    });
    await page.goto("/find-questions?restore=1");
    // Session restore still succeeded despite localStorage corrupt
    await expect(page.getByRole("searchbox")).toHaveValue("food");
    await expect(page.locator(".question-card").first()).toBeVisible();
  });
});

test.describe("Analytics and Privacy banner non-occlusion verification", () => {
  const auditViewports = [
    [390, 844],
    [430, 932],
    [768, 1024],
    [834, 1194],
    [1024, 768],
  ] as const;

  for (const consentState of ["not-decided", "granted", "denied"] as const) {
    for (const [width, height] of auditViewports) {
      test(`consent [${consentState}] at ${width}x${height} does not occlude interactive controls`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await page.addInitScript((state) => {
          try {
            if (state === "not-decided") {
              localStorage.removeItem("creat-web:analytics-consent:v1");
            } else {
              localStorage.setItem("creat-web:analytics-consent:v1", state);
            }
          } catch {
            // ignore
          }
        }, consentState);

        await page.goto("/find-questions");
        await page.evaluate(() => document.fonts.ready);

        // 1. Verify card interactions can be clicked without banner interception
        const firstCardSelect = page.locator(".select-button").first();
        await expect(firstCardSelect).toBeVisible();
        await firstCardSelect.click();
        await expect(firstCardSelect).toHaveAttribute("aria-pressed", "true");

        // 2. Verify selection bar is visible and interactive
        const selectionBar = page.locator(".selection-bar");
        await expect(selectionBar).toBeVisible();
        await selectionBar.scrollIntoViewIfNeeded();
        const clearBtn = page.getByRole("button", { name: "Clear selected" });
        await expect(clearBtn).toBeVisible();
        await clearBtn.click();

        // 3. Verify pagination can be scrolled to and clicked
        const pagination = page.locator(".pagination");
        await expect(pagination).toBeVisible();
        await pagination.scrollIntoViewIfNeeded();
        const nextBtn = page.getByRole("button", { name: "Next →" });
        await expect(nextBtn).toBeVisible();
        await nextBtn.click();
        await expect(page.locator(".pagination [aria-current=page]")).toHaveText("2");

        // 4. Verify filters or filter trigger is accessible
        if (width <= 700) {
          const filterToggle = page.locator(".filter-toggle");
          await expect(filterToggle).toBeVisible();
          await filterToggle.scrollIntoViewIfNeeded();
          await filterToggle.click();
          const applyBtn = page.getByRole("button", { name: "Apply Filters" });
          await expect(applyBtn).toBeVisible();
        } else {
          const applyBtn = page.getByRole("button", { name: "Apply Filters" });
          await expect(applyBtn).toBeVisible();
          await applyBtn.scrollIntoViewIfNeeded();
          await applyBtn.click();
        }

        // 5. In granted or denied state, verify persistent Privacy settings control is non-occluding
        if (consentState !== "not-decided") {
          const privacySettingsBtn = page.getByRole("button", {
            name: "Analytics settings",
            exact: true,
          });
          await expect(privacySettingsBtn).toBeVisible();
          await privacySettingsBtn.click();
          const panel = page.getByLabel("Analytics settings panel");
          await expect(panel).toBeVisible();
          await panel.getByRole("button", { name: "Close" }).click();
          await expect(panel).toBeHidden();
        }
      });
    }
  }
});
