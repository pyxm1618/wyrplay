"use client";
import Image from "next/image";
import { DocumentBoundaryLink as Link } from "@/components/navigation/document-boundary-link";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { FEATURED_COLLECTIONS } from "../data/collections";
import type { Question } from "../types";
import { hasQuestionVisual } from "../data/question-visuals";
import { Arrow, HomeArt } from "./home-art";
import { QuestionVisual } from "./question-visual";
import { rankLeaderboard, type LeaderboardResult } from "../domain/leaderboard";
import { useHydrated } from "./use-hydrated";

const categories = [
  {
    title: "Popular",
    crop: [33, 686, 106, 87],
    color: "popular",
    href: "/leaderboards",
  },
  {
    title: "For Kids",
    description: "Clean & imaginative",
    crop: [514, 686, 115, 87],
    color: "kids",
    key: "kids",
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
    title: "Hard Questions",
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
    art: "friends",
    description: "Game nights",
    crop: [60, 1947, 29, 30],
    href: "/would-you-rather-questions-for-friends",
  },
  {
    title: "Parties",
    art: "parties",
    description: "Break the ice",
    crop: [193, 1947, 29, 30],
    href: "/funny-would-you-rather-questions",
  },
  {
    title: "Classrooms",
    art: "classrooms",
    description: "Group discussions",
    crop: [327, 1947, 29, 30],
    href: "/would-you-rather-questions-for-kids",
  },
  {
    title: "Road trips",
    art: "road-trips",
    description: "Longer journeys",
    crop: [481, 1947, 29, 30],
    href: "/find-questions",
  },
  {
    title: "Dates",
    art: "dates",
    description: "Better conversations",
    crop: [622, 1947, 29, 30],
    href: "/would-you-rather-questions-for-couples",
  },
] as const;

const communityNotes = [
  {
    text: "I never expected this to be so close!",
    asset: "community/avatar-1",
    width: 25,
    height: 25,
  },
  {
    text: "I can’t believe 68% chose this option!",
    asset: "community/avatar-2",
    width: 25,
    height: 26,
  },
  {
    text: "This question sparked an amazing discussion! ❤️",
    asset: "community/avatar-3",
    width: 25,
    height: 25,
  },
  {
    text: "Totally changed my perspectives.",
    asset: "community/avatar-4",
    width: 26,
    height: 26,
  },
] as const;

// Container gutters, grid gaps and column weights mirror illustrated-home.css.
function categoryImageSizes(artWidth: number) {
  const columnRatio = 692 / artWidth;
  return `(min-width: 1441px) ${1520 / columnRatio}px, (max-width: 520px) calc((100vw - clamp(32px, 7vw, 80px) - 8px) / 2), (max-width: 1000px) calc((100vw - clamp(32px, 7vw, 80px) - 24px) / 3), (max-width: 1240px) calc((100vw - clamp(32px, 7vw, 80px) - clamp(25px, 3.2134vw, 40px)) / ${columnRatio}), ${1120 / columnRatio}px`;
}

const highlightImageSizes =
  "(min-width: 1441px) 512px, (max-width: 900px) calc(100vw - clamp(32px, 7vw, 80px) - 2px), (max-width: 1240px) calc((100vw - clamp(32px, 7vw, 80px) - clamp(28px, 3.599vw, 44.8px)) / 2.9646 - 2px), 375px";

