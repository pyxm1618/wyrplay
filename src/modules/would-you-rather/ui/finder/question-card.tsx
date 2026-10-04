"use client";
/* eslint-disable @next/next/no-img-element -- Small native screenshot artwork is reused without image regeneration. */
import { useEffect, useState } from "react";
import type { Question, VoteStats } from "../../types";
import { parseVoteStats } from "../../domain/finder";
import { FinderIcon } from "./icon";

function QuestionVoteSummary({ id, revision }: { readonly id: string; readonly revision: number }) {
  const [result, setResult] = useState<{
    readonly id: string;
    readonly stats?: VoteStats;
    readonly error?: string;
  } | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/wyr/vote?questionId=${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Vote statistics HTTP ${response.status}`);
        return parseVoteStats(await response.json());
      })
      .then((stats) => {
        if (!controller.signal.aborted) setResult({ id, stats });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            id,
            error: error instanceof Error ? error.message : "Could not load vote statistics",
          });
      });
    return () => controller.abort();
  }, [id, revision, retry]);
  const current = result?.id === id ? result : null;
  return (
    <p className="question-stats">
      <img src="/finder/assets/people.png" alt="" />
      {current?.error ? (
        <button
          className="stats-retry"
          title={current.error}
          onClick={() => setRetry((n) => n + 1)}
        >
          Stats unavailable · Retry
        </button>
      ) : current?.stats ? (
        current.stats.total === 0 ? (
          "No votes yet"
        ) : (
          `${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(current.stats.total)} ${current.stats.total === 1 ? "vote" : "votes"} · ${current.stats.percentageA}% choose A`
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
  onSelect,
  onSave,
  revision,
}: {
  readonly question: Question;
  readonly artwork: string;
  readonly number: number;
  readonly selected: boolean;
  readonly saved: boolean;
  readonly onSelect: () => void;
  readonly onSave: () => void;
  readonly revision: number;
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
        <QuestionVoteSummary id={question.id} revision={revision} />
      </div>
      <img className="question-art" src={artwork} alt="" />
      <button
        className={`bookmark icon-button ${saved ? "saved" : ""}`}
        aria-label={`${saved ? "Unsave" : "Save"} question ${number}`}
        aria-pressed={saved}
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
