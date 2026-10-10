import { defineConfig } from "vitest/config";
import unitConfig from "./vitest.config";

// Local browser checks require an installed Playwright Chromium runtime.
// Keep the normal unit gate independent of browser availability.
export default defineConfig({
  ...unitConfig,
  test: { ...unitConfig.test, include: ["tests/browser/**/*.test.ts"] },
});
