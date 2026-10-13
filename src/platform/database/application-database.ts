import "server-only";

import { env } from "@/platform/config/env";

import { createDatabaseClient, type DatabaseClient } from "./client";
import { getRequestDatabase } from "./request-database";

let nodeDatabase: ReturnType<typeof createDatabaseClient> | undefined;

// Retain the existing db API for business code. Workers resolve a different
// request-local client; Node/Vercel retain their existing process-local pool.
export const db = new Proxy({} as DatabaseClient, {
  get(_target, property) {
    const requestDatabase = getRequestDatabase();
    if (!requestDatabase && "WebSocketPair" in globalThis) {
      throw new Error("Workers database access requires a request-scoped client");
    }
    const database = requestDatabase ?? (nodeDatabase ??= createDatabaseClient(env.databaseUrl)).db;
    const value = Reflect.get(database, property);
    return typeof value === "function" ? value.bind(database) : value;
  },
});
