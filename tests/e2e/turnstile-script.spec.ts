import { expect, test } from "@playwright/test";

/**
 * Regression cover for the real Turnstile script path.
 *
 * Every other sign-in test installs a `window.turnstile` mock before load, so
 * `ensureTurnstileScript` takes its early-return branch and the injected script
 * tag is never produced. That left a whole failure mode invisible: Cloudflare
 * refuses `turnstile.ready()` when its own script tag carries async or defer,
 * which threw, left the widget unrendered, and made the sign-in form
 * permanently unsubmittable.
 *
 * Here the script request is intercepted and answered with a stub that
 * reproduces exactly that rule, so the widget is driven through the real
 * injection path without reaching the network.
 */

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js**";

const STUB_API_JS = `
(function () {
  var tag = document.getElementById("creat-web-turnstile-script");
  var rejected = Boolean(tag) && (tag.hasAttribute("async") || tag.hasAttribute("defer"));
  window.turnstile = {
    ready: function (callback) {
      if (rejected) {
        throw new Error(
          "[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready()."
        );
      }
      callback();
    },
    render: function (container, options) {
      container.setAttribute("data-turnstile-stub", "rendered");
      setTimeout(function () { options.callback("STUB.TURNSTILE.TOKEN"); }, 0);
      return "stub-widget";
    },
    reset: function () {},
    remove: function () {},
  };
})();
`;

test("the real Turnstile script path renders the widget and enables sign-in", async ({ page }) => {
  await page.route(TURNSTILE_SCRIPT, (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: STUB_API_JS }),
  );

  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill("turnstile-script@example.com");

  const widget = page.locator('[aria-label="Human verification"]');
  await expect(widget).toHaveAttribute("data-turnstile-stub", "rendered");
  await expect(page.getByRole("button", { name: "Send secure sign-in link" })).toBeEnabled();
});
