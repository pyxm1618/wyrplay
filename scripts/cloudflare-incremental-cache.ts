import { getCloudflareContext } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

const set: typeof r2IncrementalCache.set = (key, value, cacheType) => {
  const write = r2IncrementalCache.set(key, value, cacheType);
  // Next may start stale fetch-cache writes after its render task has settled.
  // Retain the official R2 write directly in the originating Worker request.
  getCloudflareContext().ctx.waitUntil(write);
  return write;
};

const requestRetainedIncrementalCache = {
  name: r2IncrementalCache.name,
  get: r2IncrementalCache.get.bind(r2IncrementalCache),
  set,
  delete: r2IncrementalCache.delete.bind(r2IncrementalCache),
};

export default requestRetainedIncrementalCache;
