"use client";
import Link from "next/link";
import { useState } from "react";
import type { Question, LeaderboardResult } from "@/modules/would-you-rather";
import { AccountIcon } from "./account-icons";
const categories = [
  ["All", ""],
  ["😃 Funny", "funny"],
  ["☀️ Travel", "travel"],
  ["🍎 Food", "food"],
  ["🐾 Animals", "animals"],
  ["🚀 Space", "space"],
  ["👥 Friends", "friends"],
  ["🏔️ Nature", "nature"],
  ["🤖 Future", "future"],
  ["🎮 Superpower", "superpower"],
] as const;
function poolUrl(path: string, questions: readonly Question[]) {
  return `${path}?${new URLSearchParams({ set: questions.map((q) => q.id).join(",") })}`;
}
export function SavedLibrary({
  questions,
  ready,
  error,
  votes,
  onRemove,
  onPlay,
}: {
  questions: readonly Question[];
  ready: boolean;
  error: string;
  votes: LeaderboardResult;
  onRemove: (id: string) => void;
  onPlay: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = questions.filter(
    (q) =>
      [q.question, q.optionA, q.optionB, ...q.topics, ...q.tones]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (!category || [...q.topics, ...q.tones].includes(category)),
  );
  const pages = Math.ceil(filtered.length / 10);
  const current = Math.min(page, Math.max(1, pages));
  const rows = filtered.slice((current - 1) * 10, current * 10);
  const chosen = questions.filter((q) => selected.includes(q.id));
  const printPool = chosen.length ? chosen : filtered;
  return (
    <section className="saved-library account-panel">
      <div className="library-heading">
        <AccountIcon name="heart" />
        <div>
          <h2>Saved Questions</h2>
          <p>Your favorites, synced across devices.</p>
        </div>
        <label className="library-search">
          <AccountIcon name="search" />
          <input
            type="search"
            aria-label="Search saved questions"
            placeholder="Search saved questions…"
            value={search}
            maxLength={100}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      <nav className="library-categories" aria-label="Saved question categories">
        {categories.map(([label, key]) => (
          <button
            key={key}
            className={category === key ? "active" : ""}
            aria-pressed={category === key}
            onClick={() => {
              setCategory(key);
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="library-toolbar">
        <span className="library-bulb" aria-hidden="true">
          💡
        </span>
        <div>
          <strong>
            {ready ? `You've saved ${questions.length} questions` : "Saved questions unavailable"}
          </strong>
          <p>Play them again, use them for a game, or print a set!</p>
        </div>
        {chosen.length ? (
          <Link className="library-action" href={poolUrl("/play", chosen)}>
            ▶ Play Selected ({chosen.length})
          </Link>
        ) : (
          <button className="library-action" disabled>
            ▶ Play Selected (0)
          </button>
        )}
        {ready && printPool.length ? (
          <Link className="library-action" href={poolUrl("/print", printPool)}>
            ▣ Print / Customize
          </Link>
        ) : (
          <button className="library-action" disabled>
            ▣ Print / Customize
          </button>
        )}
      </div>
      <div className="library-list">
        {rows.map((q) => {
          const count =
            votes.status === "ready"
              ? votes.snapshot.entries.find((e) => e.question.id === q.id)?.total
              : undefined;
          return (
            <article className="library-row" key={q.id}>
              <input
                type="checkbox"
                aria-label={`Select ${q.question}`}
                checked={selected.includes(q.id)}
                onChange={(e) =>
                  setSelected((ids) =>
                    e.target.checked ? [...ids, q.id] : ids.filter((id) => id !== q.id),
                  )
                }
              />
              <button className="library-title" onClick={() => onPlay(q.id)}>
                {q.question
                  .replace(/^would you rather\s+/i, "")
                  .replace(/^./, (letter) => letter.toUpperCase())}
              </button>
              <div className="library-tags">
                {[...q.topics, ...q.tones].slice(0, 2).map((t, i) => (
                  <span key={t + i}>{t}</span>
                ))}
              </div>
              <span
                className="library-votes"
                title={count === undefined ? "Vote counts are unavailable" : undefined}
              >
                <AccountIcon name="heart" />
                {count === undefined
                  ? "—"
                  : new Intl.NumberFormat("en", { notation: "compact" }).format(count)}{" "}
                votes
              </span>
              <button className="library-action" onClick={() => onPlay(q.id)}>
                ▶ Play
              </button>
              <details>
                <summary aria-label={`Options for ${q.question}`}>•••</summary>
                <button onClick={() => onRemove(q.id)}>Remove from saved</button>
              </details>
            </article>
          );
        })}
        {rows.length === 0 && (
          <div className="account-empty">
            <AccountIcon name="heart" />
            <h3>
              {error
                ? "Saved questions unavailable"
                : !ready
                  ? "Loading saved questions…"
                  : questions.length === 0
                    ? "Your favorites start here"
                    : "No matching saved questions"}
            </h3>
            <p>{error || "Save questions in the question finder, or change your filters."}</p>
            <Link href="/find-questions">Find Questions →</Link>
          </div>
        )}
      </div>
      {pages > 1 && (
        <nav className="library-pagination" aria-label="Saved question pages">
          <button disabled={current === 1} onClick={() => setPage(current - 1)}>
            ←
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              aria-label={`Page ${n}`}
              aria-current={n === current ? "page" : undefined}
              className={n === current ? "active" : ""}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button disabled={current === pages} onClick={() => setPage(current + 1)}>
            →
          </button>
        </nav>
      )}
    </section>
  );
}
export function MyQuestionsPanel() {
  return (
    <section className="account-panel my-question-main">
      <h2>My Questions</h2>
      <div className="account-empty">
        <AccountIcon name="game" />
        <p>
          Question submissions are not available yet. Browse our curated questions to find your next
          dilemma.
        </p>
        <Link href="/find-questions">Explore questions →</Link>
      </div>
    </section>
  );
}
