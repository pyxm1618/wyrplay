"use client";

import Image from "next/image";
import { getQuestionVisual } from "../data/question-visuals";
import "./question-visual.css";

export type QuestionVisualMode = "full" | "option-a" | "option-b";

export interface QuestionVisualProps {
  readonly questionId: string;
  readonly mode?: QuestionVisualMode;
  readonly alt?: string;
  readonly priority?: boolean;
  readonly sizes?: string;
  readonly quality?: number;
  readonly className?: string;
  readonly imgClassName?: string;
}

/**
 * QuestionVisual 统一题目视觉展示组件
 *
 * 遵循“一题一张 2:1 母版”原则：
 * - "full": 完整展示 2:1 插画
 * - "option-a": 精确截取左半幅 50%
 * - "option-b": 精确截取右半幅 50%
 *
 * 若无已登记母版则返回 null，由调用方展示原生 fallback。
 */
export function QuestionVisual({
  questionId,
  mode = "full",
  alt,
  priority = false,
  sizes,
  quality,
  className = "",
  imgClassName = "",
}: QuestionVisualProps) {
  const asset = getQuestionVisual(questionId);
  if (!asset) {
    return null;
  }

  const effectiveAlt =
    alt ??
    (mode === "option-a"
      ? `${asset.alt} (Option A)`
      : mode === "option-b"
        ? `${asset.alt} (Option B)`
        : asset.alt);

  const defaultSizes =
    mode === "full"
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
      : "(max-width: 640px) 50vw, 320px";

  return (
    <span
      className={`question-visual-frame ${className}`}
      data-mode={mode}
      {...(!effectiveAlt ? { "aria-hidden": true } : {})}
    >
      <Image
        src={asset.src}
        alt={effectiveAlt}
        width={asset.width}
        height={asset.height}
        sizes={sizes ?? defaultSizes}
        {...(quality !== undefined ? { quality } : {})}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className={`question-visual-img ${imgClassName}`}
      />
    </span>
  );
}
