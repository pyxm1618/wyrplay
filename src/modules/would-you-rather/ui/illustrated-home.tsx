"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode, type CSSProperties } from "react";
import {
  FEATURED_COLLECTIONS,
  getQuestionsByCollection,
  QUESTIONS_DATABASE,
} from "../data/questions";
import { Arrow, ArtCrop } from "./home-art";
import { rankLeaderboard, type LeaderboardResult } from "../domain/leaderboard";
import { useHydrated } from "./use-hydrated";

const categories = [
  {
    title: "Popular",
    description: "Most voted",
    crop: [33, 686, 106, 87],
    color: "popular",
    href: "/leaderboards",
  },
  {
    title: "Funny",
    description: "Lighten the mood",
    crop: [144, 686, 112, 87],
    color: "funny",
    key: "funny",
  },
  {
    title: "For Friends",
    description: "Perfect for groups",
    crop: [261, 686, 123, 87],
    color: "friends",
    key: "friends",
  },
  {
    title: "For Couples",
    description: "Better conversations",
    crop: [389, 686, 120, 87],
    color: "couples",
    key: "couples",
  },
  {
    title: "Classroom",
    description: "Clean & imaginative",
    crop: [514, 686, 115, 87],
    color: "classroom",
    key: "kids",
  },
  {
    title: "Hard Questions",
    description: "Challenge your mind",
    crop: [634, 686, 116, 87],
    color: "hard",
    key: "hard",
  },
] as const;
const steps = [
  { title: "Explore", description: "Find your audience, occasion and mood", color: "#009eff" },
  { title: "Choose", description: "Pick the option you prefer", color: "#ff782f" },
  { title: "See Results", description: "Real votes, never invented percentages", color: "#00b849" },
  { title: "Discuss", description: "Share and debate with friends", color: "#7645ff" },
];
const occasions = [
  {
    title: "Friends",
    description: "Game nights",
    crop: [60, 1947, 29, 30],
    href: "/would-you-rather-questions-for-friends",
  },
  {
    title: "Parties",
    description: "Break the ice",
    crop: [193, 1947, 29, 30],
    href: "/funny-would-you-rather-questions",
  },
  {
    title: "Classrooms",
    description: "Group discussions",
    crop: [327, 1947, 29, 30],
    href: "/would-you-rather-questions-for-kids",
  },
  {
    title: "Road trips",
    description: "Longer journeys",
    crop: [481, 1947, 29, 30],
    href: "/find-questions",
  },
  {
    title: "Dates",
    description: "Better conversations",
    crop: [622, 1947, 29, 30],
    href: "/would-you-rather-questions-for-couples",
  },
] as const;

