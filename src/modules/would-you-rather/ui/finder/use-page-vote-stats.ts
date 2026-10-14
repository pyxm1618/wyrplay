"use client";
import { useEffect, useState } from "react";
import { parseVoteStats } from "../../domain/finder";
import type { Question, VoteStats } from "../../types";

export function usePageVoteStats(questions: readonly Question[], enabled: boolean) {
  const key = questions.map((q) => q.id).join(",");
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    stats?: Record<string, VoteStats>;
    error?: string;
  } | null>(null);
  useEffect(() => {
    if (!enabled || !key) return;
    const controller = new AbortController();
    const ids = key.split(",");
    const params = new URLSearchParams(ids.map((id) => ["questionId", id]));
    void fetch(`/api/wyr/vote-stats?${params}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load vote statistics");
        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object" || Array.isArray(payload))
          throw new Error("Invalid vote statistics response");
        const stats: Record<string, VoteStats> = {};
        for (const id of ids) stats[id] = parseVoteStats((payload as Record<string, unknown>)[id]);
        if (!controller.signal.aborted) setResult({ key, stats });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            error: error instanceof Error ? error.message : "Could not load vote statistics",
          });
      });
    return () => controller.abort();
  }, [key, retry, enabled]);
  return {
    stats: result?.key === key ? result.stats : undefined,
    error: result?.key === key ? result.error : undefined,
    retry: () => setRetry((n) => n + 1),
  };
}
