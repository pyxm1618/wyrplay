"use client";

import { useRef, useState } from "react";
import { Icon, type IconName } from "./icons";
import { questions, type Question } from "./questions";

function Art({
  name,
  className = "",
  alt = "",
}: {
  name: string;
  className?: string;
  alt?: string;
}) {
  // Source-faithful screenshot crops have fixed containers, separate from all UI text.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/assets/${name}.png`} className={className} alt={alt} draggable="false" />;
}
const categories = [
  { label: "Most Popular", subtitle: "Most votes overall", icon: "crown" },
  { label: "Trending", subtitle: "Rising fast", icon: "flame" },
  { label: "Most Discussed", subtitle: "Most comments", icon: "chat" },
  { label: "Editor's Picks", subtitle: "Our favorites", icon: "star" },
  { label: "All Time", subtitle: "Top of all time", icon: "trophy" },
] as const;
const tagClass = (tag: string) =>
  ({
    Animals: "purple",
    Fun: "blue",
    Travel: "gold",
    Deep: "purple",
    Food: "gray",
    Funny: "purple",
    Life: "gold",
    Lifestyle: "mint",
    Entertainment: "gold",
    Thoughtful: "gray",
    "Daily Life": "pink",
    Skills: "mint",
    Seasons: "gold",
    Adventure: "gold",
    Weird: "purple",
  })[tag] || "gray";