export function IllustratedHomeHeader({ authEnabled = false }: { authEnabled?: boolean }) {
  const hydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { label: "Home", href: "/" },
    { label: "Find Questions", href: "/find-questions" },
    { label: "Categories", href: "/#categories" },
    { label: "Leaderboard", href: "/leaderboards" },
    { label: "Create", href: "/create" },
  ];
  return (
    <>
      <a href="#play" className="home-skip-link sr-only">
        Skip to play
      </a>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="WYRPlay Home">
          <Image src="/brand/logo.svg" alt="" width={40} height={40} priority />
          <span>WYRPLAY</span>
        </Link>
        <nav aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <fieldset disabled={!hydrated} className="header-actions">
          <Link
            href="/find-questions#search"
            className="search-button"
            aria-label="Search questions"
          >
            ⌕
          </Link>
          {authEnabled ? (
            <Link className="login-button home-login" href="/sign-in">
              Log in
            </Link>
          ) : (
            <Link className="signup-button home-login" href="/#play">
              Play now
            </Link>
          )}
          <button
            type="button"
            className="home-menu"
            aria-label={menuOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </fieldset>
      </header>
      {menuOpen && (
        <nav className="home-mobile-nav" aria-label="Mobile navigation">
          {[
            ...links,
            { label: "Kids Questions", href: "/would-you-rather-questions-for-kids" },
          ].map((link) => (
            <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
function Heading({
  title,
  href,
  label = "See all",
}: {
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {href &&
        (href.startsWith("#") ? (
          <a className="section-link" href={href}>
            {label}
            <Arrow />
          </a>
        ) : (
          <Link className="section-link" href={href}>
            {label}
            <Arrow />
          </Link>
        ))}
    </div>
  );
}
export function IllustratedHome({
  children,
  arena,
  onPlayQuestion,
  leaderboard,
}: {
  leaderboard: LeaderboardResult;
  children: ReactNode;
  arena: ReactNode;
  onPlayQuestion: (id: string) => void;
}) {
  const approved = QUESTIONS_DATABASE.filter((question) => question.reviewStatus === "approved");
  const highlights = approved.slice(0, 3);
  const rankings =
    leaderboard.status === "ready"
      ? rankLeaderboard(leaderboard.snapshot.entries, "all").slice(0, 3)
      : [];
  const play = (id: string) => {
    onPlayQuestion(id);
    const focusArena = () => {
      const arenaEl = document.getElementById("play");
      if (arenaEl) {
        arenaEl.scrollIntoView({ behavior: "smooth", block: "start" });
        arenaEl.focus({ preventScroll: true });
      }
    };
    focusArena();
    requestAnimationFrame(focusArena);
  };
  return (
    <>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-art" aria-hidden="true" />
        <div className="hero-intro">
          <h1 id="page-title">
            <span className="sr-only">Would You Rather Questions</span>
            <span className="hero-lettering" aria-hidden="true">
              <span className="lettering-would">Would</span>
              <span className="lettering-you">You</span>
              <span className="lettering-rather">Rather</span>
            </span>
          </h1>
          <h2>Same question. Different minds.</h2>
          <p>
            Play fun and thought-provoking would you rather questions with people around the world.
          </p>
        </div>
        <p className="speech-bubble" aria-hidden="true">
          What would
          <br />
          you pick?
        </p>
        {arena}
        <div className="hero-bottom">
          <div className="join-players">
            <p>
              <strong>{approved.length} curated questions</strong>
              <br />
              Ready for your next game night
            </p>
          </div>
          <p className="hero-note">
            Real people
            <br />
            Real answers
            <br />
            Surprisingly fun!
          </p>
        </div>
      </section>
      <section
        id="categories"
        className="categories-section section-shell"
        aria-label="Popular categories"
      >
        <Heading
          title="Popular Would You Rather Questions"
          href="#question-search"
          label="Explore categories"
        />
        <div className="category-grid">
          {categories.map((category) => {
            const collection = "key" in category ? FEATURED_COLLECTIONS[category.key] : null;
            return (
              <Link
                key={category.title}
                href={collection?.route ?? ("href" in category ? category.href : "/#questions")}
                className={`category-card ${category.color}`}
              >
                {category.title === "Popular" ? (
                  <Image
                    src="/home-art/categories/popular.webp"
                    alt=""
                    width={1061}
                    height={1330}
                    className="category-art-popular"
                  />
                ) : (
                  <ArtCrop box={category.crop} className="category-art" />
                )}
                <span className="category-title">{category.title}</span>
                <span className="category-description">
                  {"key" in category
                    ? `${getQuestionsByCollection(category.key).length} questions`
                    : category.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <section
        className="highlights-section section-shell dark-section"
        aria-label="Today's highlights"
      >
        <Heading title="Today’s Would You Rather Questions" href="#questions" />
        <div className="highlight-grid">
          {highlights.map((question, index) => (
            <button
              type="button"
              key={question.id}
              className="highlight-card"
              onClick={() => play(question.id)}
            >
              <svg
                className="highlight-image"
                viewBox={`${index * 724} 70 724 560`}
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                focusable="false"
              >
                <image href="/home-art/highlights.png" width="2172" height="724" />
              </svg>
              <span className="highlight-body">
                <span className="highlight-title">{question.question}</span>
                <span className="highlight-footer">
                  <span>Editorial pick</span>
                  <span className="round-arrow">
                    <Arrow />
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="how-section section-shell" aria-label="How it works">
        <div className="steps-decoration" aria-hidden="true">
          <ArtCrop box={[320, 1095, 97, 50]} className="step-ribbon-yellow" />
          <ArtCrop box={[530, 1102, 36, 48]} className="step-bubble" />
          <ArtCrop box={[590, 1096, 188, 134]} className="step-ribbon-blue" />
        </div>
        <h2>How to Play Would You Rather Questions</h2>
        <ol className="steps-grid">
          {steps.map((step, index) => (
            <li key={step.title} style={{ "--step-color": step.color } as CSSProperties}>
              <span className="step-number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section
        id="trending"
        className="trending-section section-shell"
        aria-label="Question rankings"
      >
        <Heading title="Trending Would You Rather Questions" href="/leaderboards" />
        <div className="trending-grid">
          <div className="trending-list">
            {leaderboard.status === "ready" && rankings.length > 0 ? (
              rankings.map((entry) => (
                <button
                  type="button"
                  key={entry.question.id}
                  className="trending-card"
                  onClick={() => play(entry.question.id)}
                >
                  <span className="ranking-number">#{entry.rank}</span>
                  <span className="trending-body">
                    <span className="trending-title">{entry.question.question}</span>
                    <span className="trending-meta">{entry.votes.toLocaleString()} votes</span>
                  </span>
                  <span className="round-arrow">
                    <Arrow />
                  </span>
                </button>
              ))
            ) : (
              <div className="ranking-awaiting">
                <ArtCrop box={[33, 686, 106, 87]} className="ranking-crown" />
                <h3>Question Rankings</h3>
                <p>
                  {leaderboard.status === "ready"
                    ? "No votes yet. Make your choice to start the rankings."
                    : "Rankings are temporarily unavailable. Try the leaderboard again."}
                </p>
                <Link className="section-link" href="/leaderboards">
                  View leaderboard
                  <Arrow />
                </Link>
              </div>
            )}
          </div>
          <div className="create-panel">
            <div className="create-copy">
              <h3>Create Your Own Question</h3>
              <p>
                Got a wild idea?
                <br />
                Share it with the world!
              </p>
              <Link className="dark-button create-button" href="/create">
                <span aria-hidden="true">＋</span>Create
              </Link>
            </div>
            <Image
              src="/home-art/bulb-hand.png"
              width={1122}
              height={1402}
              alt=""
              className="bulb-art"
            />
            <span className="create-doodle doodle-one" aria-hidden="true">
              ✚
            </span>
            <span className="create-doodle doodle-two" aria-hidden="true">
              ♡
            </span>
          </div>
        </div>
      </section>
      <section className="statistics home-real-statistics" aria-label="Question library">
        <div className="statistic">
          <ArtCrop box={[241, 1530, 48, 47]} />
          <p>
            <strong>{approved.length}</strong>
            <span>Would You Rather Questions</span>
          </p>
        </div>
        <div className="statistic">
          <ArtCrop box={[410, 1530, 48, 47]} />
          <p>
            <strong>{Object.keys(FEATURED_COLLECTIONS).length}</strong>
            <span>Collections</span>
          </p>
        </div>
      </section>
      <section className="together-section" aria-label="Play together anywhere">
        <ArtCrop box={[0, 1866, 62, 155]} className="together-edge edge-left" />
        <ArtCrop box={[748, 1866, 30, 155]} className="together-edge edge-right" />
        <ArtCrop box={[75, 1883, 85, 39]} className="together-flourish flourish-left" />
        <ArtCrop box={[568, 1875, 91, 45]} className="together-flourish flourish-right" />
        <h2>Play Together with Would You Rather Questions</h2>
        <p>
          Bring a few would you rather questions to game night, or use Presenter Mode on a shared
          screen.
        </p>
        <div className="occasion-grid">
          {occasions.map((occasion) => (
            <Link key={occasion.title} href={occasion.href} className="occasion-card">
              <ArtCrop box={occasion.crop} />
              <span>
                <strong>{occasion.title}</strong>
                <span>{occasion.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <div className="home-live-experience">
        <h2 id="tool-demo-title">Find More Would You Rather Questions</h2>
        <p>Search by keyword and filter by audience, occasion, tone or difficulty.</p>
        {children}
      </div>
      <HomeFaq />
    </>
  );
}

function HomeFaq() {
  const answers = [
    {
      question: "What makes a great Would You Rather question?",
      answer:
        "Two choices that both deserve a second thought. Pick one, explain why, and invite your friends to defend the other side. There are no right answers.",
    },
    {
      question: "How do you play a round of would you rather questions?",
      answer:
        "Choose A or B to record your vote and see the real community results. Choose the other option to change your vote. If voting is unavailable, we say so instead of inventing numbers.",
    },
    {
      question: "Are these would you rather questions good for groups?",
      answer:
        "Start with the Classroom collection and check each question’s age rating and suitability for your group. Open Presenter Mode beside the live question for a shared display, use Previous or Next to move through questions, and Escape to exit.",
    },
    {
      question: "Where can I find would you rather questions for kids, friends, or couples?",
      answer:
        "Use the category cards and filters to open the collection that fits your group, then choose any reviewed dilemma to play in the live arena.",
    },
  ];
  return (
    <section className="home-faq section-shell" aria-labelledby="home-faq-title">
      <p className="faq-eyebrow">A little help before your next debate</p>
      <h2 id="home-faq-title">Would You Rather Questions: FAQ</h2>
      {answers.map(({ question, answer }) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  );
}
