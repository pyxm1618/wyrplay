"use client";

import type { Question } from "../types";

export interface QuestionDirectoryProps {
  readonly questions: readonly Question[];
  readonly title?: string;
  readonly description?: string;
  readonly hasActiveFilters?: boolean;
  readonly onPlayQuestion?: (questionId: string) => void;
}

export function QuestionDirectory({
  questions,
  title = "Browse Dilemmas Directory",
  description = "A complete, searchable directory of dilemmas to spark conversation anywhere.",
  hasActiveFilters = false,
  onPlayQuestion,
}: QuestionDirectoryProps) {
  const handlePlayQuestion = (questionId: string) => {
    if (onPlayQuestion) {
      onPlayQuestion(questionId);
    } else {
      window.dispatchEvent(
        new CustomEvent("wyr:pick-question", {
          detail: { questionId },
        }),
      );
    }

    const focusArena = () => {
      const arenaElement = document.getElementById("play");
      if (arenaElement) {
        arenaElement.scrollIntoView({ behavior: "smooth" });
        arenaElement.focus({ preventScroll: true });
      }
    };
    focusArena();
    requestAnimationFrame(focusArena);
  };

  return (
    <section id="questions" className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Section Header */}
      <div className="mb-8 text-center sm:mb-12">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">
          {description}
        </p>
      </div>

      {/* Empty State */}
      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            {hasActiveFilters ? "No questions found" : "No approved dilemmas available"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {hasActiveFilters
              ? "Try adjusting your search query or clearing selected filters above."
              : "All dilemmas are currently undergoing editorial review. Check back soon for the verified collection."}
          </p>
        </div>
      ) : (
        /* Questions Stack */
        <div className="space-y-3.5">
          {questions.map((item, idx) => (
            <article
              key={item.id}
              className="group flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-all hover:border-foreground/20 hover:shadow-md sm:flex-row sm:items-center sm:p-6"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-muted">
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                  {item.ageGroups.length > 0 && (
                    <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                      Age {item.ageGroups.join(", ")}
                    </span>
                  )}
                  {item.relationships.length > 0 && (
                    <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted capitalize">
                      {item.relationships[0]}
                    </span>
                  )}
                  {item.difficulty && (
                    <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted capitalize">
                      {item.difficulty}
                    </span>
                  )}
                  {item.reviewStatus !== "approved" ? (
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      Under Review
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Verified
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-base font-bold text-foreground sm:text-lg">
                  {item.question}
                </h3>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-muted">
                    <span className="font-mono font-black text-[#9c4307] dark:text-[#f0893f]">
                      A:
                    </span>
                    <span>{item.optionA}</span>
                  </div>
                  <span className="hidden text-border sm:inline">|</span>
                  <div className="flex items-center gap-1.5 text-muted">
                    <span className="font-mono font-black text-[#0e6d7c] dark:text-[#38c4d8]">
                      B:
                    </span>
                    <span>{item.optionB}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0">
                {item.reviewStatus === "approved" ? (
                  <button
                    type="button"
                    onClick={() => handlePlayQuestion(item.id)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-neutral-900 transition group-hover:border-[#e27d32]/40 group-hover:bg-[#e27d32]/10 group-hover:text-[#e27d32] dark:bg-surface-muted dark:text-neutral-100 sm:w-auto"
                  >
                    <span>Play this dilemma</span>
                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-dashed border-border px-3.5 py-1.5 text-xs font-medium text-muted">
                    Awaiting Review
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