function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="tags">
      {tags.map((tag) => (
        <span className={`tag ${tagClass(tag)}`} key={tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function LeaderboardHome() {
  const [category, setCategory] = useState<string>("Most Popular");
  const [period, setPeriod] = useState("All Time");
  const [saved, setSaved] = useState<number[]>([]);
  const [liked, setLiked] = useState<number[]>([]);
  const [modal, setModal] = useState<"create" | "search" | "question" | "account" | "page" | null>(
    null,
  );
  const [selected, setSelected] = useState<Question>(questions[0]);
  const [query, setQuery] = useState("");
  const [optionOne, setOptionOne] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [preview, setPreview] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [requestedPage, setRequestedPage] = useState(2);
  const [accountMode, setAccountMode] = useState("Log in");
  const dialog = useRef<HTMLDialogElement>(null);
  const open = (kind: NonNullable<typeof modal>) => {
    setModal(kind);
    dialog.current?.showModal();
  };
  const close = () => {
    dialog.current?.close();
    setModal(null);
  };
  const openQuestion = (q: Question) => {
    setSelected(q);
    setChoice(null);
    open("question");
  };
  const toggle = (id: number, values: number[], setter: (values: number[]) => void) =>
    setter(values.includes(id) ? values.filter((value) => value !== id) : [...values, id]);
  const chooseCategory = (label: string) => {
    setCategory(label);
    if (label === "This Month" || label === "This Week" || label === "All Time") setPeriod(label);
  };
  let ranked = [...questions];
  if (category === "Trending" || period === "This Week") ranked.sort((a, b) => b.id - a.id);
  else if (category === "Editor's Picks" || period === "This Month")
    ranked = [
      questions[4],
      questions[6],
      questions[1],
      ...questions.filter((q) => ![5, 7, 2].includes(q.id)),
    ];
  else if (category === "Most Discussed") ranked.sort((a, b) => b.discussion - a.discussion);
  const podium = [ranked[1], ranked[0], ranked[2]];
  const isDefault = category === "Most Popular" && period === "All Time";
  return (
    <div className="page-shell">
      <header className="site-header">
        <a href="#" aria-label="WYRPLAY home">
          <Art name="logo" className="logo" alt="WYRPLAY" />
        </a>
        <nav aria-label="Main navigation">
          <a href="#">Home</a>
          <a href="#top-ten">Questions</a>
          <a href="#categories">Categories</a>
          <a href="#leaderboards" aria-current="page" className="nav-active">
            Leaderboards
          </a>
          <button onClick={() => open("create")}>Create</button>
        </nav>
        <div className="header-actions">
          <button
            className="search-button"
            aria-label="Search questions"
            onClick={() => open("search")}
          >
            <Icon name="search" />
          </button>
          <button
            className="login"
            onClick={() => {
              setAccountMode("Log in");
              open("account");
            }}
          >
            Log in
          </button>
          <button
            className="dark-button signup"
            onClick={() => {
              setAccountMode("Sign up");
              open("account");
            }}
          >
            Sign up
          </button>
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
              <br className="desktop-break" /> Would You Rather questions, based on real votes and
              community feedback.
            </p>
          </div>
          <Art
            name="hero-art"
            className="hero-art"
            alt="A happy player raising a golden trophy. Great questions by real people!"
          />
          <span className="spark spark-one">✦</span>
          <span className="spark spark-two">✦</span>
          <span className="hero-squiggle">∿</span>
        </section>
        <div className="category-tabs" id="categories" aria-label="Leaderboard categories">
          {categories.map((item) => (
            <button
              className={category === item.label ? "selected" : ""}
              key={item.label}
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
        <div className="leaderboard-layout" id="leaderboards">
          <aside className="sidebar">
            <Art name="sidebar-trophy" className="sidebar-trophy" />
            <h2>Leaderboards</h2>
            <p>
              See the best questions
              <br />
              in different ways
            </p>
            <nav aria-label="Leaderboard views">
              {[
                ...categories,
                { label: "This Month", icon: "calendar" as const },
                { label: "This Week", icon: "calendar" as const },
              ].map((item) => (
                <button
                  key={item.label}
                  className={category === item.label ? "active" : ""}
                  aria-pressed={category === item.label}
                  onClick={() => chooseCategory(item.label)}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </button>
              ))}
            </nav>
            <section className="create-card">
              <h3>Create a Question</h3>
              <p>
                Got a great idea?
                <br />
                Share it with the world!
              </p>
              <Art name="bulb" className="bulb" />
              <button className="dark-button" onClick={() => open("create")}>
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
                {isDefault
                  ? "The most popular questions of all time, chosen by the WYRPLAY community."
                  : `${category} questions · ${period}. Static demo selections.`}
              </p>
              <div className="podium">
                {podium.map((q, index) => (
                  <article
                    className={`question-card ${index === 1 ? "travel" : index === 0 ? "dog" : "pizza"}`}
                    key={q.id}
                  >
                    <Art
                      name={`medal-${index === 1 ? 1 : index === 0 ? 2 : 3}`}
                      className="medal"
                    />
                    <button
                      className="question-open"
                      onClick={() => openQuestion(q)}
                      aria-label={`Open question: ${q.title}`}
                    >
                      <Art name={q.art} className="question-art" />
                      <h3>
                        {q.id === 2
                          ? ["Always have a dog", "as a pet or always", "have a cat as a pet?"].map(
                              (line) => (
                                <span className="card-title-line" key={line}>
                                  {line}
                                </span>
                              ),
                            )
                          : q.id === 1
                            ? ["Travel to the past", "or travel to the", "future?"].map((line) => (
                                <span className="card-title-line" key={line}>
                                  {line}
                                </span>
                              ))
                            : q.id === 3
                              ? ["Eat only pizza forever", "or never eat pizza", "again?"].map(
                                  (line) => (
                                    <span className="card-title-line" key={line}>
                                      {line}
                                    </span>
                                  ),
                                )
                              : q.title}
                      </h3>
                    </button>
                    <Tags tags={q.tags} />
                    <div className="card-metrics">
                      <button
                        className={`vote-count ${liked.includes(q.id) ? "liked" : ""}`}
                        aria-label={`Like question ${q.id}`}
                        aria-pressed={liked.includes(q.id)}
                        onClick={() => toggle(q.id, liked, setLiked)}
                      >
                        <Icon name="heart" />
                        {q.votes}
                        {liked.includes(q.id) ? " +1" : ""}
                      </button>
                      <button
                        onClick={() => openQuestion(q)}
                        aria-label={`Read comments for question ${q.id}`}
                      >
                        <span className="outline-chat">☷</span>
                        {q.comments}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="top-ten-section" id="top-ten">
              <div className="ranking-heading">
                <h2>Top 10 Questions</h2>
                <div className="period-tabs" aria-label="Time period">
                  {["All Time", "This Month", "This Week"].map((value) => (
                    <button
                      key={value}
                      className={period === value ? "active" : ""}
                      aria-pressed={period === value}
                      onClick={() => setPeriod(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ranking-list">
                {ranked.slice(3).map((q, index) => (
                  <article className="ranking-row" key={q.id}>
                    <span className={`rank-number rank-${index + 4}`}>{index + 4}</span>
                    <button
                      className="row-art-button"
                      onClick={() => openQuestion(q)}
                      aria-label={`Open question ${q.id}`}
                    >
                      <Art name={q.art} className="row-art" />
                    </button>
                    <div className="row-content">
                      <button className="row-title" onClick={() => openQuestion(q)}>
                        {q.title}
                      </button>
                      <Tags tags={q.tags} />
                    </div>
                    <button
                      className="row-votes"
                      aria-label={`Like question ${q.id}`}
                      aria-pressed={liked.includes(q.id)}
                      onClick={() => toggle(q.id, liked, setLiked)}
                    >
                      <Icon name="heart" />
                      {q.votes}
                      {liked.includes(q.id) ? " +1" : ""}
                    </button>
                    <button
                      className="row-comments"
                      onClick={() => openQuestion(q)}
                      aria-label={`Read comments for question ${q.id}`}
                    >
                      <span className="outline-chat">☷</span>
                      {q.comments}
                    </button>
                    <button
                      className={`bookmark ${saved.includes(q.id) ? "saved" : ""}`}
                      aria-label={`${saved.includes(q.id) ? "Unsave" : "Save"} question ${q.id}`}
                      aria-pressed={saved.includes(q.id)}
                      onClick={() => toggle(q.id, saved, setSaved)}
                    >
                      <Icon name="bookmark" />
                    </button>
                  </article>
                ))}
              </div>
            </section>
            <nav className="pagination" aria-label="Ranking pages">
              <button disabled>
                <span>←</span> Previous
              </button>
              <button className="current" aria-current="page">
                1
              </button>
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setRequestedPage(n);
                    open("page");
                  }}
                >
                  {n}
                </button>
              ))}
              <span>…</span>
              <button
                onClick={() => {
                  setRequestedPage(24);
                  open("page");
                }}
              >
                24
              </button>
              <button
                onClick={() => {
                  setRequestedPage(2);
                  open("page");
                }}
              >
                Next <Icon name="arrow" />
              </button>
            </nav>
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
                { icon: "heart", value: "2.3M+", label: "Total votes" },
                { icon: "chat", value: "190K+", label: "Comments" },
                { icon: "people", value: "100K+", label: "Players" },
                { icon: "question", value: "50K+", label: "Questions" },
              ].map((stat) => (
                <div className={`stat stat-${stat.icon}`} key={stat.label}>
                  <Icon name={stat.icon as IconName} />
                  <strong>{stat.value}</strong>
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
            <p>Legendary questions that never get old.</p>
            <div className="hall-grid">
              {[questions[0], questions[2], questions[1], questions[6], questions[4]].map((q) => (
                <button key={q.id} onClick={() => openQuestion(q)} aria-label={q.title}>
                  <Art name={q.art} />
                </button>
              ))}
              <button
                aria-label="Browse all questions"
                onClick={() => {
                  setQuery("");
                  open("search");
                }}
              >
                •••
              </button>
            </div>
          </section>
        </div>
        <section className="footer-cta">
          <Art name="footer-trophy" />
          <div>
            <h2>Think yours can make the list?</h2>
            <p>
              Create and share your own would you rather question.
              <br />
              Get votes, spark discussions, and maybe see it on the leaderboard!
            </p>
          </div>
          <button className="dark-button" onClick={() => open("create")}>
            Create a Question <Icon name="arrow" />
          </button>
          <span className="footer-star">★</span>
        </section>
      </main>
      <dialog
        ref={dialog}
        onCancel={() => setModal(null)}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        aria-labelledby="dialog-title"
      >
        <button className="dialog-close" aria-label="Close" onClick={close}>
          ×
        </button>
        {modal === "create" && (
          <>
            <h2 id="dialog-title">Create a Question</h2>
            <p className="demo-note">Local preview only. Your question is not published.</p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setPreview(`Would you rather ${optionOne.trim()} or ${optionTwo.trim()}?`);
              }}
            >
              <label>
                First option
                <input
                  required
                  maxLength={140}
                  value={optionOne}
                  onChange={(event) => setOptionOne(event.target.value)}
                  placeholder="travel to the past"
                  pattern=".*\S.*"
                />
              </label>
              <label>
                Second option
                <input
                  required
                  maxLength={140}
                  value={optionTwo}
                  onChange={(event) => setOptionTwo(event.target.value)}
                  placeholder="travel to the future"
                  pattern=".*\S.*"
                />
              </label>
              <button className="dark-button">
                Preview Question <Icon name="arrow" />
              </button>
            </form>
            {preview && <p className="question-preview">{preview}</p>}
          </>
        )}
        {modal === "search" && (
          <>
            <h2 id="dialog-title">Find your next dilemma</h2>
            <label className="search-label">
              Search questions
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try pizza, travel, music…"
              />
            </label>
            <div className="search-results">
              {questions
                .filter((q) =>
                  `${q.title} ${q.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
                )
                .map((q) => (
                  <button key={q.id} onClick={() => openQuestion(q)}>
                    <Art name={q.art} />
                    <span>{q.title}</span>
                    <Icon name="arrow" />
                  </button>
                ))}
              {!questions.some((q) =>
                `${q.title} ${q.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
              ) && <p>No matching questions. Try another word.</p>}
            </div>
          </>
        )}
        {modal === "question" && (
          <>
            <h2 id="dialog-title">Would you rather…</h2>
            <Art name={selected.art} className="dialog-art" />
            <h3>{selected.title}</h3>
            <div className="choice-buttons">
              {selected.title
                .replace(/\?$/, "")
                .split(" or ")
                .map((option) => (
                  <button
                    className={choice === option ? "chosen" : ""}
                    key={option}
                    aria-pressed={choice === option}
                    onClick={() => setChoice(option)}
                  >
                    {option}
                  </button>
                ))}
            </div>
            {choice && (
              <p className="choice-feedback">
                You chose: {choice}. Your choice stays in this local demo.
              </p>
            )}
            <p className="demo-note">
              {selected.votes} votes · {selected.comments} comments in the design sample. Live
              comments are not connected.
            </p>
          </>
        )}
        {modal === "account" && (
          <>
            <h2 id="dialog-title">{accountMode}</h2>
            <p>This is a static frontend preview. Account access is not connected.</p>
            <button className="dark-button" onClick={close}>
              Keep exploring <Icon name="arrow" />
            </button>
          </>
        )}
        {modal === "page" && (
          <>
            <h2 id="dialog-title">Page {requestedPage}</h2>
            <p>
              This design sample contains the first 10 questions. Additional ranking pages are not
              connected.
            </p>
            <button className="dark-button" onClick={close}>
              Back to rankings <Icon name="arrow" />
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}
