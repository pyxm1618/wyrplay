"use client";
/* eslint-disable @next/next/no-img-element -- The sub-1KB vote icon stays native; question artwork uses next/image. */
import Image from "next/image";
import type { Question, VoteStats } from "../../types";
import { hasQuestionVisual } from "../../data/question-visuals";
import { QuestionVisual } from "../question-visual";
import { FinderIcon } from "./icon";

function QuestionVoteSummary({
  stats,
  error,
  onRetry,
}: {
  stats?: VoteStats | undefined;
  error?: string | undefined;
  onRetry: () => void;
}) {
  return (
    <p className="question-stats">
      <img src="/finder/assets/people.png" alt="" />
      {error ? (
        <button className="stats-retry" title={error} onClick={onRetry}>
          Stats unavailable · Retry
        </button>
      ) : stats ? (
        stats.total === 0 ? (
          "No votes yet"
        ) : (
          `${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(stats.total)} ${stats.total === 1 ? "vote" : "votes"} · ${stats.percentageA}% choose A`
        )
      ) : (
        "Loading vote stats…"
      )}
    </p>
  );
}

export function FinderQuestionCard({
  question,
  artwork,
  number,
  selected,
  saved,
  saveDisabled,
  onSelect,
  onSave,
  stats,
  statsError,
  onRetryStats,
}: {
  readonly question: Question;
  readonly artwork: string;
  readonly number: number;
  readonly selected: boolean;
  readonly saved: boolean;
  readonly saveDisabled: boolean;
  readonly onSelect: () => void;
  readonly onSave: () => void;
  readonly stats: VoteStats | undefined;
  readonly statsError: string | undefined;
  readonly onRetryStats: () => void;
}) {
  const tags = [
    ...question.tones,
    ...question.relationships,
    ...(question.difficulty ? [question.difficulty] : []),
  ].slice(0, 3);
  return (
    <article
      className={`question-card ${selected ? "is-selected" : ""}`}
      data-question-id={question.id}
    >
      <span className={`question-number number-${((number - 1) % 10) + 1}`}>
        {String(number).padStart(2, "0")}
      </span>
      <div className="question-details">
        <h3>{question.question}</h3>
        <div className="tags">
          {tags.map((tag) => (
            <span
              className={tag === "funny" ? "blue" : tag === "deep" ? "red" : "neutral"}
              key={tag}
            >
              {tag.replaceAll("-", " ")}
            </span>
          ))}
        </div>
        <QuestionVoteSummary stats={stats} error={statsError} onRetry={onRetryStats} />
      </div>
      {hasQuestionVisual(question.id) ? (
        <QuestionVisual
          questionId={question.id}
          mode="full"
          className="question-art"
          sizes="(max-width: 700px) 74px, (max-width: 1099px) 90px, 111px"
        />
      ) : (
        <Image
          className="question-art"
          src={artwork}
          alt=""
          width={111}
          height={83}
          sizes="(max-width: 700px) 74px, (max-width: 1099px) 90px, 111px"
        />
      )}
      <button
        className={`bookmark icon-button ${saved ? "saved" : ""}`}
        aria-label={`${saved ? "Unsave" : "Save"} question ${number}`}
        aria-pressed={saved}
        disabled={saveDisabled}
        onClick={onSave}
      >
        <FinderIcon name="bookmark" size={16} />
      </button>
      <button
        className="select-button black"
        aria-pressed={selected}
        aria-label={`${selected ? "Unselect" : "Select"} question ${number}`}
        onClick={onSelect}
      >
        {selected ? "Selected" : "Select"}
        <FinderIcon name="arrow" size={15} />
      </button>
    </article>
  );
}
