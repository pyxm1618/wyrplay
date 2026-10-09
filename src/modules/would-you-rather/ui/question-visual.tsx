import Image from "next/image";
import type { ReactNode } from "react";
import {
  getQuestionVisual,
  type QuestionVisualAsset,
} from "../data/question-visuals";
import "./question-visual.css";

export type QuestionVisualMode = "full" | "option-a" | "option-b";

export interface QuestionVisualProps {
  readonly questionId?: string | undefined;
  readonly visual?: QuestionVisualAsset | undefined;
  readonly mode?: QuestionVisualMode | undefined;
  readonly priority?: boolean | undefined;
  readonly sizes?: string | undefined;
  readonly quality?: number | undefined;
  readonly className?: string | undefined;
  readonly imgClassName?: string | undefined;
  readonly alt?: string | undefined;
  readonly fallback?: ReactNode | undefined;
}

/**
 * QuestionVisual: 统一题目视觉展示组件
 *
 * 功能规范：
 * - mode="full": 显示完整 2:1 插画。
 * - mode="option-a": 精确显示左半幅 50%（1:1 正方形）。
 * - mode="option-b": 精确显示右半幅 50%（1:1 正方形）。
 * - 性能规范：利用纯 CSS 几何分区，无 Canvas 实时裁图，无主线程阻塞，预占比例无 CLS。
 * - 响应式加载：复用 Next.js 现有图片优化与 sizes / srcset 协商机制。
 */
export function QuestionVisual({
  questionId,
  visual: directVisual,
  mode = "full",
  priority = false,
  sizes,
  quality,
  className = "",
  imgClassName = "",
  alt,
  fallback = null,
}: QuestionVisualProps) {
  const asset = directVisual ?? getQuestionVisual(questionId);

  if (!asset) {
    return <>{fallback}</>;
  }

  const effectiveAlt =
    alt ??
    (mode === "option-a"
      ? `${asset.alt} (Option A)`
      : mode === "option-b"
        ? `${asset.alt} (Option B)`
        : asset.alt);

  // 默认根据展示模式分配合适的 responsive sizes
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
