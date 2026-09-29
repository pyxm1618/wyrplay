"use client";

import { useEffect } from "react";
import type { Question } from "../types";

interface PresenterModalProps {
  readonly isOpen: boolean;
  readonly question: Question;
  readonly onNext: () => void;
  readonly onPrev: () => void;
  readonly onClose: () => void;
  readonly currentIndex: number;
  readonly totalCount: number;
}

export function PresenterModal({
  isOpen,
  question,
  onNext,
  onPrev,
  onClose,
  currentIndex,
  totalCount,
}: PresenterModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        onNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Presenter Mode"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0a0b0d] p-6 text-[#f2f3f5] sm:p-12 md:p-16"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-[#e27d32] to-[#19a4b8] text-[11px] font-black text-white">
            WYR
          </span>
          <span className="text-sm font-semibold tracking-wide text-white/70 uppercase">
            Presenter Mode · Classroom & Party Screen
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-white/50">
            Question {currentIndex + 1} of {totalCount}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            Exit (Esc)
          </button>
        </div>
      </div>

      {/* Main Dilemma Arena */}
      <div className="my-auto mx-auto w-full max-w-5xl text-center">
        <p className="mb-4 text-xs font-bold tracking-widest text-[#e27d32] uppercase sm:text-sm">
          Audience: {question.audience} · Style: {question.style}
        </p>
        <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
          {question.question}
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10">
          <div className="flex flex-col justify-between rounded-2xl border-2 border-[#e27d32]/40 bg-[#121418] p-8 text-left shadow-2xl transition hover:border-[#e27d32]">
            <span className="text-xs font-black tracking-widest text-[#e27d32] uppercase">
              Option A
            </span>
            <p className="my-6 text-2xl font-bold sm:text-3xl text-white">
              {question.optionA}
            </p>
            <div className="text-xs font-medium text-white/40">Choice A</div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border-2 border-[#19a4b8]/40 bg-[#121418] p-8 text-left shadow-2xl transition hover:border-[#19a4b8]">
            <span className="text-xs font-black tracking-widest text-[#19a4b8] uppercase">
              Option B
            </span>
            <p className="my-6 text-2xl font-bold sm:text-3xl text-white">
              {question.optionB}
            </p>
            <div className="text-xs font-medium text-white/40">Choice B</div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50">
        <div>
          Keyboard: <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">Space</kbd> /{" "}
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">→</kbd> Next ·{" "}
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">←</kbd> Prev
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15 disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-white px-5 py-2 text-xs font-bold text-black transition hover:bg-white/90"
          >
            Next Question →
          </button>
        </div>
      </div>
    </div>
  );
}
