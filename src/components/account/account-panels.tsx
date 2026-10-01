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
          <p>Your favorites, saved on this browser.</p>
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
    <div className="my-question-layout">
      <section className="account-panel my-question-main">
        <div className="library-heading">
          <AccountIcon name="edit" />
          <div>
            <h2>My Questions</h2>
            <p>Questions you&apos;ve created or submitted.</p>
          </div>
          <button className="account-blue-button" disabled>
            ＋ Create a New Question
          </button>
        </div>
        <div className="my-question-filters">
          {["All", "Published", "Pending", "Draft", "Rejected"].map((s, i) => (
            <button key={s} disabled={i !== 0} className={i === 0 ? "active" : ""}>
              {s}
            </button>
          ))}
          <input aria-label="Search your questions" placeholder="Search your questions…" disabled />
          <select disabled aria-label="Sort your questions">
            <option>Newest First</option>
          </select>
          <select disabled aria-label="Your question categories">
            <option>All Categories</option>
          </select>
        </div>
        <div className="account-empty">
          <AccountIcon name="game" />
          <h3>A place for your curious questions</h3>
          <p>
            Creating and submitting questions is not available yet. Published, pending and draft
            records will appear when submissions are supported.
          </p>
          <Link href="/find-questions">Explore questions →</Link>
        </div>
      </section>
      <aside className="my-question-sidebar">
        <section className="account-panel">
          <h2>🏆 Your Stats</h2>
          {["Total Questions", "Published", "Pending Review", "Drafts", "Rejected"].map((label) => (
            <div className="creator-stat" key={label}>
              <strong>—</strong>
              <span>{label}</span>
            </div>
          ))}
          <p className="unavailable-note">Submission statistics are not available yet.</p>
        </section>
        <section className="account-panel">
          <h2>🔥 Top Performing</h2>
          <div className="account-empty">
            <p>No account question performance data is available.</p>
          </div>
        </section>
        <section className="account-panel creator-tips">
          <h2>💡 Tips for Creators</h2>
          <p>✓ Keep your questions balanced and fair.</p>
          <p>✓ Be creative and positive.</p>
          <p>✓ Avoid harmful topics.</p>
          <Link href="/acceptable-use">View Guidelines →</Link>
        </section>
      </aside>
    </div>
  );
}
