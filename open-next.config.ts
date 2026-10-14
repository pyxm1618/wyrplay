import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "./scripts/cloudflare-incremental-cache";

const config = defineCloudflareConfig({
  // Preserve prerendered HTML and the existing writable 60-second fetch cache.
  incrementalCache: r2IncrementalCache,
  enableCacheInterception: true,
});

// Always run the existing webpack + CSP artifact generation and verification chain.
config.buildCommand = "APP_ENV=production APP_ORIGIN=https://www.wyrplay.com bun run build";

// Hyperdrive handles origin TLS. Use Postgres.js with Workers native Node APIs;
// its legacy workerd export rejects socket closure with an unhandled error.
config.cloudflare = { ...config.cloudflare, useWorkerdCondition: false };

export default config;
