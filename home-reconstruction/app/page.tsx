"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";

type Crop = readonly [number, number, number, number];
type Question = {
  title: string;
  options: readonly [string, string];
  votes: string;
  split: readonly [number, number];
  image: Crop;
};

const categories = [
  { title: "Popular", description: "Most voted", crop: [33, 686, 106, 87], color: "popular" },
  { title: "Funny", description: "Lighten the mood", crop: [144, 686, 112, 87], color: "funny" },
  {
    title: "For Friends",
    description: "Perfect for groups",
    crop: [261, 686, 123, 87],
    color: "friends",
  },
  {
    title: "For Couples",
    description: "Better conversations",
    crop: [389, 686, 120, 87],
    color: "couples",
  },
  {
    title: "Classroom",
    description: "Great for discussion",
    crop: [514, 686, 115, 87],
    color: "classroom",
  },
  {
    title: "Hard Questions",
    description: "Challenge your mind",
    crop: [634, 686, 116, 87],
    color: "hard",
  },
] satisfies { title: string; description: string; crop: Crop; color: string }[];

const highlights: Question[] = [
  {
    title: "Live in a big city\nor a small town?",
    options: ["Live in a big city", "Live in a small town"],
    votes: "125K",
    split: [54, 46],
    image: [41, 905, 219, 73],
  },
  {
    title: "Be rich but unknown\nor famous but not rich?",
    options: ["Be rich but unknown", "Be famous but not rich"],
    votes: "96K",
    split: [61, 39],
    image: [274, 905, 226, 73],
  },
  {
    title: "Travel the world forever\nor never leave home?",
    options: ["Travel the world forever", "Never leave home"],
    votes: "84K",
    split: [48, 52],
    image: [514, 905, 225, 73],
  },
];

const trending: Question[] = [
  {
    title: "Eat only pizza forever\nor never eat pizza again?",
    options: ["Eat only pizza forever", "Never eat pizza again"],
    votes: "412K",
    split: [68, 32],
    image: [48, 1274, 103, 73],
  },
  {
    title: "Would you rather travel\nto the past or to the future?",
    options: ["Travel to the past", "Travel to the future"],
    votes: "398K",
    split: [54, 46],
    image: [48, 1355, 103, 73],
  },
  {
    title: "Be rich but unknown\nor famous but not rich?",
    options: ["Be rich but unknown", "Be famous but not rich"],
    votes: "321K",
    split: [49, 51],
    image: [48, 1436, 103, 73],
  },
];
const petQuestion: Question = {
  title: "Would you rather…",
  options: ["Always have a dog as a pet", "Always have a cat as a pet"],
  votes: "324,521",
  split: [68, 32],
  image: [163, 301, 147, 91],
};
const steps = [
  { title: "Explore", description: "Browse or get a\nrandom question", color: "#009eff" },
  { title: "Choose", description: "Pick the option\nyou prefer", color: "#ff782f" },
  { title: "See Results", description: "Instantly see\nwhat others chose", color: "#00b849" },
  { title: "Discuss", description: "Share and\ndebate with friends", color: "#7645ff" },
];
const statistics = [
  { count: "2.3M+", label: "Players", crop: [59, 1530, 48, 47] },
  { count: "50K+", label: "Questions", crop: [241, 1530, 48, 47] },
  { count: "100+", label: "Categories", crop: [410, 1530, 48, 47] },
  { count: "190+", label: "Countries", crop: [584, 1530, 48, 47] },
] satisfies { count: string; label: string; crop: Crop }[];
const occasions = [
  { title: "Friends", description: "Game nights", crop: [60, 1947, 29, 30] },
  { title: "Parties", description: "Break the ice", crop: [193, 1947, 29, 30] },
  { title: "Classrooms", description: "Group discussions", crop: [327, 1947, 29, 30] },
  { title: "Road trips", description: "Longer journeys", crop: [481, 1947, 29, 30] },
  { title: "Dates", description: "Better conversations", crop: [622, 1947, 29, 30] },
] satisfies { title: string; description: string; crop: Crop }[];
const quotes = [
  { text: "I never expected this to\nbe so close!", crop: [48, 1704, 25, 25] },
  { text: "I can’t believe 68% chose\nthis option!", crop: [217, 1708, 25, 26] },
  { text: "This question sparked an\namazing discussion! ❤️", crop: [425, 1701, 25, 25] },
  { text: "Totally changed\nmy perspectives.", crop: [619, 1706, 26, 26] },
] satisfies { text: string; crop: Crop }[];

