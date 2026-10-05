import { expect, test } from "@playwright/test";

import { openAccount } from "./account-test-helper";

test("saved library selects a real pool, filters, paginates and preserves unknown IDs", async ({
  browser,
  request,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Account test base URL is required");
  const { context, page } = await openAccount(browser, request, baseURL);
  try {
    const ids = Array.from({ length: 12 }, (_, i) => `wyr-${String(i + 1).padStart(6, "0")}`);
    await page.evaluate(
      (ids) =>
        localStorage.setItem(
          "wyrplay:saved-questions:v1",
          JSON.stringify([...ids, "future-unavailable-id"]),
        ),
      ids,
    );
    await page.goto("/account?view=saved");
    await expect(page.locator(".library-row")).toHaveCount(10);
    await expect(page.locator(".library-toolbar")).toContainText("saved 12 questions");
    await page.locator(".library-row input").first().check();
    await expect(page.getByRole("link", { name: /Play Selected/ })).toHaveAttribute(
      "href",
      "/play?set=wyr-000001",
    );
    await expect(page.getByRole("link", { name: /Print \/ Customize/ })).toHaveAttribute(
      "href",
      "/print?set=wyr-000001",
    );
    await page.getByRole("button", { name: "Page 2", exact: true }).click();
    await expect(page.locator(".library-row")).toHaveCount(2);
    await page.getByRole("button", { name: "Page 1", exact: true }).click();
    const title = await page.locator(".library-title").first().innerText();
    await page.getByRole("searchbox", { name: "Search saved questions" }).fill(title);
    await expect(page.locator(".library-row")).toHaveCount(1);
    await page
      .getByRole("searchbox", { name: "Search saved questions" })
      .fill("no-such-question-12345");
    await expect(page.locator(".saved-library")).toContainText("No matching saved questions");
    await page.getByRole("searchbox", { name: "Search saved questions" }).fill("");
    await page.locator(".library-row").first().locator("summary").click();
    await page.getByRole("button", { name: "Remove from saved", exact: true }).click();
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("wyrplay:saved-questions:v1") ?? "null"),
      ),
    ).toEqual([]);
    expect((await (await context.request.get("/api/account/saved-questions")).json()).ids).toEqual(
      expect.arrayContaining([...ids.slice(1), "future-unavailable-id"]),
    );
    await expect(
      page.getByRole("button", { name: "▶ Play Selected (0)", exact: true }),
    ).toBeDisabled();
    await page
      .locator(".library-row")
      .first()
      .getByRole("button", { name: "▶ Play", exact: true })
      .click();
    await expect(page.getByRole("dialog", { name: "Play a saved question" })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("settings shows real identity, retains delete validation and signs out", async ({
  browser,
  request,
  baseURL,
  page: anonymous,
}) => {
  if (!baseURL) throw new Error("Account test base URL is required");
  await anonymous.goto("/account/settings");
  await expect(anonymous).toHaveURL(/\/sign-in$/);
  const { context, page, email } = await openAccount(browser, request, baseURL);
  try {
    await page.goto("/account?view=my");
    await expect(page.locator(".my-question-main")).toContainText("not available yet");
    await expect(page.locator(".creator-stat")).toHaveCount(0);
    await page.goto("/account/settings");
    await expect(page.locator(".settings-email")).toHaveText(email);
    await expect(page.getByRole("button", { name: "Save Changes", exact: true })).toBeDisabled();
    await expect(page.locator("#security")).toContainText("1 active session");
    let deletes = 0;
    page.on("request", (request) => {
      if (request.url().endsWith("/api/account/delete")) deletes++;
    });
    await page.getByRole("button", { name: "Permanently delete account", exact: true }).click();
    expect(
      await page
        .locator("#delete-confirmation")
        .evaluate((input: HTMLInputElement) => input.validity.valueMissing),
    ).toBe(true);
    await page.locator("#delete-confirmation").fill("incorrect");
    await page.getByRole("button", { name: "Permanently delete account", exact: true }).click();
    expect(
      await page
        .locator("#delete-confirmation")
        .evaluate((input: HTMLInputElement) => input.validity.patternMismatch),
    ).toBe(true);
    expect(deletes).toBe(0);
    await page.getByRole("link", { name: "Manage Sessions →", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Active sessions", exact: true })).toBeVisible();
    await page.goto("/account/settings");
    await page.getByRole("button", { name: "Sign Out", exact: true }).click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await page.goto("/account/settings");
    await expect(page).toHaveURL(/\/sign-in$/);
  } finally {
    await context.close();
  }
});
