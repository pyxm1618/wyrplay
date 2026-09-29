"use client";

import { useCallback, useEffect, useState } from "react";
import type { Question } from "../types";
import { PresenterModal } from "./presenter-modal";

interface DuelArenaProps {
  readonly questions: readonly Question[];
  readonly categoryBadge?: string;
  readonly defaultIndex?: number;
}

export function DuelArena({
  questions,
  categoryBadge = "Live Dilemma Arena",
  defaultIndex = 0,
}: DuelArenaProps) {
  const [index, setIndex] = useState(defaultIndex);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | null>(null);
  const [isPresenterOpen, setIsPresenterOpen] = useState(false);

  const currentQuestion = questions[index] || questions[0];

  useEffect(() => {
    const handleCustomPick = (e: Event) => {
      const customEvent = e as CustomEvent<{ questionId: string }>;
      const foundIdx = questions.findIndex((q) => q.id === customEvent.detail?.questionId);
      if (foundIdx !== -1) {
        setIndex(foundIdx);
        setSelectedOption(null);
        const arenaElement = document.getElementById("play");
        if (arenaElement) {
          arenaElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    window.addEventListener("wyr:pick-question", handleCustomPick);
    return () => window.removeEventListener("wyr:pick-question", handleCustomPick);
  }, [questions]);

  const handleNext = useCallback(() => {
    setSelectedOption(null);
    setIndex((prev) => (prev + 1) % questions.length);
  }, [questions.length]);

  const handleRandom = useCallback(() => {
    setSelectedOption(null);
    if (questions.length <= 1) return;
    setIndex((prev) => {
      let nextIdx = Math.floor(Math.random() * questions.length);
      while (nextIdx === prev) {
        nextIdx = Math.floor(Math.random() * questions.length);
      }
      return nextIdx;
    });
  }, [questions.length]);

  const handlePrev = useCallback(() => {
    setSelectedOption(null);
    setIndex((prev) => (prev - 1 + questions.length) % questions.length);
  }, [questions.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPresenterOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === "a" || e.key === "A" || e.key === "ArrowLeft") && !selectedOption) {
        setSelectedOption("A");
      } else if ((e.key === "b" || e.key === "B" || e.key === "ArrowRight") && !selectedOption) {
        setSelectedOption("B");
      } else if ((e.key === "Enter" || e.key === " ") && selectedOption) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenterOpen, selectedOption, handleNext]);

  if (!currentQuestion) return null;

  return (
    <section id="play" className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      {/* Context Badge & Screen Mode */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-semibold text-muted shadow-sm">
          <span className="size-2 rounded-full bg-[#e27d32] animate-pulse" />
          <span>{categoryBadge}</span>
          <span className="text-border">·</span>
          <span>
            #{index + 1} of {questions.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsPresenterOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-semibold text-muted transition hover:border-[#19a4b8]/50 hover:text-foreground hover:shadow-sm"
          title="Fullscreen presentation mode for projector or TV"
        >
          <svg className="size-3.5 text-[#19a4b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Presenter Mode</span>
        </button>
      </div>

      {/* Dilemma Question Heading */}
      <div className="mb-8 text-center sm:mb-12">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-tight text-balance">
          {currentQuestion.question}
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted">
          <span className="rounded-md bg-surface-muted px-2 py-0.5 capitalize">
            Audience: {currentQuestion.audience}
          </span>
          <span className="rounded-md bg-surface-muted px-2 py-0.5 capitalize">
            Occasion: {currentQuestion.occasion.replace("-", " ")}
          </span>
          <span className="rounded-md bg-surface-muted px-2 py-0.5 capitalize">
            Style: {currentQuestion.style}
          </span>
        </div>
      </div>

      {/* Duel Grid: Option A vs Option B with Center VS Seal */}
      <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
        {/* Center VS Seal */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center md:flex">
          <div className="flex size-14 items-center justify-center rounded-full border border-border bg-surface font-serif text-xs font-black tracking-widest text-muted shadow-xl">
            VS
          </div>
        </div>

        {/* Option A Card (Amber Gold) */}
        <button
          type="button"
          onClick={() => setSelectedOption("A")}
          aria-pressed={selectedOption === "A"}
          className={`group relative flex min-h-[220px] flex-col justify-between rounded-2xl border p-6 text-left transition-all sm:min-h-[260px] sm:p-8 ${
            selectedOption === "A"
              ? "border-[#e27d32] bg-[#e27d32]/10 shadow-[0_0_28px_rgba(226,125,50,0.2)] ring-2 ring-[#e27d32]"
              : "border-border bg-surface hover:-translate-y-1 hover:border-[#e27d32]/60 hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black tracking-wider text-[#e27d32] uppercase">
              Option A
            </span>
            <span className="hidden rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-mono text-muted group-hover:border-[#e27d32]/40 group-hover:text-foreground sm:inline-block">
              Key: A / ←
            </span>
          </div>

          <p className="my-4 text-xl font-bold text-foreground sm:text-2xl sm:leading-snug">
            {currentQuestion.optionA}
          </p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-muted">
              {selectedOption === "A" ? "✓ Your Choice" : "Click to choose A"}
            </span>
            <div
              className={`size-5 rounded-full border-2 transition-all ${
                selectedOption === "A"
                  ? "border-[#e27d32] bg-[#e27d32]"
                  : "border-border group-hover:border-[#e27d32]"
              }`}
            />
          </div>
        </button>

        {/* Option B Card (Glacial Cyan) */}
        <button
          type="button"
          onClick={() => setSelectedOption("B")}
          aria-pressed={selectedOption === "B"}
          className={`group relative flex min-h-[220px] flex-col justify-between rounded-2xl border p-6 text-left transition-all sm:min-h-[260px] sm:p-8 ${
            selectedOption === "B"
              ? "border-[#19a4b8] bg-[#19a4b8]/10 shadow-[0_0_28px_rgba(25,164,184,0.2)] ring-2 ring-[#19a4b8]"
              : "border-border bg-surface hover:-translate-y-1 hover:border-[#19a4b8]/60 hover:shadow-lg"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black tracking-wider text-[#19a4b8] uppercase">
              Option B
            </span>
            <span className="hidden rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-mono text-muted group-hover:border-[#19a4b8]/40 group-hover:text-foreground sm:inline-block">
              Key: B / →
            </span>
          </div>

          <p className="my-4 text-xl font-bold text-foreground sm:text-2xl sm:leading-snug">
            {currentQuestion.optionB}
          </p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-muted">
              {selectedOption === "B" ? "✓ Your Choice" : "Click to choose B"}
            </span>
            <div
              className={`size-5 rounded-full border-2 transition-all ${
                selectedOption === "B"
                  ? "border-[#19a4b8] bg-[#19a4b8]"
                  : "border-border group-hover:border-[#19a4b8]"
              }`}
            />
          </div>
        </button>
      </div>

      {/* Choice Feedback & Next Question Controls */}
      <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center sm:mt-10">
        {selectedOption ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm font-medium text-foreground">
              You chose{" "}
              <span className="font-bold underline decoration-[#e27d32] underline-offset-4">
                {selectedOption === "A" ? currentQuestion.optionA : currentQuestion.optionB}
              </span>
              . Debate your reasons or keep playing!
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            Tap Option A or B above to lock in your decision.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-background shadow-md transition hover:opacity-90 active:scale-95"
          >
            <span>Next Question</span>
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleRandom}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-foreground/30 hover:text-foreground"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Random</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Presenter Modal */}
      <PresenterModal
        isOpen={isPresenterOpen}
        question={currentQuestion}
        onNext={handleNext}
        onPrev={handlePrev}
        onClose={() => setIsPresenterOpen(false)}
        currentIndex={index}
        totalCount={questions.length}
      />
    </section>
  );
}
