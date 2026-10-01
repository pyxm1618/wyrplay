"use client";
/* eslint-disable @next/next/no-img-element -- Original screenshot artwork is delivered at its measured native size. */
import { useRef, useState } from "react";

const questions = [
  {
    text: "Would you rather be able to pause time or rewind ten minutes?",
    tags: ["Popular", "Friends", "Hard"],
    people: "12.4k",
    percent: 62,
    options: ["Pause time", "Rewind ten minutes"],
  },
  {
    text: "Would you rather have a pet dragon or a pet dinosaur?",
    tags: ["Kids", "Funny", "Family-safe"],
    people: "8.7k",
    percent: 55,
    options: ["A pet dragon", "A pet dinosaur"],
  },
  {
    text: "Would you rather give up music for a year or movies for a year?",
    tags: ["Teens", "Friends"],
    people: "15.2k",
    percent: 48,
    options: ["Give up music for a year", "Give up movies for a year"],
  },
  {
    text: "Would you rather speak every language or play every instrument?",
    tags: ["Classroom", "Thoughtful"],
    people: "6.1k",
    percent: 67,
    options: ["Speak every language", "Play every instrument"],
  },
  {
    text: "Would you rather always arrive 20 minutes early or 10 minutes late?",
    tags: ["Adults", "Coworkers"],
    people: "9.3k",
    percent: 58,
    options: ["Arrive 20 minutes early", "Arrive 10 minutes late"],
  },
  {
    text: "Would you rather live by the beach or in the mountains?",
    tags: ["Travel", "Lifestyle"],
    people: "11.6k",
    percent: 52,
    options: ["Live by the beach", "Live in the mountains"],
  },
  {
    text: "Would you rather have summer forever or winter forever?",
    tags: ["Kids", "Funny"],
    people: "10.9k",
    percent: 49,
    options: ["Summer forever", "Winter forever"],
  },
  {
    text: "Would you rather read minds or see the future?",
    tags: ["Deep", "Thoughtful"],
    people: "7.4k",
    percent: 61,
    options: ["Read minds", "See the future"],
  },
  {
    text: "Would you rather never get tired or never be hungry?",
    tags: ["Adults", "Weird"],
    people: "13.1k",
    percent: 54,
    options: ["Never get tired", "Never be hungry"],
  },
  {
    text: "Would you rather explore space or the deep ocean?",
    tags: ["Travel", "Adventure"],
    people: "9.8k",
    percent: 56,
    options: ["Explore space", "Explore the deep ocean"],
  },
];
const groups = [
  { title: "By Age", icon: "👦🏻", items: ["Kids", "Teens", "Adults", "7–9", "10–12"] },
  { title: "By Group", icon: "🧑‍🤝‍🧑", items: ["Friends", "Couples", "Family", "Coworkers"] },
  {
    title: "By Occasion",
    icon: "📍",
    items: ["Classroom", "Party", "Road Trip", "Date Night", "Dinner"],
  },
  { title: "By Style", icon: "😊", items: ["Funny", "Deep", "Weird"] },
  { title: "Difficulty", icon: "📊", items: ["Easy", "Medium", "Hard"] },
];
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    bookmark: <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-4z" />,
    arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),
    play: <path d="m7 4 13 8-13 8z" />,
    filter: (
      <>
        <path d="M4 4h16l-6 8v7l-4 2v-9z" />
      </>
    ),
    screen: (
      <>
        <rect x="3" y="3" width="18" height="13" rx="1" />
        <path d="M8 21h8m-4-5v5" />
      </>
    ),
    print: (
      <>
        <path d="M6 8V3h12v5M6 17H3V9h18v8h-3M6 14h12v7H6z" />
        <path d="M17 11h1" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.arrow}
    </svg>
  );
}
function tagClass(tag: string) {
  return ["Kids"].includes(tag)
    ? "green"
    : ["Funny", "Family-safe", "Travel"].includes(tag)
      ? "blue"
      : ["Adults", "Classroom", "Popular", "Deep"].includes(tag)
        ? "red"
        : tag === "Teens"
          ? "purple"
          : "neutral";
}
export default function FinderPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [presenting, setPresenting] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const filtered = questions
    .map((q, index) => ({ ...q, index }))
    .filter(
      (q) =>
        (!search || `${q.text} ${q.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase())) &&
        (!filters.length ||
          filters.some(
            (f) =>
              q.tags.includes(f) ||
              (f === "Family" && q.tags.includes("Family-safe")) ||
              (["7–9", "10–12"].includes(f) && q.tags.includes("Kids")),
          )),
    );
  const playlist = selected.length ? selected : filtered.map((q) => q.index);
  const current = questions[playlist[round % Math.max(playlist.length, 1)] ?? 0];
  function toggle(list: number[], value: number) {
    return list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
  }
  function play(present = false) {
    if (!playlist.length) {
      setNotice("No questions match. Clear the filters to start playing.");
      return;
    }
    setRound(0);
    setAnswer(null);
    setPresenting(present);
    dialog.current?.showModal();
  }
  function clear() {
    setDraft([]);
    setFilters([]);
    setQuery("");
    setSearch("");
  }
  function explore() {
    document.querySelector(".filters")?.scrollIntoView({ behavior: "smooth" });
    setNotice("Choose an age, group, occasion or style, then apply your filters.");
  }
  return (
    <main className="finder-page">
      <div className="page-art" aria-hidden="true">
        <img className="search-left-art" src="/assets/search-left.png" alt="" />
        <img className="search-right-art" src="/assets/search-right.png" alt="" />
        <img className="selection-left-art" src="/assets/selection-left.png" alt="" />
        <img className="bottom-band-art" src="/assets/bottom-band.png" alt="" />
        <img className="left-top-art" src="/assets/left-top.png" alt="" />
        <img className="left-edge-art" src="/assets/left-edge.png" alt="" />
        <img className="right-edge-art" src="/assets/right-edge.png" alt="" />
        <img className="left-bottom-art" src="/assets/left-bottom.png" alt="" />
        <img className="bottom-left-art" src="/assets/bottom-left.png" alt="" />
        <img className="bottom-right-art" src="/assets/bottom-right.png" alt="" />
      </div>
      <header className="site-header">
        <a href="#" aria-label="WYRPLAY home">
          <img className="logo" src="/assets/logo.png" alt="WYRPLAY" />
        </a>
        <nav aria-label="Main navigation">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</button>
          <a className="active" href="#search">
            Find Questions
          </a>
          <a href="#questions">Popular</a>
          <button onClick={explore}>Categories</button>
          <button
            onClick={() =>
              setNotice("Leaderboards are outside this standalone Find Questions prototype.")
            }
          >
            Leaderboards
          </button>
          <button
            onClick={() =>
              setNotice("WYRPLAY: find a question, choose your side, start a conversation.")
            }
          >
            About
          </button>
        </nav>
        <button
          className="nav-search icon-button"
          aria-label="Focus search"
          onClick={() => searchInput.current?.focus()}
        >
          <Icon name="search" />
        </button>
        <button
          className="login"
          onClick={() => setNotice("This local prototype does not connect to account services.")}
        >
          Log in
        </button>
        <button
          className="signup black"
          onClick={() => setNotice("This local prototype does not connect to account services.")}
        >
          Sign up
        </button>
      </header>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            <span className="find-word">Find</span>
            <span className="rather-line">
              Would You{" "}
              <span className="rather">
                <i>Ra</i>ther
              </span>
            </span>
            <span className="questions-word">Questions</span>
          </h1>
          <p>Browse first. Filter only when you need to narrow the pool.</p>
        </div>
        <span className="spark spark-one" aria-hidden="true">
          ✦
        </span>
        <span className="spark spark-two" aria-hidden="true">
          ✦
        </span>
        <span className="spark spark-three" aria-hidden="true">
          ✦
        </span>
        <img
          className="hero-character"
          src="/assets/hero-character.png"
          alt="A curious cartoon explorer looking through a magnifying glass"
        />
      </section>
      <div className="search-area" id="search">
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(query.trim());
          }}
        >
          <Icon name="search" />
          <input
            ref={searchInput}
            type="search"
            aria-label="Search questions"
            placeholder="Search questions, topics or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="black" type="submit">
            Search
          </button>
        </form>
        <div className="popular-searches">
          <strong>🔥 Popular searches:</strong>
          {[
            "for kids",
            "funny",
            "relationships",
            "deep",
            "school",
            "party",
            "would you rather food",
            "travel",
          ].map((term) => (
            <button
              key={term}
              onClick={() => {
                const mapped =
                  term === "for kids"
                    ? "Kids"
                    : term === "school"
                      ? "Classroom"
                      : term === "relationships"
                        ? "Friends"
                        : term === "would you rather food"
                          ? "hungry"
                          : term;
                setQuery(mapped);
                setSearch(mapped);
              }}
            >
              {term}
            </button>
          ))}
          <button aria-label="More popular searches" onClick={explore}>
            ...
          </button>
          <span className="tiny-blue" aria-hidden="true">
            ↔
          </span>
        </div>
      </div>
      <div className="directory">
        <aside className="filters" aria-label="Question filters">
          <div className="filter-heading">
            <h2>Filters</h2>
            <button className="clear-link" onClick={clear}>
              Clear all
            </button>
          </div>
          {groups.map((g) => (
            <section className="filter-group" key={g.title}>
              <h3>
                <img
                  src={`/assets/filter-${["age", "group", "occasion", "style", "difficulty"][groups.indexOf(g)]}.png`}
                  alt=""
                />
                {g.title}
              </h3>
              <div className="filter-options">
                {g.items.map((item) => (
                  <button
                    className={draft.includes(item) ? "chosen" : ""}
                    aria-pressed={draft.includes(item)}
                    key={item}
                    onClick={() =>
                      setDraft(
                        draft.includes(item) ? draft.filter((f) => f !== item) : [...draft, item],
                      )
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>
          ))}
          <button className="apply-button black" onClick={() => setFilters([...draft])}>
            <Icon name="filter" />
            Apply Filters <Icon name="arrow" />
          </button>
          <span className="apply-rays" aria-hidden="true">
            〟
          </span>
        </aside>
        <section className="question-panel" id="questions" aria-labelledby="questions-title">
          <div className="panel-heading">
            <div>
              <h2 id="questions-title">
                {search || filters.length ? "Your Questions" : "Popular Questions"}
                <img className="crown-art" src="/assets/crown.png" alt="" />
              </h2>
              <p>
                {search || filters.length
                  ? `${filtered.length} questions match your search and filters.`
                  : "Showing a useful default pool before any filter is selected."}
              </p>
            </div>
            <div className="view-actions">
              <button
                className="black"
                onClick={() =>
                  document.querySelector(".question-list")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Icon name="list" size={15} />
                Browse list
              </button>
              <button onClick={() => play()}>
                <Icon name="play" size={15} />
                Play one-by-one
              </button>
            </div>
          </div>
          <div className="question-list">
            {filtered.map((q) => (
              <article
                className={`question-card ${selected.includes(q.index) ? "is-selected" : ""}`}
                key={q.index}
              >
                <span className={`question-number number-${q.index + 1}`}>
                  {String(q.index + 1).padStart(2, "0")}
                </span>
                <div className="question-details">
                  <h3>{q.text}</h3>
                  <div className="tags">
                    {q.tags.map((tag) => (
                      <span className={tagClass(tag)} key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="question-stats">
                    <img src="/assets/people.png" alt="" /> {q.people} people · {q.percent}% choose
                    A
                  </p>
                </div>
                <img
                  className="question-art"
                  src={`/assets/question-${String(q.index + 1).padStart(2, "0")}.png`}
                  alt=""
                />
                <button
                  className={`bookmark icon-button ${saved.includes(q.index) ? "saved" : ""}`}
                  aria-label={`${saved.includes(q.index) ? "Unsave" : "Save"} question ${q.index + 1}`}
                  aria-pressed={saved.includes(q.index)}
                  onClick={() => setSaved(toggle(saved, q.index))}
                >
                  <Icon name="bookmark" size={16} />
                </button>
                <button
                  className="select-button black"
                  aria-pressed={selected.includes(q.index)}
                  onClick={() => setSelected(toggle(selected, q.index))}
                >
                  {selected.includes(q.index) ? "Selected" : "Select"}
                  <Icon name="arrow" size={15} />
                </button>
              </article>
            ))}
            {!filtered.length && (
              <div className="empty-state">
                <h3>No questions found</h3>
                <p>Try another keyword or clear your filters.</p>
                <button onClick={clear}>Clear search & filters</button>
              </div>
            )}
          </div>
        </section>
      </div>
      <nav className="pagination" aria-label="Question pages">
        <button disabled>← Previous</button>
        <button className="current" aria-current="page">
          1
        </button>
        {[2, 3, 4, 5, "...", 24].map((n) => (
          <button
            key={n}
            onClick={() => setNotice("This static demo contains the 10 questions shown on page 1.")}
          >
            {n}
          </button>
        ))}
        <span aria-hidden="true">›</span>
        <button
          onClick={() => setNotice("This static demo contains the 10 questions shown on page 1.")}
        >
          Next →
        </button>
      </nav>
      <section className="selection-bar" aria-label="Selected questions">
        <div>
          <h3 aria-live="polite">{selected.length} selected questions</h3>
          <p>Selection is optional; the filtered pool itself can be used.</p>
        </div>
        <div className="selection-actions">
          <button className="black" onClick={() => play()}>
            Play these questions <Icon name="play" size={15} />
          </button>
          <button onClick={() => play(true)}>
            <Icon name="screen" />
            Present
          </button>
          <button onClick={() => window.print()}>
            <Icon name="print" />
            Print / Customize
          </button>
        </div>
      </section>
      <section className="category-banner">
        <img src="/assets/bulb.png" alt="" />
        <div>
          <h2>Still can’t find the right questions?</h2>
          <p>Try our category browsing and discover more fun Would You Rather questions.</p>
        </div>
        <button className="black" onClick={explore}>
          Browse all categories <Icon name="arrow" size={15} />
        </button>
      </section>
      {notice && (
        <div className="notice" role="status">
          <p>{notice}</p>
          <button aria-label="Dismiss message" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      <dialog ref={dialog} className={`play-dialog ${presenting ? "presenter" : ""}`}>
        <button
          className="close-dialog"
          aria-label="Close player"
          onClick={() => dialog.current?.close()}
        >
          ×
        </button>
        <span className="demo-label">
          LOCAL DEMO · {round + 1} / {playlist.length}
        </span>
        <h2>{current.text}</h2>
        <div className="answer-options">
          {current.options.map((option, index) => (
            <button
              aria-pressed={answer === index}
              className={answer === index ? "chosen" : ""}
              key={option}
              onClick={() => setAnswer(index)}
            >
              {option}
            </button>
          ))}
        </div>
        {answer !== null && (
          <p className="demo-result">
            You chose {answer === 0 ? "A" : "B"}. Reference sample: {current.percent}% chose A.
          </p>
        )}
        <button
          className="black next-question"
          onClick={() => {
            setRound((round + 1) % playlist.length);
            setAnswer(null);
          }}
        >
          Next question <Icon name="arrow" />
        </button>
      </dialog>
    </main>
  );
}
