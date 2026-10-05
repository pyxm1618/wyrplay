import { expect, type Browser, type APIRequestContext } from "@playwright/test";

export async function openAccount(browser: Browser, request: APIRequestContext, baseURL: string) {
  const [third, fourth] = crypto.getRandomValues(new Uint8Array(2));
  const fixtureIp = `198.18.${third}.${fourth}`;
  const email = `account-ui-${crypto.randomUUID()}@example.test`;
  const sent = await request.post("/api/auth/magic-link/request", {
    headers: { origin: baseURL, "x-real-ip": fixtureIp },
    data: { email, returnTo: "/account", turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" },
  });
  expect(sent.status()).toBe(202);
  const mailbox = await request.get(`/api/test/emails/latest?to=${encodeURIComponent(email)}`);
  expect(mailbox.status()).toBe(200);
  const message = (await mailbox.json()) as { html: string };
  const confirmation = message.html.match(/href="([^"]+)"/)?.[1];
  if (!confirmation) throw new Error("Missing account test sign-in confirmation");
  const context = await browser.newContext({
    extraHTTPHeaders: { "x-real-ip": fixtureIp },
  });
  const page = await context.newPage();
  await page.goto(confirmation.replaceAll("&amp;", "&"));
  await page.getByRole("button", { name: "Confirm sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  return { context, page, email };
}
