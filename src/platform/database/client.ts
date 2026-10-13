import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export function createDatabaseClient(url: string, options: { hyperdrive?: boolean } = {}) {
  const client = postgres(url, {
    max: 5,
    prepare: options.hyperdrive === true,
    ...(options.hyperdrive ? { fetch_types: false } : {}),
    connect_timeout: 10,
  });

  return {
    db: drizzle(options.hyperdrive ? withHyperdrivePreparedQueries(client) : client, { schema }),
    close: async () => client.end({ timeout: 5 }),
  };
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>["db"];
export type DatabaseTransaction = Parameters<Parameters<DatabaseClient["transaction"]>[0]>[0];

// Drizzle uses sql.unsafe(), whose per-query default disables preparation even
// when the pool has prepare:true. Preserve the driver API and transaction API,
// but enforce Hyperdrive-compatible prepared protocol on this runtime only.
function withHyperdrivePreparedQueries<T extends object>(client: T): T {
  return new Proxy(client, {
    get(target, property) {
      const value = Reflect.get(target, property);
      if (typeof value !== "function") return value;
      if (property === "unsafe") {
        return new Proxy(value, {
          apply(query, receiver, args) {
            return Reflect.apply(query, receiver, [
              args[0],
              args[1] ?? [],
              { ...args[2], prepare: true, simple: false },
            ]);
          },
        });
      }
      if (property === "begin" || property === "savepoint") {
        return new Proxy(value, {
          apply(transaction, receiver, args) {
            return Reflect.apply(
              transaction,
              receiver,
              args.map((arg) =>
                typeof arg === "function"
                  ? new Proxy(arg, {
                      apply(callback, callbackReceiver, callbackArgs) {
                        return Reflect.apply(callback, callbackReceiver, [
                          withHyperdrivePreparedQueries(callbackArgs[0]),
                          ...callbackArgs.slice(1),
                        ]);
                      },
                    })
                  : arg,
              ),
            );
          },
        });
      }
      return value;
    },
  });
}
