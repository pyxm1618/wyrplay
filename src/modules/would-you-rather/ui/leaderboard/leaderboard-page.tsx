"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  leaderboardPage,
  rankLeaderboard,
  searchLeaderboard,
  type LeaderboardPeriod,
  type LeaderboardResult,
  type RankedQuestion,
} from "../../domain/leaderboard";
import { DuelArena } from "../duel-arena";
import { LeaderboardArt as Art, ChoiceArt } from "./art";
import { Icon, type IconName } from "./icons";
import "./leaderboard.css";

const periods = [
  { key: "all", label: "All Time" },
  { key: "month", label: "This Month" },
  { key: "week", label: "This Week" },
] as const;
const categories = [
  { label: "Most Popular", subtitle: "Most votes overall", icon: "crown", available: true },
  { label: "Trending", subtitle: "Not available yet", icon: "flame", available: false },
  { label: "Most Discussed", subtitle: "Not available yet", icon: "chat", available: false },
  { label: "Editor's Picks", subtitle: "Not available yet", icon: "star", available: false },
  { label: "All Time", subtitle: "Top of all time", icon: "trophy", available: true },
] as const;
const unavailable = "This feature is not available yet.";
const formatCount = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
const cardTitle = (question: RankedQuestion["question"]) => {
  const title = question.question.replace(/^would you rather\s+/i, "");
  return title.charAt(0).toUpperCase() + title.slice(1);
};
function Tags({ entry }: { entry: RankedQuestion }) {
  const tags = [...entry.question.topics, ...entry.question.tones].slice(0, 2);
  return (
    <div className="tags">
      {tags.map((tag, index) => (
        <span className={`tag ${index === 0 ? "gold" : "purple"}`} key={`${tag}-${index}`}>
          {tag.replaceAll("-", " ")}
        </span>
      ))}
    </div>
  );
}
function VoteCount({
  entry,
  onOpen,
  className = "vote-count",
}: {
  entry: RankedQuestion;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      className={className}
      onClick={onOpen}
      aria-label={`Vote on question ${entry.question.id}`}
      title={`${entry.votes.toLocaleString("en")} votes in this period`}
    >
      <Icon name="heart" />
      {formatCount(entry.votes)}
    </button>
  );
}

