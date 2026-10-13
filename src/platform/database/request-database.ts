import { AsyncLocalStorage } from "node:async_hooks";

import { createDatabaseClient } from "./client";

type RequestDatabase = {
  url: string;
  client?: ReturnType<typeof createDatabaseClient>;
};
const storageKey = Symbol.for("wyrplay.request-database");
const runtime = globalThis as typeof globalThis & {
  [storageKey]?: AsyncLocalStorage<RequestDatabase>;
};
// Next.js and the Worker entrypoint are bundled separately; share only the context
// carrier, never a database client or socket, between those bundles.
const storage = (runtime[storageKey] ??= new AsyncLocalStorage<RequestDatabase>());

export function getRequestDatabase() {
  const request = storage.getStore();
  if (!request) return undefined;
  request.client ??= createDatabaseClient(request.url, { hyperdrive: true });
  return request.client.db;
}

export async function withRequestDatabase(
  url: string,
  render: (waitUntil: (promise: Promise<unknown>) => void) => Promise<Response>,
  waitUntil: (promise: Promise<unknown>) => void,
): Promise<Response> {
  if (!url) throw new Error("Hyperdrive connection string is required");
  const request: RequestDatabase = { url };
  return storage.run(request, async () => {
    const background: Promise<unknown>[] = [];
    const close = async () => {
      await Promise.allSettled(background);
      await request.client?.close();
    };
    try {
      const response = await render((promise) => {
        background.push(promise);
        waitUntil(promise);
      });
      if (!response.body) {
        waitUntil(close());
        return response;
      }
      const stream = new TransformStream<Uint8Array, Uint8Array>();
      // Preserve backpressure and streaming. Keep sockets alive for streamed SSR
      // and pending cache revalidation, then close them in the same request scope.
      waitUntil(response.body.pipeTo(stream.writable).finally(close));
      return new Response(stream.readable, response);
    } catch (error) {
      await close();
      throw error;
    }
  });
}
