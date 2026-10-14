import { describe, expect, it, vi } from "vitest";

const clients: { db: { id: number }; close: ReturnType<typeof vi.fn> }[] = [];
vi.mock("@/platform/database/client", () => ({
  createDatabaseClient: vi.fn(() => {
    const client = { db: { id: clients.length }, close: vi.fn().mockResolvedValue(undefined) };
    clients.push(client);
    return client;
  }),
}));

import { getRequestDatabase, withRequestDatabase } from "@/platform/database/request-database";

async function request(read: () => Promise<void>) {
  const pending: Promise<unknown>[] = [];
  const response = await withRequestDatabase(
    "postgres://local/hyperdrive",
    async () => {
      await read();
      return new Response("streamed");
    },
    (promise) => pending.push(promise),
  );
  await response.text();
  await Promise.all(pending);
}

describe("Workers request-scoped database", () => {
  it("reuses a client within a request, isolates concurrent requests and closes both", async () => {
    let release: () => void = () => undefined;
    const firstReady = new Promise<void>((resolve) => {
      release = resolve;
    });
    let first: unknown;
    let second: unknown;
    await Promise.all([
      request(async () => {
        first = getRequestDatabase();
        release();
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(getRequestDatabase()).toBe(first);
      }),
      request(async () => {
        await firstReady;
        second = getRequestDatabase();
        expect(second).not.toBe(first);
      }),
    ]);
    expect(clients.slice(-2).every((client) => client.close.mock.calls.length === 1)).toBe(true);
    expect(getRequestDatabase()).toBeUndefined();
  });

  it("keeps the client open until the response stream and background work finish", async () => {
    const pending: Promise<unknown>[] = [];
    let finish: () => void = () => undefined;
    const background = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const response = await withRequestDatabase(
      "postgres://local/hyperdrive",
      async (waitUntil) => {
        getRequestDatabase();
        waitUntil(background);
        return new Response("body");
      },
      (promise) => pending.push(promise),
    );
    const client = clients.at(-1)!;
    expect(client.close).not.toHaveBeenCalled();
    await response.text();
    expect(client.close).not.toHaveBeenCalled();
    finish();
    await Promise.all(pending);
    expect(client.close).toHaveBeenCalledOnce();
  });

  it("closes the request client when rendering fails", async () => {
    await expect(
      withRequestDatabase(
        "postgres://local/hyperdrive",
        async () => {
          getRequestDatabase();
          throw new Error("render failed");
        },
        () => undefined,
      ),
    ).rejects.toThrow("render failed");
    expect(clients.at(-1)!.close).toHaveBeenCalledOnce();
  });
});