// Only illustration, photography, avatars and special brand lettering are clipped.
// Every ordinary text label and every interactive element is HTML.
function ArtCrop({
  box,
  className = "",
  label,
}: {
  box: Crop;
  className?: string;
  label?: string;
}) {
  const [x, y, width, height] = box;
  return (
    <svg
      className={`art-crop ${className}`}
      viewBox={`${x} ${y} ${width} ${height}`}
      width={width}
      height={height}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <image href="/assets/reference-art.png" width="778" height="2021" />
    </svg>
  );
}
function HeroReferenceDetails() {
  return (
    <svg
      className="hero-reference-details"
      viewBox="0 60 778 572"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="hero-reference-cutouts">
          <path d="M0 60H210V280H166L154 305L123 451L138 477H0Z" />
          <path d="M778 185L737 186L702 210L670 219L648 243L624 272L618 290L650 440L648 485H778Z" />
        </clipPath>
      </defs>
      <image
        href="/assets/reference-art.png"
        width="778"
        height="2021"
        clipPath="url(#hero-reference-cutouts)"
      />
    </svg>
  );
}
function ChoiceFrame({ variant }: { variant: "dog" | "cat" }) {
  const path =
    variant === "dog"
      ? "M47 1C36-1 31 4 25 20L0 157C-3 173 3 180 21 180L229 176C242 176 248 171 248 158L248 36C249 25 244 19 233 17L52 1Z"
      : "M27 16L203 1C219-1 226 7 232 27L249 151C252 169 247 180 231 180L17 178C5 178 1 174 1 157L1 32C1 23 11 17 27 16Z";
  return (
    <svg className="choice-frame" viewBox="0 0 249 180" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`choice-gradient-${variant}`} x1="0" y1="0" x2=".6" y2="1">
          <stop offset="0" stopColor={variant === "dog" ? "#ffd355" : "#3fe6ee"} />
          <stop offset=".55" stopColor={variant === "dog" ? "#ff9736" : "#00bcf0"} />
          <stop offset="1" stopColor={variant === "dog" ? "#ff5336" : "#009de4"} />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill={`url(#choice-gradient-${variant})`}
        stroke={variant === "dog" ? "#ffebc2" : "#aaf8ff"}
        strokeWidth="3"
      />
    </svg>
  );
}
function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.3" stroke="currentColor" strokeWidth="2" />
      <path d="m15.2 15.2 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action && (
        <button className="section-link" onClick={onAction}>
          {action}
          <Arrow />
        </button>
      )}
    </div>
  );
}

type Panel =
  | { kind: "question"; question: Question }
  | { kind: "create" }
  | { kind: "search" }
  | { kind: "categories" }
  | null;

