import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { createDatabaseClient } from "@/platform/database/client";
import {
  accountSubjects,
  commerceProducts,
  orders,
  payments,
  refunds,
  subscriptions,
} from "@/platform/database/schema";
import { grantCredits, reserveCredits } from "@/platform/credits/application/credit-service";
import { openAccount } from "./account-test-helper";

test("dense billing and credit records remain accurate and readable at real viewports", async ({
  browser,
  request,
  baseURL,
}, testInfo) => {
  test.setTimeout(90_000);
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required for isolated account fixtures");
  const { context, page } = await openAccount(browser, request, baseURL!);
  const database = createDatabaseClient(databaseUrl);
  try {
    const identity = (await (await context.request.get("/api/auth/get-session")).json()) as {
      user: { id: string };
    };
    const subject = await database.db.query.accountSubjects.findFirst({
      where: eq(accountSubjects.authUserId, identity.user.id),
    });
    if (!subject) throw new Error("Test account subject missing");
    const suffix = crypto.randomUUID();
    const [product] = await database.db
      .insert(commerceProducts)
      .values({
        key: `account-browser-test-long-subscription-product-${suffix}`,
        version: 1,
        model: "subscription",
        billingInterval: "month",
        environment: "test",
        providerProductId: `fixture-${suffix}`,
        currency: "USD",
        expectedMinor: 1299n,
        fulfillmentKey: "fixture",
        refundPolicyKey: "fixture",
      })
      .returning();
    if (!product) throw new Error("Test product missing");
    let pendingOrderId = "";
    for (const status of ["active", "past_due", "canceling"] as const) {
      const [order] = await database.db
        .insert(orders)
        .values({
          subjectId: subject.id,
          productId: product.id,
          environment: "test",
          status: status === "canceling" ? "pending" : "paid",
          expectedCurrency: "USD",
          expectedMinor: 1299n,
          checkoutIdempotencyKey: `${suffix}-${status}`,
          checkoutState: "created",
        })
        .returning();
      if (!order) throw new Error("Test order missing");
      if (status === "canceling") pendingOrderId = order.id;
      await database.db.insert(subscriptions).values({
        orderId: order.id,
        subjectId: subject.id,
        environment: "test",
        externalOrderId: `fixture-${suffix}-${status}`,
        status,
        cancelAtPeriodEnd: status === "canceling",
        currentPeriodStart: new Date("2026-10-01T00:00:00Z"),
        currentPeriodEnd: new Date("2026-11-01T00:00:00Z"),
        ...(status === "past_due"
          ? {
              pastDueStartedAt: new Date("2026-10-01T00:00:00Z"),
              pastDueGraceEndsAt: new Date("2026-10-08T00:00:00Z"),
              gracePolicyVersion: "browser-test-policy",
            }
          : {}),
      });
      if (status !== "active") continue;
      const [payment] = await database.db
        .insert(payments)
        .values({
          orderId: order.id,
          environment: "test",
          externalPaymentId: `fixture-${suffix}`,
          status: "succeeded",
          currency: "USD",
          amountMinor: 1299n,
          refundedMinor: 200n,
          refundStatus: "partial",
          rawPayloadHash: "fixture-not-a-provider-receipt",
        })
        .returning();
      if (!payment) throw new Error("Test payment missing");
      await database.db.insert(refunds).values({
        paymentId: payment.id,
        subjectId: subject.id,
        environment: "test",
        idempotencyKey: `fixture-refund-${suffix}`,
        currency: "USD",
        requestedMinor: 200n,
        succeededMinor: 200n,
        reason: "isolated browser fixture",
        status: "succeeded",
        reversalStatus: "reconciliation_required",
        operatorReviewReason: `isolated-test-review-${suffix}`,
      });
    }
    const creditType = `account-browser-test-credit-${suffix}`;
    await grantCredits(database.db, {
      subjectId: subject.id,
      creditType,
      quantity: 10,
      source: { type: "promotion", id: suffix },
      idempotencyKey: `fixture-grant-${suffix}`,
      expiresAt: null,
      actor: "system",
    });
    await reserveCredits(database.db, {
      subjectId: subject.id,
      creditType,
      quantity: 3,
      purpose: { type: "browser-fixture", id: suffix },
      idempotencyKey: `fixture-reserve-${suffix}`,
      expiresAt: new Date(Date.now() + 3600_000),
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    for (const width of [320, 360, 375, 390, 768, 1024, 1120, 1200, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/account/billing");
      await expect(page.getByText("Current period starts Oct 1, 2026, 12:00 AM UTC")).toHaveCount(
        3,
      );
      await expect(page.getByText("Monthly subscription", { exact: true })).toHaveCount(3);
      await expect(page.getByText(product.key, { exact: false })).toHaveCount(0);
      expect(await page.locator(".account-detail-content").innerText()).not.toMatch(
        /\d{4}-\d{2}-\d{2}T/,
      );
      if (width <= 390) {
        for (const field of await page.locator("input:visible").all()) {
          await field.focus();
          expect(
            await field.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
          ).toBeGreaterThanOrEqual(16);
        }
      }
      await expect(page.getByText("Grace ends", { exact: false })).toContainText(
        "browser-test-policy",
      );
      await expect(page.getByRole("button", { name: "Cancel at period end" })).toHaveCount(2);
      await expect(page.getByRole("button", { name: "Resume subscription" })).toHaveCount(1);
      await expect(page.getByText("Refund succeeded", { exact: false })).toContainText(
        "reconciliation_required",
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      if ([375, 390, 768, 1024, 1200, 1440].includes(width))
        await page.screenshot({
          path: testInfo.outputPath(`billing-records-${width}.jpg`),
          fullPage: true,
          quality: 80,
        });
      await page.goto("/account/credits");
      await expect(page.getByText(creditType, { exact: true })).toBeVisible();
      await expect(page.locator("dl").getByText("7", { exact: true })).toBeVisible();
      await expect(page.locator("dl").getByText("3", { exact: true })).toBeVisible();
      for (const label of ["Available", "Reserved", "Consumed", "Expired", "Revoked"])
        await expect(page.getByText(label, { exact: true })).toBeVisible();
      await expect(page.getByText(`${creditType} · reserve`, { exact: true })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      if ([375, 390, 768, 1024, 1200, 1440].includes(width))
        await page.screenshot({
          path: testInfo.outputPath(`credits-records-${width}.jpg`),
          fullPage: true,
          quality: 80,
        });
    }
    await page.goto(`/checkout/return?order=${pendingOrderId}&status=success`);
    await expect(page.getByText("Current server-recorded status:")).toContainText("pending");
    await expect(
      page.getByText("Browser return parameters are advisory only.", { exact: false }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    await database.close();
    await context.close();
  }
});
