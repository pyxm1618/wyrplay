"use client";
/* eslint-disable @next/next/no-img-element -- Local reference brand crop. */

import { useEffect, useRef } from "react";
import { PlayHeading, OptionPanels, PlayArtwork } from "./play/art";
import "./play/play.css";
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

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      className="presenter-page"
    >
      <PlayArtwork />
      <header className="presenter-header">
        <img src="/play-art/logo.png" alt="WYRPLAY" />
        <span className="presenter-topic">{question.topics[0] ?? "Would You Rather"}</span>
        <b>
          {currentIndex + 1} / {totalCount}
        </b>
        <button className="presenter-exit" onClick={onClose}>
          Exit (Esc)
        </button>
      </header>
      <PlayHeading question={question.question} />
      <OptionPanels a={question.optionA} b={question.optionB} />
      <nav className="presenter-controls" aria-label="Presentation questions">
        <button onClick={onPrev} disabled={isFirst}>
          <span aria-hidden="true">←</span>Previous
        </button>
        <button onClick={onNext} disabled={isLast}>
          <span aria-hidden="true">→</span>Next
        </button>
      </nav>
    </div>
  );
}