export function IllustratedHomeHeader({ authEnabled = false }: { authEnabled?: boolean }) {
  const hydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { label: "Home", href: "/" },
    { label: "Questions", href: "/find-questions" },
    { label: "Categories", href: "/#categories" },
    { label: "Leaderboard", href: "/leaderboards" },
    { label: "Create", href: "/#trending" },
  ];
  return (
    <>
      <a href="#play" className="home-skip-link sr-only">
        Skip to play
      </a>
      <header data-site-header className="site-header">
        <Link href="/" className="brand active" aria-label="WYRPlay Home" prefetch={false}>
          <Image
            src="/finder/assets/logo.png"
            alt="WYRPLAY"
            width={120}
            height={43}
            sizes="120px"
            priority
            className="home-wordmark"
          />
        </Link>
        <nav aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={link.label === "Home" ? "active" : undefined}
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <fieldset disabled={!hydrated} className="header-actions">
          <Link
            href="/find-questions"
            className="search-button"
            aria-label="Search questions"
            prefetch={false}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.3" stroke="currentColor" strokeWidth="2" />
              <path
                d="m15.2 15.2 4.5 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          {authEnabled ? (
            <>
              <Link className="login-button home-login" href="/sign-in" prefetch={false}>
                Log in
              </Link>
              <Link className="signup-button home-login" href="/sign-up" prefetch={false}>
                Sign up
              </Link>
            </>
          ) : (
            <Link className="signup-button home-login" href="/#play" prefetch={false}>
              Play now
            </Link>
          )}
          <button
            type="button"
            className="home-menu"
            aria-label={menuOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </fieldset>
      </header>
      {menuOpen ? (
        <nav className="home-mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              prefetch={false}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
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
          <Link className="section-link" href={href} prefetch={false}>
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
  trendingSlot,
  questions,
  approvedQuestionCount,
  browseHref = "/find-questions",
}: {
  leaderboard?: LeaderboardResult;
  children: ReactNode;
  arena: ReactNode;
  onPlayQuestion: (id: string, question?: Question) => void;
  questions: readonly Question[];
  approvedQuestionCount: number;
  browseHref?: string;
  trendingSlot?: ReactNode;
}) {
  const highlights = questions.slice(0, 3);
  const rankings =
    leaderboard && leaderboard.status === "ready"
      ? rankLeaderboard(leaderboard.snapshot.entries, "all").slice(0, 3)
      : [];
  const play = (id: string, question?: Question) => {
    onPlayQuestion(id, question);
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

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ id: string; question?: Question }>;
      if (custom.detail?.id) {
        play(custom.detail.id, custom.detail.question);
      }
    };
    window.addEventListener("wyr:play-question", handler);
    return () => window.removeEventListener("wyr:play-question", handler);
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCreateClick = () => {
    setToastMessage("Coming soon — question creation is on the way.");
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);
  return (
    <>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-stage-backdrop" aria-hidden="true">
          <Image
            src="/home-art/hero/hero-cloud-left.webp"
            alt=""
            width={785}
            height={637}
            sizes="(max-width: 600px) 0px, (max-width: 1000px) 250px, 320px"
            className="hero-cloud-left"
          />
          <Image
            src="/home-art/hero/hero-cloud-right.webp"
            alt=""
            width={786}
            height={637}
            sizes="(max-width: 600px) 0px, (max-width: 1000px) 320px, 390px"
            className="hero-cloud-right"
          />
          <Image
            src="/home-art/hero/hero-cloud-topleft.webp"
            alt=""
            width={310}
            height={225}
            sizes="(max-width: 600px) 0px, (max-width: 1000px) 90px, 140px"
            className="hero-cloud-topleft"
          />
          <Image
            src="/home-art/hero/hero-cloud-topright.webp"
            alt=""
            width={350}
            height={255}
            sizes="(max-width: 600px) 0px, (max-width: 1000px) 120px, 190px"
            className="hero-cloud-topright"
          />
          <Image
            src="/home-art/hero/hero-doodles-left.webp"
            alt=""
            width={270}
            height={260}
            sizes="(max-width: 600px) 0px, (max-width: 1000px) 90px, 140px"
            className="hero-doodles-left"
          />
          <Image
            src="/home-art/hero/hero-doodles-right.webp"
            alt=""
            width={340}
            height={500}
            sizes="(max-width: 600px) 0px, (max-width: 1000px) 100px, 150px"
            className="hero-doodles-right"
          />
          <Image
            src="/home-art/hero/hero-boy.webp"
            alt=""
            width={790}
            height={793}
            sizes="(max-width: 600px) clamp(100px, 26vw, 130px), (max-width: 1240px) 35.48vw, 442px"
            priority
            fetchPriority="high"
            className="hero-boy"
          />
          <Image
            src="/home-art/hero/hero-girl.webp"
            alt=""
            width={1179}
            height={688}
            sizes="(max-width: 600px) 120px, (max-width: 1000px) 290px, 360px"
            className="hero-girl"
          />
        </div>
        <div className="hero-intro">
          <div className="hero-title-wrapper">
            <Image
              src="/home-art/hero/hero-crown.webp"
              alt=""
              aria-hidden="true"
              width={257}
              height={199}
              sizes="(max-width: 600px) 46px, (max-width: 1000px) 55px, 75px"
              className="hero-crown"
            />
            <h1 id="page-title">
              <span className="sr-only">Would You Rather Questions</span>
              <Image
                src="/home-art/hero/hero-title.webp"
                alt=""
                aria-hidden="true"
                width={1662}
                height={887}
                sizes="(max-width: 600px) min(290px, 76vw), (min-width: 1024px) and (max-height: 1100px) min(400px, 24vh), (max-width: 1240px) 42.42vw, 528px"
                quality={70}
                priority
                fetchPriority="high"
                className="hero-title-img"
              />
            </h1>
          </div>
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
            <div className="avatar-stack" aria-hidden="true">
              <HomeArt
                src="hero/hero-avatar-strip"
                width={113}
                height={30}
                sizes="(max-width: 600px) 96px, (max-width: 1244.8px) 14.524422vw, 180.8px"
                loading="eager"
                className="hero-avatar-strip"
              />
            </div>
            <p>
              <strong>{approvedQuestionCount} curated questions</strong>
              <br />
              Ready for your next game night
            </p>
          </div>
          <p className="hero-note">
            Community votes
            <br />
            Community results
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
        <div className="home-container">
          <Heading title="Popular Categories" href="#question-search" label="Explore categories" />
          <div className="category-grid">
            {categories.map((category) => {
              const collection = "key" in category ? FEATURED_COLLECTIONS[category.key] : null;
              const targetHref =
                collection?.route ?? ("href" in category ? category.href : "/find-questions");
              const isKids = targetHref === "/would-you-rather-questions-for-kids";
              const content = (
                <>
                  {category.color === "popular" ||
                  category.color === "hard" ||
                  category.color === "kids" ? (
                    <Image
                      src={`/home-art/categories/${category.color}-no-subtitle.webp`}
                      alt=""
                      width={1061}
                      height={1330}
                      className="category-art-card"
                      sizes={categoryImageSizes(category.crop[2])}
                    />
                  ) : (
                    <Image
                      src={`/home-art/categories/${category.color}.webp`}
                      alt=""
                      width={category.crop[2]}
                      height={category.crop[3]}
                      sizes={categoryImageSizes(category.crop[2])}
                      className="art-crop category-art"
                    />
                  )}
                  <span className="category-title">{category.title}</span>
                </>
              );
              if (isKids) {
                return (
                  <a
                    key={category.title}
                    href={targetHref}
                    className={`category-card ${category.color}`}
                  >
                    {content}
                  </a>
                );
              }
              return (
                <Link
                  key={category.title}
                  href={targetHref}
                  className={`category-card ${category.color}`}
                  prefetch={false}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section
        className="highlights-section section-shell dark-section"
        aria-label="Today's highlights"
      >
        <div className="home-container">
          <Heading title="Today’s Highlights" href="/find-questions" />
          <div className="highlight-grid">
            {highlights.map((question, index) => (
              <button
                type="button"
                key={question.id}
                className="highlight-card"
                onClick={() => play(question.id)}
              >
                {hasQuestionVisual(question.id) ? (
                  <QuestionVisual
                    questionId={question.id}
                    mode="full"
                    sizes={highlightImageSizes}
                    className="highlight-image"
                  />
                ) : (
                  <Image
                    src={`/home-art/highlights/scene-${index + 1}.webp`}
                    width={724}
                    height={560}
                    sizes={highlightImageSizes}
                    quality={60}
                    className="highlight-image"
                    alt=""
                  />
                )}
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
        </div>
      </section>
      <section id="how-it-works" className="how-section section-shell" aria-label="How it works">
        <div className="home-container how-container">
          <div className="steps-decoration" aria-hidden="true">
            <HomeArt
              src="decorations/step-ribbon-yellow"
              width={97}
              height={50}
              sizes="(max-width: 600px) 97px, (max-width: 1244.8px) 12.467866vw, 155.2px"
              className="step-ribbon-yellow"
            />
            <HomeArt
              src="decorations/step-bubble"
              width={36}
              height={48}
              sizes="(max-width: 600px) 36px, (max-width: 1244.8px) 4.627249vw, 57.6px"
              className="step-bubble"
            />
            <Image
              src="/home-art/decorations/step-ribbon-blue.webp"
              alt=""
              width={188}
              height={134}
              sizes="(max-width: 600px) 188px, (max-width: 1244.8px) 24.164524vw, 300.8px"
              className="art-crop step-ribbon-blue"
            />
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
        </div>
      </section>
      <section
        id="trending"
        className="trending-section section-shell"
        aria-label="Question rankings"
      >
        <div className="home-container">
          <Heading title="Trending Questions" href="/leaderboards" />
          <div className="trending-grid">
            <div className="trending-list">
              {trendingSlot ??
                (leaderboard && leaderboard.status === "ready" && rankings.length > 0 ? (
                  rankings.map((entry) => (
                    <button
                      type="button"
                      key={entry.question.id}
                      className="trending-card"
                      onClick={() => play(entry.question.id, entry.question)}
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
                    <HomeArt
                      src="decorations/ranking-crown"
                      width={106}
                      height={87}
                      sizes="95px"
                      className="ranking-crown"
                    />
                    <h3>Question Rankings</h3>
                    <p>
                      {leaderboard && leaderboard.status === "ready"
                        ? "No votes yet. Make your choice to start the rankings."
                        : "Rankings are temporarily unavailable. Try the leaderboard again."}
                    </p>
                    <Link className="section-link" href="/leaderboards" prefetch={false}>
                      View leaderboard
                      <Arrow />
                    </Link>
                  </div>
                ))}
            </div>
            <div className="create-panel">
              <div className="create-copy">
                <h3>Create Your Own Question</h3>
                <p>
                  Got a wild idea?
                  <br />
                  Share it with the world!
                </p>
                <button
                  type="button"
                  className="dark-button create-button"
                  onClick={handleCreateClick}
                >
                  <span aria-hidden="true">＋</span>Coming soon
                </button>
              </div>
              <Image
                src="/home-art/bulb-hand.png"
                width={1122}
                height={1402}
                alt=""
                className="bulb-art"
                sizes="(max-width: 600px) 160px, (max-width: 1244.8px) 20.5656vw, 256px"
              />
              <span className="create-doodle doodle-one" aria-hidden="true">
                ✚
              </span>
              <span className="create-doodle doodle-two" aria-hidden="true">
                ♡
              </span>
            </div>
          </div>
        </div>
      </section>
      <section
        id="statistics"
        className="statistics home-real-statistics"
        aria-label="Question library"
      >
        <div className="home-container statistics-container">
          <div className="statistic">
            <HomeArt
              src="icons/question-statistic"
              width={48}
              height={47}
              sizes="(max-width: 600px) 48px, (max-width: 1244.8px) 6.169666vw, 76.8px"
            />
            <p>
              <strong>{approvedQuestionCount}</strong>
              <span>Would You Rather Questions</span>
            </p>
          </div>
          <div className="statistic">
            <HomeArt
              src="icons/collection-statistic"
              width={48}
              height={47}
              sizes="(max-width: 600px) 48px, (max-width: 1244.8px) 6.169666vw, 76.8px"
            />
            <p>
              <strong>{Object.keys(FEATURED_COLLECTIONS).length}</strong>
              <span>Collections</span>
            </p>
          </div>
          <div className="statistic">
            <HomeArt
              src="icons/question-statistic"
              width={48}
              height={47}
              sizes="(max-width: 600px) 48px, (max-width: 1244.8px) 6.169666vw, 76.8px"
            />
            <p>
              <strong>3</strong>
              <span>Ways to Play</span>
            </p>
          </div>
          <div className="statistic">
            <HomeArt
              src="icons/collection-statistic"
              width={48}
              height={47}
              sizes="(max-width: 600px) 48px, (max-width: 1244.8px) 6.169666vw, 76.8px"
            />
            <p>
              <strong>A/B</strong>
              <span>Choice Format</span>
            </p>
          </div>
        </div>
      </section>
      <section
        id="community"
        className="community-section dark-section"
        aria-label="Community choices"
      >
        <HomeArt
          src="community/top-wave"
          width={778}
          height={24}
          sizes="(max-width: 1244.8px) 100vw, 1244.8px"
          className="community-top-wave"
        />
        <div className="community-reference-details" aria-hidden="true">
          <HomeArt
            src="community/decor-left"
            width={245}
            height={88}
            sizes="(max-width: 600px) 0px, (max-width: 1244.8px) 31.491003vw, 392px"
            className="community-decoration-left"
          />
          <HomeArt
            src="community/decor-right"
            width={253}
            height={88}
            sizes="(max-width: 600px) 0px, (max-width: 1244.8px) 32.519280vw, 404.8px"
            className="community-decoration-right"
          />
        </div>
        <h2>See What Others Think</h2>
        <p className="community-subtitle">Real votes from real people around the world.</p>
        <div className="quote-grid">
          {communityNotes.map((note) => (
            <blockquote key={note.text}>
              <HomeArt
                src={note.asset}
                width={note.width}
                height={note.height}
                sizes="(max-width: 600px) 25px, (max-width: 1244.8px) 3.213368vw, 40px"
                className="community-avatar"
              />
              <p>{note.text}</p>
            </blockquote>
          ))}
        </div>
        <HomeArt
          src="community/planet"
          width={778}
          height={112}
          sizes="(max-width: 600px) 160vw, (max-width: 1244.8px) 100vw, 1244.8px"
          className="planet-art"
        />
      </section>
      <section id="play-together" className="together-section" aria-label="Play together anywhere">
        <HomeArt
          src="decorations/together-edge-left"
          width={62}
          height={155}
          sizes="(max-width: 600px) 62px, (max-width: 1244.8px) 7.969152vw, 99.2px"
          className="together-edge edge-left"
        />
        <HomeArt
          src="decorations/together-edge-right"
          width={30}
          height={155}
          sizes="(max-width: 600px) 30px, (max-width: 1244.8px) 3.856041vw, 48px"
          className="together-edge edge-right"
        />
        <HomeArt
          src="decorations/together-flourish-left"
          width={85}
          height={39}
          sizes="(max-width: 600px) 85px, (max-width: 1244.8px) 10.925450vw, 136px"
          className="together-flourish flourish-left"
        />
        <HomeArt
          src="decorations/together-flourish-right"
          width={91}
          height={45}
          sizes="(max-width: 600px) 91px, (max-width: 1244.8px) 11.696658vw, 145.6px"
          className="together-flourish flourish-right"
        />
        <div className="home-container together-container">
          <h2>Play Together, Anywhere</h2>
          <p>Perfect for friends, families, classrooms or just curious minds.</p>
          <div className="occasion-grid">
            {occasions.map((occasion) => {
              const isKids = occasion.href.startsWith("/would-you-rather-questions-for-kids");
              const content = (
                <>
                  <HomeArt
                    src={`icons/occasion-${occasion.art}`}
                    width={occasion.crop[2]}
                    height={occasion.crop[3]}
                    sizes="(max-width: 600px) 29px, (max-width: 1244.8px) 3.727506vw, 46.4px"
                  />
                  <span>
                    <strong>{occasion.title}</strong>
                    <span>{occasion.description}</span>
                  </span>
                </>
              );
              if (isKids) {
                return (
                  <a key={occasion.title} href={occasion.href} className="occasion-card">
                    {content}
                  </a>
                );
              }
              return (
                <Link
                  key={occasion.title}
                  href={occasion.href}
                  className="occasion-card"
                  prefetch={false}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <div className="home-live-experience">
        <div className="home-container">
          <h2 id="tool-demo-title">Find More Would You Rather Questions</h2>
          <p>Search by keyword and filter by audience, occasion, tone or difficulty.</p>
          {children}
          <Link className="section-link" href={browseHref} prefetch={false}>
            Browse all questions
            <Arrow />
          </Link>
        </div>
      </div>
      <HomeFaq />
      <div
        role="status"
        aria-live="polite"
        className={`create-toast ${toastMessage ? "visible" : ""}`}
      >
        {toastMessage}
      </div>
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
      <div className="home-container">
        <p className="faq-eyebrow">A little help before your next debate</p>
        <h2 id="home-faq-title">Would You Rather Questions: FAQ</h2>
        {answers.map(({ question, answer }) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
