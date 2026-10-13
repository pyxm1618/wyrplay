import { describe, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => ({
  query: vi.fn().mockReturnValue({}),
  clients: [] as {
    unsafe: (query: string, parameters: number[], options?: Record<string, unknown>) => unknown;
    begin: (callback: (sql: unknown) => unknown) => unknown;
  }[],
}));
vi.mock("postgres", () => ({
  default: vi.fn(() => {
    const transaction = { unsafe: calls.query };
    const client = {
      unsafe: calls.query,
      begin: (callback: (sql: unknown) => unknown) => callback(transaction),
      end: vi.fn(),
    };
    calls.clients.push(client);
    return client;
  }),
}));
vi.mock("drizzle-orm/postgres-js", () => ({ drizzle: (sql: unknown) => sql }));
import { createDatabaseClient } from "@/platform/database/client";

describe("Hyperdrive prepared queries", () => {
  it("preserves Node query options and enables prepared Drizzle queries only on Hyperdrive", () => {
    createDatabaseClient("postgres://local/node");
    calls.clients.at(-1)!.unsafe("select $1", [1]);
    expect(calls.query.mock.calls.at(-1)).toEqual(["select $1", [1]]);
    const hyperdrive = createDatabaseClient("postgres://local/hyperdrive", { hyperdrive: true });
    (hyperdrive.db as unknown as (typeof calls.clients)[number]).unsafe("select $1", [1]);
    expect(calls.query.mock.calls.at(-1)).toEqual([
      "select $1",
      [1],
      { prepare: true, simple: false },
    ]);
  });

  it("also enables prepared queries inside the existing transaction API", () => {
    const hyperdrive = createDatabaseClient("postgres://local/hyperdrive", { hyperdrive: true });
    (hyperdrive.db as unknown as (typeof calls.clients)[number]).begin((sql) => {
      (sql as { unsafe: (query: string, parameters: number[]) => unknown }).unsafe(
        "select $1",
        [2],
      );
    });
    expect(calls.query.mock.calls.at(-1)).toEqual([
      "select $1",
      [2],
      { prepare: true, simple: false },
    ]);
  });
});
