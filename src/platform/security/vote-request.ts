import "server-only";

import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { extractTrustedClientIp } from "@/platform/auth/client-ip";
import { env } from "@/platform/config/env";
import type { DatabaseClient } from "@/platform/database/client";

const MAX_BODY_BYTES = 4096;
const VOTE_WINDOW_MS = 60_000;
const MAX_VOTES_PER_WINDOW = 60;

/** General voting cookies are server-issued UUIDs, never arbitrary record tokens. */
export function resolveVoterCookie(existing: string | undefined): {
  voterId: string;
  isNew: boolean;
} {
  if (
    existing &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existing)
  ) {
    return { voterId: existing, isNew: false };
  }
  return { voterId: crypto.randomUUID(), isNew: true };
}

function rejection(error: string, status: number): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function validateVoteRequest(
  request: Request,
): Promise<{ body: unknown; status?: never } | Response> {
  if (request.headers.get("origin") !== env.appOrigin) return rejection("Invalid Origin", 403);
  if (
    request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !==
    "application/json"
  ) {
    return rejection("Content-Type must be application/json", 415);
  }
  const declaredLength = request.headers.get("content-length");
  if (
    declaredLength !== null &&
    (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)
  ) {
    return rejection("Request body too large or invalid Content-Length", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) return rejection("Invalid JSON body", 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return rejection("Request body too large", 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { body: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown };
  } catch {
    return rejection("Invalid JSON body", 400);
  } finally {
    reader.releaseLock();
  }
}

/** Short-lived network counters shared by both endpoints; never a Kids browser ID. */
export async function consumeVoteLimit(
  request: Request,
  database?: Pick<DatabaseClient, "execute">,
  now = Date.now(),
): Promise<Response | null> {
  const trustedIp = extractTrustedClientIp(request.headers, env.appEnv);
  const ip =
    trustedIp === "unknown" && (env.appEnv === "local" || env.appEnv === "test")
      ? "127.0.0.1"
      : trustedIp;
  if (ip === "unknown") return rejection("Trusted client address unavailable", 503);
  const window = Math.floor(now / VOTE_WINDOW_MS) * VOTE_WINDOW_MS;
  const key = `wyr-vote:${createHash("sha256").update(`${window}\0${ip}`).digest("hex")}`;
  const db = database ?? (await import("@/platform/database/application-database")).db;
  const rows = await db.execute(sql`
    with expired as (
      select "id" from "rate_limit"
      where "key" like 'wyr-vote:%' and "last_request" < ${window - 10 * VOTE_WINDOW_MS}
      order by "id" limit 100 for update skip locked
    ), removed as (
      delete from "rate_limit" using expired
      where "rate_limit"."id" = expired."id"
    )
    insert into "rate_limit" ("id", "key", "count", "last_request")
    values (${key}, ${key}, 1, ${window})
    on conflict ("key") do update set "count" = "rate_limit"."count" + 1
    returning "count"
  `);
  const count = (rows[0] as { count?: unknown } | undefined)?.count;
  if (typeof count !== "number" || !Number.isSafeInteger(count)) {
    throw new Error("Invalid vote rate-limit counter");
  }
  if (count > MAX_VOTES_PER_WINDOW) {
    const response = rejection("Vote rate limit exceeded", 429);
    response.headers.set("Retry-After", String(Math.ceil((window + VOTE_WINDOW_MS - now) / 1000)));
    return response;
  }
  return null;
}
