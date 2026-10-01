"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode, type CSSProperties } from "react";
import {
  FEATURED_COLLECTIONS,
  getQuestionsByCollection,
  QUESTIONS_DATABASE,
} from "../data/questions";
import { Arrow, ArtCrop, ChoiceFrame, HeroReferenceDetails } from "./home-art";
import { rankLeaderboard, type LeaderboardResult } from "../domain/leaderboard";
import { useHydrated } from "./use-hydrated";
import { ThemeToggle } from "./theme-toggle";

const categories = [
  {
    title: "Popular",
    description: "Question rankings",
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
  { title: "Explore", description: "Browse or get a random question", color: "#009eff" },
  { title: "Choose", description: "Pick the option you prefer", color: "#ff782f" },
  { title: "See Results", description: "See what other players chose", color: "#00b849" },
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
      <a href="#play" className="sr-only">
        Skip to play
      </a>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="WYRPlay Home">
          <ArtCrop box={[54, 7, 120, 43]} label="WYRPLAY" />
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
          <ThemeToggle />
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
  onPlayQuestion,
  leaderboard,
}: {
  leaderboard: LeaderboardResult;
  children: ReactNode;
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
    document.getElementById("play")?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("play")?.focus({ preventScroll: true });
  };
  return (
    <>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-art" aria-hidden="true" />
        <div className="hero-cloud-floor" aria-hidden="true" />
        <ArtCrop box={[571, 60, 120, 83]} className="hero-top-doodle" />
        <ArtCrop box={[646, 60, 132, 97]} className="hero-top-blob" />
        <ArtCrop box={[691, 157, 87, 40]} className="hero-blob-continuation" />
        <ArtCrop box={[538, 558, 26, 27]} className="hero-bottom-flower" />
        <ArtCrop box={[580, 591, 28, 24]} className="hero-bottom-star" />
        <ArtCrop box={[698, 615, 80, 17]} className="hero-bottom-corner" />
        <HeroReferenceDetails />
        <ArtCrop box={[0, 477, 194, 155]} className="hero-cloud-left" />
        <div className="hero-intro">
          <h1 id="page-title">
            <span className="sr-only">Would You Rather Questions</span>
            <ArtCrop box={[210, 43, 359, 190]} className="hero-lettering" />
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
        <div className="choice-grid" aria-label="Illustrative example: dog or cat">
          <div className="choice-card dog-card">
            <ChoiceFrame variant="dog" />
            <ArtCrop box={[163, 301, 147, 91]} className="pet-art dog-art" />
            <span>
              Always have
              <br />a dog as a pet
            </span>
          </div>
          <span className="or-badge" aria-hidden="true">
            OR
          </span>
          <div className="choice-card cat-card">
            <ChoiceFrame variant="cat" />
            <ArtCrop box={[465, 300, 129, 93]} className="pet-art cat-art" />
            <span>
              Always have
              <br />a cat as a pet
            </span>
          </div>
        </div>
        <div className="vote-summary preview-summary">
          <p>Two choices. One great conversation.</p>
        </div>
        <Link href="#play" className="choice-cta dark-button">
          Make Your Choice
          <Arrow />
        </Link>
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
        <Heading title="Popular Categories" href="#question-search" label="Explore categories" />
        <div className="category-grid">
          {categories.map((category) => {
            const collection = "key" in category ? FEATURED_COLLECTIONS[category.key] : null;
            return (
              <Link
                key={category.title}
                href={collection?.route ?? ("href" in category ? category.href : "/#questions")}
                className={`category-card ${category.color}`}
              >
                <ArtCrop box={category.crop} className="category-art" />
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
        <Heading title="Today’s Highlights" href="#questions" />
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
        <h2>How It Works</h2>
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
        <Heading title="Trending Questions" href="/leaderboards" />
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
            <span>Questions</span>
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
        <h2>Play Together, Anywhere</h2>
        <p>Perfect for friends, families, classrooms or just curious minds.</p>
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
        <h2 id="tool-demo-title">Play Would You Rather Questions Online</h2>
        <p>Pick a side, see real results, or launch Presenter Mode for your group.</p>
        {children}
      </div>
    </>
  );
}
