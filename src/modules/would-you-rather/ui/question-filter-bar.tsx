"use client";

import type { AgeGroup, Difficulty, Occasion, Relationship, Tone } from "../types";

export interface QuestionFilterBarProps {
  readonly searchKeyword: string;
  readonly onSearchChange: (keyword: string) => void;
  readonly selectedAgeGroup: AgeGroup | undefined;
  readonly onAgeGroupChange: (age: AgeGroup | undefined) => void;
  readonly selectedRelationship: Relationship | undefined;
  readonly onRelationshipChange: (rel: Relationship | undefined) => void;
  readonly selectedOccasion: Occasion | undefined;
  readonly onOccasionChange: (occ: Occasion | undefined) => void;
  readonly selectedTone: Tone | undefined;
  readonly onToneChange: (tone: Tone | undefined) => void;
  readonly selectedDifficulty: Difficulty | undefined;
  readonly onDifficultyChange: (diff: Difficulty | undefined) => void;
  readonly matchedCount: number;
  readonly totalCount: number;
  readonly onClearFilters: () => void;
}

export function QuestionFilterBar({
  searchKeyword,
  onSearchChange,
  selectedAgeGroup,
  onAgeGroupChange,
  selectedRelationship,
  onRelationshipChange,
  selectedOccasion,
  onOccasionChange,
  selectedTone,
  onToneChange,
  selectedDifficulty,
  onDifficultyChange,
  matchedCount,
  totalCount,
  onClearFilters,
}: QuestionFilterBarProps) {
  const hasActiveFilters = Boolean(
    searchKeyword.trim() !== "" ||
    selectedAgeGroup ||
    selectedRelationship ||
    selectedOccasion ||
    selectedTone ||
    selectedDifficulty,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        {/* 顶部搜索框 */}
        <div className="relative mb-5 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search dilemmas by keyword, food, superpowers, animals..."
            className="w-full rounded-xl border border-border bg-surface-muted/60 py-2.5 pr-10 pl-10 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:bg-surface focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted hover:text-foreground"
              aria-label="Clear search keyword"
            >
              ✕
            </button>
          )}
        </div>

        {/* 维度筛选组 */}
        <div className="flex flex-col gap-3 text-xs">
          {/* 年龄维度 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 font-semibold text-black/80 dark:text-white/80">Age:</span>
            <button
              type="button"
              onClick={() => onAgeGroupChange(undefined)}
              className={`rounded-full px-2.5 py-1 font-medium transition ${
                !selectedAgeGroup
                  ? "bg-[#121418] text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                  : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
              }`}
            >
              All Ages
            </button>
            {(["4-6", "7-9", "10-12", "13-17", "18+"] as const).map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => onAgeGroupChange(selectedAgeGroup === age ? undefined : age)}
                className={`rounded-full px-2.5 py-1 font-medium transition ${
                  selectedAgeGroup === age
                    ? "bg-[#e27d32] text-white"
                    : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
                }`}
              >
                {age === "18+" ? "Adults 18+" : age === "13-17" ? "Teens 13–17" : `Kids ${age}`}
              </button>
            ))}
          </div>

          {/* 参与关系维度 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 font-semibold text-black/80 dark:text-white/80">Group:</span>
            <button
              type="button"
              onClick={() => onRelationshipChange(undefined)}
              className={`rounded-full px-2.5 py-1 font-medium transition ${
                !selectedRelationship
                  ? "bg-[#121418] text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                  : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
              }`}
            >
              All Groups
            </button>
            {(["friends", "family", "couples", "coworkers"] as const).map((rel) => (
              <button
                key={rel}
                type="button"
                onClick={() => onRelationshipChange(selectedRelationship === rel ? undefined : rel)}
                className={`rounded-full px-2.5 py-1 font-medium capitalize transition ${
                  selectedRelationship === rel
                    ? "bg-[#19a4b8] text-white"
                    : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
                }`}
              >
                {rel}
              </button>
            ))}
          </div>

          {/* 场景与气氛维度 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 font-semibold text-black/80 dark:text-white/80">Scene:</span>
            <button
              type="button"
              onClick={() => onOccasionChange(undefined)}
              className={`rounded-full px-2.5 py-1 font-medium transition ${
                !selectedOccasion
                  ? "bg-[#121418] text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                  : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
              }`}
            >
              All Scenes
            </button>
            {(["classroom", "party", "road-trip", "dinner", "date-night"] as const).map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => onOccasionChange(selectedOccasion === occ ? undefined : occ)}
                className={`rounded-full px-2.5 py-1 font-medium capitalize transition ${
                  selectedOccasion === occ
                    ? "bg-[#121418] text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                    : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
                }`}
              >
                {occ.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* 气氛基调维度 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 font-semibold text-black/80 dark:text-white/80">Tone:</span>
            <button
              type="button"
              onClick={() => onToneChange(undefined)}
              className={`rounded-full px-2.5 py-1 font-medium transition ${
                !selectedTone
                  ? "bg-[#121418] text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                  : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
              }`}
            >
              All Tones
            </button>
            {(["funny", "weird", "deep"] as const).map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => onToneChange(selectedTone === tone ? undefined : tone)}
                className={`rounded-full px-2.5 py-1 font-medium capitalize transition ${
                  selectedTone === tone
                    ? "bg-[#e27d32] text-white"
                    : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
                }`}
              >
                {tone}
              </button>
            ))}
          </div>

          {/* 难度维度 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-16 font-semibold text-black/80 dark:text-white/80">Difficulty:</span>
            <button
              type="button"
              onClick={() => onDifficultyChange(undefined)}
              className={`rounded-full px-2.5 py-1 font-medium transition ${
                !selectedDifficulty
                  ? "bg-[#121418] text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                  : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
              }`}
            >
              Any Difficulty
            </button>
            {(["easy", "hard"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => onDifficultyChange(selectedDifficulty === diff ? undefined : diff)}
                className={`rounded-full px-2.5 py-1 font-medium capitalize transition ${
                  selectedDifficulty === diff
                    ? "bg-[#121418] text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                    : "border border-border bg-surface text-black dark:text-white hover:border-foreground/40"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* 结果统计与清除栏 */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
          <span className="font-medium text-muted">
            {totalCount === 0 ? (
              <span>0 playable dilemmas (questions undergoing editorial review)</span>
            ) : (
              <span>
                Showing <strong className="text-foreground">{matchedCount}</strong> of {totalCount}{" "}
                playable dilemmas
              </span>
            )}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="font-semibold text-[#e27d32] underline-offset-2 transition hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
