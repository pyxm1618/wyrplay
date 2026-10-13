import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

const config = defineCloudflareConfig({
  // Serve the verified prerendered HTML without regenerating its inline scripts.
  // This read-only adapter requires no additional Cloudflare resources.
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});

// Always run the existing webpack + CSP artifact generation and verification chain.
config.buildCommand = "APP_ENV=production APP_ORIGIN=https://www.wyrplay.com bun run build";

export default config;
