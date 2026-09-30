"use client";

import { useEffect, useRef } from "react";
import type { Question } from "../types";

export interface PresenterModalProps {
  readonly isOpen: boolean;
  readonly question: Question | undefined;
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
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCount - 1;

  // 记录打开前的焦点，并在关闭时恢复焦点
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      // 转移焦点至 modal
      modalRef.current?.focus();
    } else if (previouslyFocusedElementRef.current) {
      previouslyFocusedElementRef.current.focus();
    }
  }, [isOpen]);

  // 键盘快捷键监听：严格对齐按钮与键盘边界
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Space 或 ArrowRight 对应 Next
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (!isLast) {
          onNext();
        }
      }

      // ArrowLeft 对应 Prev：首题禁用时键盘同样禁止回退
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!isFirst) {
          onPrev();
        }
      }

      // 简单的焦点约束 (Tab 键循环)
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length > 0) {
          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose, isFirst, isLast]);

  if (!isOpen || !question) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Presenter Mode - Big Screen Dilemma"
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-[#0a0b0d] p-6 text-[#f2f3f5] outline-none sm:p-10 md:p-14"
    >
      {/* 顶部导航与退出 */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-[#e27d32] to-[#19a4b8] text-[11px] font-black text-white">
            WYR
          </span>
          <span className="text-xs font-semibold tracking-wider text-white/70 uppercase sm:text-sm">
            Presenter Mode · Classroom & Party Screen
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-white/50 sm:text-sm">
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

      {/* 核心题干与两选展示区 (针对长题与较小屏幕自适应滚动) */}
      <div className="my-auto mx-auto w-full max-w-5xl py-8 text-center">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold tracking-widest text-[#e27d32] uppercase sm:text-sm">
          {question.ageGroups.length > 0 && <span>Age: {question.ageGroups.join(", ")}</span>}
          {question.tones.length > 0 && <span>· Tone: {question.tones.join(", ")}</span>}
          <span>· Difficulty: {question.difficulty}</span>
        </div>

        <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl text-balance">
          {question.question}
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 md:gap-10">
          {/* Option A */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-[#e27d32]/40 bg-[#121418] p-8 text-left shadow-2xl transition hover:border-[#e27d32]">
            <span className="font-mono text-xs font-black tracking-widest text-[#e27d32] uppercase">
              Option A
            </span>
            <p className="my-6 text-2xl font-bold text-white sm:text-3xl">{question.optionA}</p>
            <div className="text-xs font-medium text-white/40">Choice A</div>
          </div>

          {/* Option B */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-[#19a4b8]/40 bg-[#121418] p-8 text-left shadow-2xl transition hover:border-[#19a4b8]">
            <span className="font-mono text-xs font-black tracking-widest text-[#19a4b8] uppercase">
              Option B
            </span>
            <p className="my-6 text-2xl font-bold text-white sm:text-3xl">{question.optionB}</p>
            <div className="text-xs font-medium text-white/40">Choice B</div>
          </div>
        </div>
      </div>

      {/* 底部控制器 */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-white/50">
        <div>
          Keyboard: <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">Space</kbd> /{" "}
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">→</kbd> Next ·{" "}
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">←</kbd> Prev
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isLast}
            className="rounded-full bg-white px-5 py-2 text-xs font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next Question →
          </button>
        </div>
      </div>
    </div>
  );
}
