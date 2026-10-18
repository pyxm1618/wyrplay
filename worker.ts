// @ts-expect-error OpenNext generates this module during the production build.
import worker from "./.open-next/worker.js";
import { withRequestDatabase } from "./src/platform/database/request-database";

interface WorkerEnvironment {
  HYPERDRIVE: { connectionString: string };
  [binding: string]: unknown;
}
interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const cloudflareWorker = {
  fetch(request: Request, env: WorkerEnvironment, ctx: WorkerContext): Promise<Response> {
    return withRequestDatabase(
      env.HYPERDRIVE.connectionString,
      async (waitUntil) => {
        const response = await worker.fetch(
          request,
          // Supply the existing env validator with the private Hyperdrive proxy URL.
          // The origin DATABASE_URL is held only by Hyperdrive, never in Worker vars.
          { ...env, DATABASE_URL: env.HYPERDRIVE.connectionString },
          { waitUntil, passThroughOnException: () => ctx.passThroughOnException() },
        );

        const url = new URL(request.url);
        if (
          url.pathname.startsWith("/_next/image") &&
          response.status === 200 &&
          !response.headers.get("Cache-Control")
        ) {
          const headers = new Headers(response.headers);
          headers.set(
            "Cache-Control",
            "public, max-age=2678400, stale-while-revalidate=86400, immutable",
          );
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        }

        return response;
      },
      (promise) => ctx.waitUntil(promise),
    );
  },
};

export default cloudflareWorker;
