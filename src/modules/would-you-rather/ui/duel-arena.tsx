"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isKidsCollectionQuestion } from "../domain/filter-questions";
import type { Question, VoteStats } from "../types";
import { PlayHeading, OptionPanels } from "./play/art";
import "./play/play.css";

export interface DuelArenaProps {
  readonly appearance?: "default" | "illustrated-play";
  readonly question: Question | undefined;
  readonly currentIndex: number;
  readonly totalQuestions: number;
  readonly categoryBadge?: string;
  readonly hasActiveFilters?: boolean;
  readonly onNext: () => void;
  readonly onRandom: () => void;
  readonly onOpenPresenter?: (() => void) | undefined;
}

export function DuelArena({
  appearance = "default",
  question,
  currentIndex,
  totalQuestions,
  categoryBadge = "Live Dilemma Arena",
  hasActiveFilters = false,
  onNext,
  onRandom,
  onOpenPresenter,
}: DuelArenaProps) {
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [loadedQuestionId, setLoadedQuestionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const activeRequestIdRef = useRef(0);

  const currentQuestionId = question?.id;
  const aggregateOnly = Boolean(question && isKidsCollectionQuestion(question));
  const voteEndpoint = aggregateOnly ? "/api/wyr/kids-vote" : "/api/wyr/vote";
  // 1. 读取当前题目的投票状态 (标准异步 fetch，带 AbortController 与 ignore 清理函数)
  useEffect(() => {
    if (!currentQuestionId) return;

    let ignore = false;
    const controller = new AbortController();

    fetch(`${voteEndpoint}?questionId=${encodeURIComponent(currentQuestionId)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch vote statistics`);
        }
        return res.json() as Promise<VoteStats>;
      })
      .then((data) => {
        if (!ignore) {
          setVoteStats(data);
          setLoadedQuestionId(currentQuestionId);
        }
      })
      .catch((err: unknown) => {
        if (!ignore && (err as { name?: string })?.name !== "AbortError") {
          setErrorMessage("Unable to connect to voting database. Questions remain fully playable.");
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [currentQuestionId, refreshCount, voteEndpoint]);

  // 2. 提交投票或改选 (鼠标与键盘走完全一致的逻辑)
  const handleVote = useCallback(
    async (option: "A" | "B") => {
      const aggregateVoteAlreadySubmitted =
        aggregateOnly &&
        loadedQuestionId === currentQuestionId &&
        Boolean(voteStats?.hasVoted);
      if (!currentQuestionId || isSubmitting || aggregateVoteAlreadySubmitted) return;

      setIsSubmitting(true);
      setErrorMessage(null);
      const requestId = ++activeRequestIdRef.current;

      try {
        const res = await fetch(voteEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ questionId: currentQuestionId, option }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}: Could not record vote`);
        }

        const data = (await res.json()) as VoteStats;
        if (requestId === activeRequestIdRef.current) {
          setVoteStats(data);
          setLoadedQuestionId(currentQuestionId);
          setIsSubmitting(false);
        }
      } catch (err: unknown) {
        if (requestId === activeRequestIdRef.current) {
          setIsSubmitting(false);
          const msg = err instanceof Error ? err.message : "Vote submission failed";
          setErrorMessage(msg);
        }
      }
    },
    [aggregateOnly, currentQuestionId, isSubmitting, loadedQuestionId, voteEndpoint, voteStats],
  );

  // 3. 键盘快捷键监听 (A / B / 左右箭头选择与改选)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.querySelector(".presenter-page")) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // 不拦截带修饰键的浏览器快捷键
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
        e.preventDefault();
        void handleVote("A");
      } else if (e.key === "b" || e.key === "B" || e.key === "ArrowRight") {
        e.preventDefault();
        void handleVote("B");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleVote]);

  if (!question) {
    return (
      <section id="play" className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {hasActiveFilters
              ? "No dilemma matches your active filters"
              : "Dilemmas are Currently Under Editorial Review"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {hasActiveFilters
              ? "Try adjusting your search keywords or resetting category filters below."
              : "Our editorial process is reviewing dilemmas for verified age ratings and suitability. The interactive arena will open once dilemmas are approved."}
          </p>
        </div>
      </section>
    );
  }

  const currentStats = loadedQuestionId === currentQuestionId ? voteStats : null;
  const hasVoted = Boolean(currentStats?.hasVoted);
  const userPick = currentStats?.selectedOption ?? null;

  if (appearance === "illustrated-play") {
    const choice = (option: "A" | "B") => (
      <>
        <button
          className={`choose-option choose-${option.toLowerCase()}`}
          disabled={isSubmitting || (aggregateOnly && hasVoted)}
          aria-label={`Choose option ${option}`}
          aria-pressed={userPick === option}
          onClick={() => void handleVote(option)}
        >
          {isSubmitting
            ? "Recording…"
            : userPick === option
              ? "Your choice ✓"
              : aggregateOnly && hasVoted
                ? "Vote recorded"
                : "Choose This"}
        </button>
        {hasVoted && currentStats && (
          <p className="play-vote-result">
            {option === "A" ? currentStats.percentageA : currentStats.percentageB}% ·{" "}
            {option === "A" ? currentStats.votesA : currentStats.votesB} votes
          </p>
        )}
      </>
    );
    return (
      <section id="play" className="illustrated-arena">
        <PlayHeading question={question.question} />
        {errorMessage && (
          <p className="play-error" role="alert">
            {errorMessage} <button onClick={() => setRefreshCount((c) => c + 1)}>Retry</button>
          </p>
        )}
        <OptionPanels
          a={question.optionA}
          b={question.optionB}
          childrenA={choice("A")}
          childrenB={choice("B")}
        />
      </section>
    );
  }

  return (
    <section
      id="play"
      tabIndex={-1}
      className="relative mx-auto w-full max-w-5xl px-4 py-8 outline-none sm:px-6"
    >
      {/* 头部元数据徽标与全屏展示按钮 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-semibold text-muted shadow-sm">
          <span className="size-2 rounded-full bg-[#e27d32] animate-pulse" />
          <span>{categoryBadge}</span>
          <span className="text-border">·</span>
          <span>
            #{currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        {onOpenPresenter && (
          <button
            type="button"
            onClick={onOpenPresenter}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-semibold text-muted transition hover:border-[#19a4b8]/50 hover:text-foreground hover:shadow-sm"
            title="Fullscreen presentation mode for smartboard, projector or TV"
          >
            <svg
              className="size-3.5 text-[#19a4b8]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>Presenter Mode</span>
          </button>
        )}
      </div>

      {/* 题干展示区 */}
      <div className="mb-8 text-center sm:mb-12">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-tight text-balance">
          {question.question}
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted">
          {question.ageGroups.length > 0 && (
            <span className="rounded-md bg-surface-muted px-2 py-0.5">
              Age: {question.ageGroups.join(", ")}
            </span>
          )}
          {question.relationships.length > 0 && (
            <span className="rounded-md bg-surface-muted px-2 py-0.5 capitalize">
              For: {question.relationships.join(", ")}
            </span>
          )}
          {question.occasions.length > 0 && (
            <span className="rounded-md bg-surface-muted px-2 py-0.5 capitalize">
              Scene: {question.occasions[0]?.replace("-", " ")}
            </span>
          )}
          <span className="rounded-md bg-surface-muted px-2 py-0.5 capitalize">
            Difficulty: {question.difficulty}
          </span>
        </div>
      </div>

      {/* 错误反馈提示区 */}
      {errorMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-800 dark:text-red-300">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setRefreshCount((c) => c + 1)}
            className="font-bold underline underline-offset-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* 对决栅格：选项 A vs 选项 B */}
      <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
        {/* 中心 VS 徽标 */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center md:flex">
          <div className="flex size-14 items-center justify-center rounded-full border border-border bg-surface font-serif text-xs font-black tracking-widest text-muted shadow-xl">
            VS
          </div>
        </div>

        {/* 选项 A 卡片 */}
        <button
          type="button"
          onClick={() => void handleVote("A")}
          disabled={isSubmitting || (aggregateOnly && hasVoted)}
          aria-pressed={userPick === "A"}
          className={`group relative flex min-h-[220px] flex-col justify-between rounded-2xl border p-6 text-left transition-all sm:min-h-[260px] sm:p-8 ${
            userPick === "A"
              ? "border-[#e27d32] bg-[#e27d32]/10 shadow-[0_0_28px_rgba(226,125,50,0.2)] ring-2 ring-[#e27d32]"
              : "border-border bg-surface hover:-translate-y-1 hover:border-[#e27d32]/60 hover:shadow-lg"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black tracking-wider text-[#b45309] uppercase dark:text-[#f59e0b]">
                Option A
              </span>
              <span className="hidden rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-mono text-muted group-hover:border-[#e27d32]/40 group-hover:text-foreground sm:inline-block">
                Key: A / ←
              </span>
            </div>

            <p className="my-4 text-xl font-bold text-foreground sm:text-2xl sm:leading-snug">
              {question.optionA}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {hasVoted && currentStats && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="text-[#e27d32]">{currentStats.percentageA}%</span>
                  <span className="text-muted">{currentStats.votesA.toLocaleString()} votes</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full bg-[#e27d32] transition-all duration-500 ease-out"
                    style={{ width: `${currentStats.percentageA}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">
                {userPick === "A"
                  ? "✓ Your Choice"
                  : aggregateOnly && hasVoted
                    ? "Vote recorded"
                    : hasVoted
                      ? "Click to switch to A"
                      : isSubmitting
                        ? "Recording vote..."
                        : "Click to choose A"}
              </span>
              <div
                className={`size-5 rounded-full border-2 transition-all ${
                  userPick === "A"
                    ? "border-[#e27d32] bg-[#e27d32]"
                    : "border-border group-hover:border-[#e27d32]"
                }`}
              />
            </div>
          </div>
        </button>

        {/* 选项 B 卡片 */}
        <button
          type="button"
          onClick={() => void handleVote("B")}
          disabled={isSubmitting || (aggregateOnly && hasVoted)}
          aria-pressed={userPick === "B"}
          className={`group relative flex min-h-[220px] flex-col justify-between rounded-2xl border p-6 text-left transition-all sm:min-h-[260px] sm:p-8 ${
            userPick === "B"
              ? "border-[#19a4b8] bg-[#19a4b8]/10 shadow-[0_0_28px_rgba(25,164,184,0.2)] ring-2 ring-[#19a4b8]"
              : "border-border bg-surface hover:-translate-y-1 hover:border-[#19a4b8]/60 hover:shadow-lg"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black tracking-wider text-[#0e7490] uppercase dark:text-[#22d3ee]">
                Option B
              </span>
              <span className="hidden rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-mono text-muted group-hover:border-[#19a4b8]/40 group-hover:text-foreground sm:inline-block">
                Key: B / →
              </span>
            </div>

            <p className="my-4 text-xl font-bold text-foreground sm:text-2xl sm:leading-snug">
              {question.optionB}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {hasVoted && currentStats && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="text-[#19a4b8]">{currentStats.percentageB}%</span>
                  <span className="text-muted">{currentStats.votesB.toLocaleString()} votes</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full bg-[#19a4b8] transition-all duration-500 ease-out"
                    style={{ width: `${currentStats.percentageB}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">
                {userPick === "B"
                  ? "✓ Your Choice"
                  : aggregateOnly && hasVoted
                    ? "Vote recorded"
                    : hasVoted
                      ? "Click to switch to B"
                      : isSubmitting
                        ? "Recording vote..."
                        : "Click to choose B"}
              </span>
              <div
                className={`size-5 rounded-full border-2 transition-all ${
                  userPick === "B"
                    ? "border-[#19a4b8] bg-[#19a4b8]"
                    : "border-border group-hover:border-[#19a4b8]"
                }`}
              />
            </div>
          </div>
        </button>
      </div>

      {/* 底部反馈与切题按钮组 */}
      <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center sm:mt-10">
        {hasVoted && currentStats ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm font-medium text-foreground">
              You chose{" "}
              <span className="font-bold underline decoration-[#e27d32] underline-offset-4">
                {userPick === "A" ? question.optionA : question.optionB}
              </span>
              . Total of {currentStats.total.toLocaleString()} votes received on wyrplay.com.
              {aggregateOnly
                ? " This Kids vote is counted without retaining a reusable voter identifier."
                : " Click the other option to change your choice anytime!"}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            Tap Option A or B above to submit your stance and view community results.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-background shadow-md transition hover:opacity-90 active:scale-95"
          >
            <span>Next Question</span>
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={onRandom}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-foreground/30 hover:text-foreground"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Random</span>
          </button>
        </div>
      </div>
    </section>
  );
}
