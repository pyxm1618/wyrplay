"use client";
/* eslint-disable @next/next/no-img-element -- Local reference brand crop. */

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { PlayHeading, OptionPanels, PlayArtwork } from "./play/art";
import "./play/play.css";
import type { Question } from "../types";

export interface PresenterModalProps {
  readonly returnFocusRef?: RefObject<HTMLButtonElement | null>;
  readonly isOpen: boolean;
  readonly question: Question | undefined;
  readonly onNext: () => void;
  readonly onPrev: () => void;
  readonly onClose: () => void;
  readonly currentIndex: number;
  readonly totalCount: number;
}

/**
 * 检查当前事件目标是否位于交互元素上，防止 Space 键误拦截原生点击行为
 */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'button, a, input, select, textarea, [contenteditable="true"], [role="button"], [role="link"]',
    ),
  );
}

/**
 * 同步用户交互链中的 Fullscreen 请求尝试 (平滑降级，不抛出异常)
 */
export async function tryEnterFullscreen(element?: HTMLElement | null): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const target = element ?? document.documentElement;
  try {
    if (document.fullscreenElement) return true;
    if ("requestFullscreen" in target && typeof target.requestFullscreen === "function") {
      await target.requestFullscreen();
      return true;
    } else if (
      "webkitRequestFullscreen" in target &&
      typeof (target as unknown as { webkitRequestFullscreen: () => Promise<void> })
        .webkitRequestFullscreen === "function"
    ) {
      await (
        target as unknown as { webkitRequestFullscreen: () => Promise<void> }
      ).webkitRequestFullscreen();
      return true;
    }
  } catch {
    // 浏览器权限拒绝或不支持时，平滑降级到 fixed overlay
  }
  return false;
}

/**
 * 安全退出 Fullscreen
 */
export async function tryExitFullscreen(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    if (document.fullscreenElement) {
      if ("exitFullscreen" in document && typeof document.exitFullscreen === "function") {
        await document.exitFullscreen();
      } else if (
        "webkitExitFullscreen" in document &&
        typeof (document as unknown as { webkitExitFullscreen: () => Promise<void> })
          .webkitExitFullscreen === "function"
      ) {
        await (
          document as unknown as { webkitExitFullscreen: () => Promise<void> }
        ).webkitExitFullscreen();
      }
    }
  } catch {
    // 忽略异常
  }
}

export function PresenterModal({
  isOpen,
  returnFocusRef,
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
    document.documentElement.dataset.presenterOpen = "true";
    return () => {
      document.body.style.overflow = previousOverflow;
      delete document.documentElement.dataset.presenterOpen;
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    // Overlay-only mode stays usable when fullscreen permission was denied.
    const fullscreenElement = () =>
      document.fullscreenElement ??
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;
    const synchronize = () => {
      // Both enter and exit events can be queued before delivery. An empty
      // fullscreenElement on a change event means the browser has exited.
      if (!fullscreenElement()) onClose();
    };
    document.addEventListener("fullscreenchange", synchronize);
    document.addEventListener("webkitfullscreenchange", synchronize);
    return () => {
      document.removeEventListener("fullscreenchange", synchronize);
      document.removeEventListener("webkitfullscreenchange", synchronize);
    };
  }, [isOpen, onClose]);

  // 记录打开前的焦点，并在关闭时恢复焦点
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      modalRef.current?.focus();
    } else {
      if (previouslyFocusedElementRef.current) {
        const trigger = returnFocusRef?.current ?? previouslyFocusedElementRef.current;
        trigger?.focus();
        previouslyFocusedElementRef.current = null;
      }
      void tryExitFullscreen();
    }
  }, [isOpen, returnFocusRef]);

  // 键盘快捷键监听：严格对齐按钮与键盘边界
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // 如果焦点在按钮/链接/输入等交互元素上，Space 必须保留原生激活语义（例如触发按钮自身的 click）
      if (e.key === " ") {
        if (isInteractiveTarget(e.target)) {
          if (e.target instanceof HTMLElement && e.target.classList.contains("presenter-exit")) {
            e.preventDefault();
            onClose();
          }
          return;
        }
        e.preventDefault();
        if (!isLast) {
          onNext();
        }
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (!isLast) {
          onNext();
        }
        return;
      }

      // ArrowLeft 对应 Prev：首题禁用时键盘同样禁止回退
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!isFirst) {
          onPrev();
        }
        return;
      }

      // 焦点约束 (Tab 键循环)
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
          Exit Presenter
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
      <div className="presenter-shortcuts" aria-hidden="true">
        <span>
          <kbd>←</kbd> Prev
        </span>
        <span>
          <kbd>Space</kbd> / <kbd>→</kbd> Next
        </span>
        <span>
          <kbd>Esc</kbd> Exit
        </span>
      </div>
    </div>
  );
}