function randomAlternative(entries: readonly RankedQuestion[], currentId: string | null) {
  const alternatives = entries.filter((entry) => entry.question.id !== currentId);
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

export function LeaderboardPage({
  result,
  authEnabled,
}: {
  result: LeaderboardResult;
  authEnabled: boolean;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [category, setCategory] = useState("Most Popular");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const voteDialog = useRef<HTMLDialogElement>(null);
  const snapshot = result.status === "ready" ? result.snapshot : null;
  const ranked = snapshot ? rankLeaderboard(snapshot.entries, period) : [];
  const view = leaderboardPage(ranked, page);
  const selected = snapshot?.entries.find((entry) => entry.question.id === selectedId);
  const selectedIndex = ranked.findIndex((entry) => entry.question.id === selectedId);
  const podium = [ranked[1], ranked[0], ranked[2]];
  const periodLabel = periods.find((item) => item.key === period)!.label;
  const searchMatches = searchLeaderboard(ranked, query);
  const refresh = () => startRefresh(() => router.refresh());
  const choosePeriod = (value: LeaderboardPeriod) => {
    setPeriod(value);
    setPage(1);
    setCategory(value === "all" ? "Most Popular" : "");
  };
  const chooseCategory = (label: string) => {
    setCategory(label);
    setPeriod("all");
    setPage(1);
  };
  const openQuestion = (entry: RankedQuestion) => {
    searchDialog.current?.close();
    setSearchOpen(false);
    setSelectedId(entry.question.id);
    voteDialog.current?.showModal();
  };
  const closeVote = () => {
    setSelectedId(null);
    refresh();
  };
  const navigateQuestion = (random: boolean) => {
    if (ranked.length < 2) return;
    const entry = random
      ? randomAlternative(ranked, selectedId)
      : ranked[(Math.max(selectedIndex, 0) + 1) % ranked.length];
    if (entry) setSelectedId(entry.question.id);
  };
  const pageNumbers = [
    ...new Set([1, 2, 3, 4, 5, view.current - 1, view.current, view.current + 1, view.pages]),
  ]
    .filter((n) => n >= 1 && n <= view.pages)
    .sort((a, b) => a - b);

  return (
    <div className="leaderboard-page" aria-busy={refreshing}>
      <div className="page-shell">
        <header className="site-header">
          <Link href="/" aria-label="WYRPLAY home">
            <Art name="logo" className="logo" alt="WYRPLAY" width={129} height={46} />
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/#questions">Questions</Link>
            <Link href="/#categories">Categories</Link>
            <Link href="/leaderboards" aria-current="page" className="nav-active">
              Leaderboards
            </Link>
            <button disabled title="Question submissions are not available yet.">
              Create
            </button>
          </nav>
          <div className="header-actions">
            <button
              className="search-button"
              aria-label="Search ranked questions"
              onClick={() => {
                setSearchOpen(true);
                searchDialog.current?.showModal();
              }}
            >
              <Icon name="search" />
            </button>
            {authEnabled ? (
              <>
                <Link className="login" href="/sign-in">
                  Log in
                </Link>
                <Link className="dark-button signup" href="/sign-up">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <button className="login" disabled title="Account access is not enabled.">
                  Log in
                </button>
                <button
                  className="dark-button signup"
                  disabled
                  title="Account access is not enabled."
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </header>
        <main>
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <h1 id="hero-title">
                <span className="hero-best">
                  Best <Icon name="crown" />
                </span>
                <span className="hero-wyr">
                  <span>Would You Ra</span>
                  <span>ther</span>
                </span>
                <span className="hero-questions">Questions</span>
              </h1>
              <p>
                Discover the most popular, thought-provoking and fun
                <br className="desktop-break" /> Would You Rather questions, ranked by real
                community votes.
              </p>
            </div>
            <Art
              name="hero-art"
              className="hero-art"
              alt="A player raising a golden trophy. Great questions by real people!"
              width={330}
              height={293}
            />
            <span className="spark spark-one" aria-hidden="true">
              ✦
            </span>
            <span className="spark spark-two" aria-hidden="true">
              ✦
            </span>
            <span className="hero-squiggle" aria-hidden="true">
              ∿
            </span>
          </section>
          <div className="category-tabs" id="categories" aria-label="Leaderboard categories">
            {categories.map((item) => (
              <button
                className={category === item.label ? "selected" : ""}
                key={item.label}
                disabled={!item.available}
                title={item.available ? item.subtitle : unavailable}
                aria-pressed={category === item.label}
                onClick={() => chooseCategory(item.label)}
              >
                <Icon name={item.icon} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.subtitle}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="leaderboard-layout">
            <aside className="sidebar">
              <Art name="sidebar-trophy" className="sidebar-trophy" width={57} height={51} />
              <h2>Leaderboards</h2>
              <p>
                See the best questions
                <br />
                in different ways
              </p>
              <nav aria-label="Leaderboard views">
                {categories.map((item) => (
                  <button
                    key={item.label}
                    className={category === item.label ? "active" : ""}
                    disabled={!item.available}
                    title={item.available ? item.subtitle : unavailable}
                    aria-pressed={category === item.label}
                    onClick={() => chooseCategory(item.label)}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                  </button>
                ))}
                {periods.slice(1).map((item) => (
                  <button
                    key={item.key}
                    className={period === item.key ? "active" : ""}
                    aria-pressed={period === item.key}
                    onClick={() => choosePeriod(item.key)}
                  >
                    <Icon name="calendar" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <section className="create-card">
                <h3>Create a Question</h3>
                <p>
                  Got a great idea?
                  <br />
                  Submissions open later.
                </p>
                <Art name="bulb" className="bulb" width={168} height={166} />
                <button
                  className="dark-button"
                  disabled
                  title="Question submissions are not available yet."
                >
                  <span className="plus">＋</span>Create Now
                  <Icon name="arrow" />
                </button>
              </section>
            </aside>
            <div className="rankings">
              <section className="top-three-section">
                <h2>
                  Top 3 Questions <Icon name="crown" />
                </h2>
                <p className="section-intro">
                  {period === "all"
                    ? "The most popular questions of all time, chosen by the WYRPLAY community."
                    : `${periodLabel}: new votes since the UTC calendar period began.`}
                </p>
                {!snapshot && (
                  <div className="ranking-status" role="alert">
                    <strong>Rankings are unavailable</strong>
                    <p>We could not load the voting data. No rankings or totals are shown.</p>
                    <button className="dark-button" disabled={refreshing} onClick={refresh}>
                      {refreshing ? "Retrying…" : "Retry"}
                    </button>
                  </div>
                )}
                {snapshot && ranked.length === 0 && (
                  <div className="ranking-status" role="status">
                    <strong>No votes in this period yet</strong>
                    <p>Play a question to help build the leaderboard.</p>
                    <Link className="dark-button" href="/#play">
                      Start Playing <Icon name="arrow" />
                    </Link>
                  </div>
                )}
                <div className="podium">
                  {podium.map((entry, index) => (
                    <article
                      className={`question-card ${index === 1 ? "travel" : index === 0 ? "dog" : "pizza"}`}
                      key={entry?.question.id ?? `empty-${index}`}
                    >
                      <Art
                        name={`medal-${index === 1 ? 1 : index === 0 ? 2 : 3}`}
                        className="medal"
                        width={64}
                        height={70}
                      />
                      {entry ? (
                        <>
                          <button
                            className="question-open"
                            onClick={() => openQuestion(entry)}
                            aria-label={`Open question: ${entry.question.question}`}
                          >
                            <ChoiceArt className="question-art" />
                            <h3 title={entry.question.question}>{cardTitle(entry.question)}</h3>
                          </button>
                          <Tags entry={entry} />
                          <div className="card-metrics">
                            <VoteCount entry={entry} onOpen={() => openQuestion(entry)} />
                            <span
                              className="comments-unavailable"
                              title="Comments are not available yet."
                            >
                              <Icon name="chat" />—
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="empty-podium">
                          <ChoiceArt className="question-art" />
                          <p>{snapshot ? "No ranked question yet" : "Ranking unavailable"}</p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
              <section className="top-ten-section" id="top-ten">
                <div className="ranking-heading">
                  <h2>
                    {view.current === 1
                      ? "Top 10 Questions"
                      : `Questions ${(view.current - 1) * 10 + 1}–${Math.min(view.current * 10, ranked.length)}`}
                  </h2>
                  <div className="period-tabs" aria-label="Time period">
                    {periods.map((item) => (
                      <button
                        key={item.key}
                        className={period === item.key ? "active" : ""}
                        aria-pressed={period === item.key}
                        onClick={() => choosePeriod(item.key)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ranking-list">
                  {view.entries.map((entry) => (
                    <article
                      className="ranking-row"
                      key={entry.question.id}
                      data-question-id={entry.question.id}
                    >
                      <span className={`rank-number rank-${entry.rank}`}>{entry.rank}</span>
                      <button
                        className="row-art-button"
                        onClick={() => openQuestion(entry)}
                        aria-label={`Open question ${entry.question.id}`}
                      >
                        <ChoiceArt className="row-art" />
                      </button>
                      <div className="row-content">
                        <button
                          className="row-title"
                          onClick={() => openQuestion(entry)}
                          title={entry.question.question}
                        >
                          {cardTitle(entry.question)}
                        </button>
                        <Tags entry={entry} />
                      </div>
                      <VoteCount
                        entry={entry}
                        className="row-votes"
                        onOpen={() => openQuestion(entry)}
                      />
                      <span className="row-comments" title="Comments are not available yet.">
                        <Icon name="chat" />—
                      </span>
                      <button
                        className="bookmark"
                        disabled
                        aria-label={`Save question ${entry.question.id} — unavailable`}
                        title="Saved questions are not available yet."
                      >
                        <Icon name="bookmark" />
                      </button>
                    </article>
                  ))}
                  {view.entries.length === 0 && (
                    <p className="empty-ranking-list">
                      {!snapshot
                        ? "Rankings could not be loaded."
                        : ranked.length === 0
                          ? "No ranked questions in this period."
                          : "All ranked questions are displayed above."}
                    </p>
                  )}
                </div>
              </section>
              {view.pages > 0 && (
                <nav className="pagination" aria-label="Ranking pages">
                  <button disabled={view.current === 1} onClick={() => setPage(view.current - 1)}>
                    ← Previous
                  </button>
                  {pageNumbers.map((n, index) => (
                    <span className="pagination-item" key={n}>
                      {index > 0 && n - pageNumbers[index - 1]! > 1 && (
                        <span aria-hidden="true">…</span>
                      )}
                      <button
                        className={view.current === n ? "current" : ""}
                        aria-current={view.current === n ? "page" : undefined}
                        aria-label={`Page ${n}`}
                        onClick={() => setPage(n)}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                  <button
                    disabled={view.current === view.pages}
                    onClick={() => setPage(view.current + 1)}
                  >
                    Next <Icon name="arrow" />
                  </button>
                </nav>
              )}
            </div>
          </div>
          <div className="community-panels">
            <section className="stats-panel">
              <h2>
                <Icon name="bars" />
                Leaderboard Stats
              </h2>
              <div className="stats-grid">
                {[
                  { icon: "heart", value: snapshot?.totalVotes, label: "Total votes" },
                  {
                    icon: "chat",
                    value: snapshot?.entries.filter((entry) => entry.total > 0).length,
                    label: "Ranked",
                  },
                  { icon: "people", value: snapshot?.anonymousVoters, label: "Voters" },
                  { icon: "question", value: snapshot?.entries.length, label: "Questions" },
                ].map((stat) => (
                  <div
                    className={`stat stat-${stat.icon}`}
                    key={stat.label}
                    title={
                      stat.label === "Voters"
                        ? "Distinct anonymous voter identities, not verified people."
                        : undefined
                    }
                  >
                    <Icon name={stat.icon as IconName} />
                    <strong>{stat.value === undefined ? "—" : formatCount(stat.value)}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="hall-panel">
              <h2>
                <Icon name="trophy" />
                Hall of Fame
              </h2>
              <p>Selections are not available yet.</p>
              <div className="hall-grid" aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => (
                  <span className="hall-placeholder" key={index}>
                    ?
                  </span>
                ))}
              </div>
            </section>
          </div>
          <section className="footer-cta">
            <Art name="footer-trophy" width={109} height={96} />
            <div>
              <h2>Think yours can make the list?</h2>
              <p>
                Question submissions are not open yet.
                <br />
                Explore the question bank and cast your vote.
              </p>
            </div>
            <button
              className="dark-button"
              disabled
              title="Question submissions are not available yet."
            >
              Create a Question <Icon name="arrow" />
            </button>
            <span className="footer-star" aria-hidden="true">
              ★
            </span>
          </section>
          <p className="ranking-method">
            Votes count each anonymous voter once per question. Month and week use the first vote
            time, in UTC. Changing A/B does not add a vote.
          </p>
          <footer className="leaderboard-legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </footer>
        </main>
        <dialog
          ref={searchDialog}
          onClose={() => setSearchOpen(false)}
          onClick={(event) => {
            if (event.target === searchDialog.current) searchDialog.current?.close();
          }}
          aria-labelledby="search-title"
        >
          <button
            className="dialog-close"
            aria-label="Close search"
            onClick={() => searchDialog.current?.close()}
          >
            ×
          </button>
          {searchOpen && (
            <>
              <h2 id="search-title">Find a ranked question</h2>
              <label className="search-label">
                Search ranked questions
                <input
                  type="search"
                  autoFocus
                  maxLength={100}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search questions or topics…"
                />
              </label>
              <div className="search-results">
                {searchMatches.map((entry) => (
                  <button key={entry.question.id} onClick={() => openQuestion(entry)}>
                    <ChoiceArt className="search-art" />
                    <span>{entry.question.question}</span>
                    <Icon name="arrow" />
                  </button>
                ))}
                {searchMatches.length === 0 && (
                  <p>
                    {snapshot
                      ? "No matching ranked questions in this period."
                      : "Rankings are unavailable. Please retry after closing search."}
                  </p>
                )}
              </div>
            </>
          )}
        </dialog>
      </div>
      <dialog
        ref={voteDialog}
        className="leaderboard-vote-dialog"
        aria-label="Vote on a ranked question"
        onClose={closeVote}
        onClick={(event) => {
          if (event.target === voteDialog.current) voteDialog.current?.close();
        }}
      >
        <button
          className="leaderboard-vote-close"
          aria-label="Close voting"
          onClick={() => voteDialog.current?.close()}
        >
          ×
        </button>
        {selected && (
          <DuelArena
            key={selected.question.id}
            question={selected.question}
            currentIndex={Math.max(0, selectedIndex)}
            totalQuestions={ranked.length}
            categoryBadge="Leaderboard · Real votes"
            onNext={() => navigateQuestion(false)}
            onRandom={() => navigateQuestion(true)}
          />
        )}
      </dialog>
    </div>
  );
}
