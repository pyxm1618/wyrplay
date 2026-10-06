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
      <span>
        {formatCount(entry.votes)} {entry.votes === 1 ? "vote" : "votes"}
      </span>
    </button>
  );
}

function randomAlternative(entries: readonly RankedQuestion[], currentId: string | null) {
  const alternatives = entries.filter((entry) => entry.question.id !== currentId);
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

export function LeaderboardPage({ result }: { result: LeaderboardResult }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
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

  const currentPeriodVotes =
    period === "all" ? snapshot?.totalVotes : ranked.reduce((sum, entry) => sum + entry.votes, 0);
  const currentRankedCount =
    period === "all" ? snapshot?.entries.filter((entry) => entry.total > 0).length : ranked.length;

  return (
    <div className="leaderboard-page" aria-busy={refreshing}>
      <div className="page-shell">
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
              width={260}
              height={230}
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
          <div className="leaderboard-filter" id="categories">
            <span>Ranked by real votes</span>
            <div className="period-tabs" role="group" aria-label="Time period">
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
            <button
              className="dark-button"
              aria-label="Search ranked questions"
              onClick={() => {
                setSearchOpen(true);
                searchDialog.current?.showModal();
              }}
            >
              <Icon name="search" /> Search
            </button>
          </div>
          <div className="leaderboard-layout">
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
                    <Link className="dark-button" href="/play">
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
                        alt={`Rank ${index === 1 ? 1 : index === 0 ? 2 : 3}`}
                        width={72}
                        height={84}
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
              {ranked.length > 3 && (
                <section className="top-ten-section" id="top-ten">
                  <div className="ranking-heading">
                    <h2>
                      {view.current === 1
                        ? "Top 10 Questions"
                        : `Questions ${(view.current - 1) * 10 + 1}–${Math.min(view.current * 10, ranked.length)}`}
                    </h2>
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
                      </article>
                    ))}
                  </div>
                </section>
              )}
              {view.pages > 1 && (
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
                <span className="stats-period-badge">{periodLabel}</span>
              </h2>
              <div className="stats-grid">
                {[
                  {
                    icon: "heart",
                    value: currentPeriodVotes,
                    label: period === "all" ? "Total votes" : `${periodLabel} votes`,
                    title: `${periodLabel} votes cast across ranked questions`,
                  },
                  {
                    icon: "bars",
                    value: currentRankedCount,
                    label: period === "all" ? "Ranked" : `${periodLabel} ranked`,
                    title: `Questions with votes in ${periodLabel.toLowerCase()}`,
                  },
                  {
                    icon: "people",
                    value: snapshot?.anonymousVoters,
                    label: "All-time voters",
                    title: "Distinct anonymous voter identities across all time.",
                  },
                  {
                    icon: "question",
                    value: snapshot?.entries.length,
                    label: "Question pool",
                    title: "Total approved questions eligible for ranking.",
                  },
                ].map((stat) => (
                  <div className={`stat stat-${stat.icon}`} key={stat.label} title={stat.title}>
                    <Icon name={stat.icon as IconName} />
                    <strong>{stat.value === undefined ? "—" : formatCount(stat.value)}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <section className="footer-cta">
            <Art name="footer-trophy" width={109} height={96} />
            <div>
              <h2>Help choose the next favorite</h2>
              <p>
                Find your next great dilemma.
                <br />
                Explore the question bank and cast your vote.
              </p>
            </div>
            <Link className="dark-button" href="/play">
              Start Playing <Icon name="arrow" />
            </Link>
            <span className="footer-star" aria-hidden="true">
              ★
            </span>
          </section>
          <p className="ranking-method">
            Votes count each anonymous voter once per question. Month and week use the first vote
            time, in UTC. Changing A/B does not add a vote.
          </p>
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
          <div className="leaderboard-voting">
            <DuelArena
              appearance="illustrated-play"
              key={selected.question.id}
              question={selected.question}
              currentIndex={Math.max(0, selectedIndex)}
              totalQuestions={ranked.length}
              categoryBadge="Leaderboard · Real votes"
              onNext={() => navigateQuestion(false)}
              onRandom={() => navigateQuestion(true)}
            />
            <div className="vote-navigation">
              <button disabled={ranked.length < 2} onClick={() => navigateQuestion(false)}>
                Next Question →
              </button>
              <button disabled={ranked.length < 2} onClick={() => navigateQuestion(true)}>
                Random
              </button>
            </div>
            <p className="vote-help">
              Choose A or B, or use your keyboard. You can change your choice anytime.
            </p>
          </div>
        )}
      </dialog>
    </div>
  );
}