export default function HomePage() {
  const [panel, setPanel] = useState<Panel>(null);
  const [selection, setSelection] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [createdQuestion, setCreatedQuestion] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const allQuestions = [...highlights, ...trending];

  function openPanel(nextPanel: Exclude<Panel, null>) {
    setSelection(null);
    setPanel(nextPanel);
    dialogRef.current?.showModal();
  }
  function closePanel() {
    dialogRef.current?.close();
    setPanel(null);
  }
  function openQuestion(question: Question) {
    openPanel({ kind: "question", question });
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="homepage" data-project="wyrplay-home-reconstruction">
        <header className="site-header">
          <a href="#main" aria-label="WYRPLAY home" className="brand">
            <ArtCrop box={[54, 7, 120, 43]} label="WYRPLAY" />
          </a>
          <nav aria-label="Main navigation">
            <a href="#main" className="active">
              Home
            </a>
            <a href="#trending">Questions</a>
            <a href="#categories">Categories</a>
            <a href="#statistics">Leaderboard</a>
            <button onClick={() => openPanel({ kind: "create" })}>Create</button>
          </nav>
          <div className="header-actions">
            <button
              className="search-button"
              aria-label="Search questions"
              onClick={() => openPanel({ kind: "search" })}
            >
              <SearchIcon />
            </button>
            <button
              className="login-button"
              disabled
              title="Account pages are outside this homepage"
            >
              Log in
            </button>
            <button
              className="signup-button"
              disabled
              title="Account pages are outside this homepage"
            >
              Sign up
            </button>
          </div>
        </header>
        <main id="main">
          <section className="hero" aria-labelledby="hero-heading">
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
              <h1 id="hero-heading">
                <span className="sr-only">Would You Rather?</span>
                <ArtCrop box={[210, 43, 359, 190]} className="hero-lettering" />
              </h1>
              <h2>Same question. Different minds.</h2>
              <p>
                Play fun and thought-provoking would you rather questions
                <br />
                with people around the world.
              </p>
            </div>
            <p className="speech-bubble">
              What would
              <br />
              you pick?
            </p>
            <div className="choice-grid">
              <button
                className="choice-card dog-card"
                onClick={() => openQuestion(petQuestion)}
                aria-label="Choose: Always have a dog as a pet"
              >
                <ChoiceFrame variant="dog" />
                <ArtCrop box={[163, 301, 147, 91]} className="pet-art dog-art" />
                <span>
                  Always have
                  <br />a dog as a pet
                </span>
              </button>
              <span className="or-badge" aria-hidden="true">
                OR
              </span>
              <button
                className="choice-card cat-card"
                onClick={() => openQuestion(petQuestion)}
                aria-label="Choose: Always have a cat as a pet"
              >
                <ChoiceFrame variant="cat" />
                <ArtCrop box={[465, 300, 129, 93]} className="pet-art cat-art" />
                <span>
                  Always have
                  <br />a cat as a pet
                </span>
              </button>
            </div>
            <div className="vote-summary">
              <strong className="dog-percent">68%</strong>
              <div className="vote-middle">
                <div className="vote-bar" role="img" aria-label="68% dog, 32% cat">
                  <span />
                </div>
                <span className="vote-count">324,521 votes</span>
              </div>
              <strong className="cat-percent">32%</strong>
            </div>
            <button className="choice-cta dark-button" onClick={() => openQuestion(petQuestion)}>
              Make Your Choice
              <Arrow />
            </button>
            <div className="hero-bottom">
              <div className="join-players">
                <div className="avatar-stack">
                  {[262, 290, 318, 346].map((x) => (
                    <ArtCrop key={x} box={[x, 584, 29, 30]} />
                  ))}
                </div>
                <p>
                  <strong>Join 2.3M+ players</strong>
                  <br />
                  from around the world
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
            <SectionHeading
              title="Popular Categories"
              action="See all categories"
              onAction={() => openPanel({ kind: "categories" })}
            />
            <div className="category-grid">
              {categories.map((category) => (
                <button
                  key={category.title}
                  className={`category-card ${category.color}`}
                  onClick={() => openPanel({ kind: "categories" })}
                >
                  <ArtCrop box={category.crop} className="category-art" />
                  <span className="category-title">{category.title}</span>
                  <span className="category-description">{category.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section
            id="highlights"
            className="highlights-section section-shell dark-section"
            aria-label="Today’s highlights"
          >
            <SectionHeading
              title="Today’s Highlights"
              action="See all"
              onAction={() => openPanel({ kind: "search" })}
            />
            <div className="highlight-grid">
              {highlights.map((question) => (
                <button
                  key={question.title}
                  className="highlight-card"
                  onClick={() => openQuestion(question)}
                >
                  <ArtCrop box={question.image} className="highlight-image" />
                  <span className="highlight-body">
                    <span className="highlight-title">{question.title}</span>
                    <span className="highlight-footer">
                      <span>{question.votes} votes</span>
                      <span>
                        {question.split[0]}% <span className="split-separator">/</span>{" "}
                        {question.split[1]}%
                      </span>
                      <span className="round-arrow">
                        <Arrow />
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section
            id="how-it-works"
            className="how-section section-shell"
            aria-label="How it works"
          >
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
            aria-label="Trending questions"
          >
            <SectionHeading
              title="Trending Questions"
              action="See all"
              onAction={() => openPanel({ kind: "search" })}
            />
            <div className="trending-grid">
              <div className="trending-list">
                {trending.map((question) => (
                  <button
                    key={question.title}
                    className="trending-card"
                    onClick={() => openQuestion(question)}
                  >
                    <ArtCrop box={question.image} className="trending-image" />
                    <span className="trending-body">
                      <span className="trending-title">{question.title}</span>
                      <span className="trending-meta">
                        {question.votes} votes <span>·</span> {question.split[0]}% /{" "}
                        {question.split[1]}%
                      </span>
                    </span>
                    <span className="round-arrow">
                      <Arrow />
                    </span>
                  </button>
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
                    className="dark-button create-button"
                    onClick={() => openPanel({ kind: "create" })}
                  >
                    <span aria-hidden="true">＋</span>Create
                  </button>
                </div>
                <Image
                  src="/assets/bulb-hand.png"
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

          <section id="statistics" className="statistics" aria-label="WYRPLAY in numbers">
            {statistics.map((statistic) => (
              <div className="statistic" key={statistic.label}>
                <ArtCrop box={statistic.crop} />
                <p>
                  <strong>{statistic.count}</strong>
                  <span>{statistic.label}</span>
                </p>
              </div>
            ))}
          </section>

          <section
            id="community"
            className="community-section dark-section"
            aria-label="Community voices"
          >
            <div className="community-reference-details" aria-hidden="true">
              <ArtCrop box={[0, 1593, 245, 88]} className="community-decoration-left" />
              <ArtCrop box={[525, 1593, 253, 88]} className="community-decoration-right" />
            </div>
            <h2>See What Others Think</h2>
            <p className="community-subtitle">Real votes from real people around the world.</p>
            <div className="quote-grid">
              {quotes.map((quote) => (
                <blockquote key={quote.text}>
                  <ArtCrop box={quote.crop} />
                  <p>{quote.text}</p>
                </blockquote>
              ))}
            </div>
            <ArtCrop box={[0, 1754, 778, 112]} className="planet-art" />
          </section>

          <section
            id="play-together"
            className="together-section"
            aria-label="Play together anywhere"
          >
            <ArtCrop box={[0, 1866, 62, 155]} className="together-edge edge-left" />
            <ArtCrop box={[748, 1866, 30, 155]} className="together-edge edge-right" />
            <ArtCrop box={[75, 1883, 85, 39]} className="together-flourish flourish-left" />
            <ArtCrop box={[568, 1875, 91, 45]} className="together-flourish flourish-right" />
            <h2>Play Together, Anywhere</h2>
            <p>Perfect for friends, families, classrooms or just curious minds.</p>
            <div className="occasion-grid">
              {occasions.map((occasion) => (
                <button
                  className="occasion-card"
                  key={occasion.title}
                  onClick={() => openQuestion(highlights[0])}
                >
                  <ArtCrop box={occasion.crop} />
                  <span>
                    <strong>{occasion.title}</strong>
                    <span>{occasion.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>

      <dialog
        ref={dialogRef}
        className="home-dialog"
        onCancel={() => setPanel(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closePanel();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePanel();
        }}
        aria-labelledby="dialog-heading"
      >
        <button className="dialog-close" aria-label="Close" onClick={closePanel}>
          ×
        </button>
        {panel?.kind === "question" && (
          <>
            <p className="dialog-eyebrow">Would you rather…</p>
            <h2 id="dialog-heading">{panel.question.title}</h2>
            <div className="dialog-choices">
              {panel.question.options.map((option, index) => (
                <button
                  key={option}
                  className={selection === index ? "selected" : ""}
                  onClick={() => setSelection(index)}
                  aria-pressed={selection === index}
                >
                  {option}
                  {selection !== null && <strong>{panel.question.split[index]}%</strong>}
                </button>
              ))}
            </div>
            <p className="dialog-caption" aria-live="polite">
              {selection === null
                ? "Two possibilities. One choice."
                : `Your choice: ${panel.question.options[selection]}`}
            </p>
          </>
        )}
        {panel?.kind === "create" && (
          <>
            <p className="dialog-eyebrow">A good question starts a great conversation.</p>
            <h2 id="dialog-heading">Create Your Own Question</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const first = String(form.get("first") ?? "").trim();
                const second = String(form.get("second") ?? "").trim();
                if (first && second) setCreatedQuestion(`Would you rather ${first} or ${second}?`);
              }}
            >
              <label>
                First option
                <input
                  name="first"
                  required
                  maxLength={120}
                  placeholder="Always have a dog as a pet"
                />
              </label>
              <label>
                Second option
                <input
                  name="second"
                  required
                  maxLength={120}
                  placeholder="Always have a cat as a pet"
                />
              </label>
              <button className="dark-button" type="submit">
                Preview Question
                <Arrow />
              </button>
            </form>
            {createdQuestion && (
              <p className="created-question" aria-live="polite">
                {createdQuestion}
              </p>
            )}
          </>
        )}
        {panel?.kind === "search" && (
          <>
            <h2 id="dialog-heading">Find Your Next Question</h2>
            <label className="search-field">
              Search questions
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pizza, travel, city…"
              />
            </label>
            <div className="question-search-results">
              {allQuestions
                .filter((question) => question.title.toLowerCase().includes(search.toLowerCase()))
                .map((question, index) => (
                  <button
                    key={`${question.title}-${index}`}
                    onClick={() => {
                      setSelection(null);
                      setPanel({ kind: "question", question });
                    }}
                  >
                    {question.title.replace("\n", " ")}
                    <Arrow />
                  </button>
                ))}
              {!allQuestions.some((question) =>
                question.title.toLowerCase().includes(search.toLowerCase()),
              ) && <p>No questions found. Try another word.</p>}
            </div>
          </>
        )}
        {panel?.kind === "categories" && (
          <>
            <h2 id="dialog-heading">Popular Categories</h2>
            <div className="dialog-categories">
              {categories.map((category, index) => (
                <button
                  key={category.title}
                  className={category.color}
                  onClick={() => {
                    setSelection(null);
                    setPanel({ kind: "question", question: allQuestions[index] });
                  }}
                >
                  <ArtCrop box={category.crop} />
                  <strong>{category.title}</strong>
                  <span>{category.description}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
