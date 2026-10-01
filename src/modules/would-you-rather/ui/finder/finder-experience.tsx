"use client";
/* eslint-disable @next/next/no-img-element -- Reused original illustration artwork. */
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "../../types";
import {
  filterFinderQuestions,
  parseSavedQuestionIds,
  questionPage,
  type FinderCriteria,
} from "../../domain/finder";
import { useRouter } from "next/navigation";
import { finderSessionKey, parseFinderSession, questionPoolUrl } from "../../domain/play-session";

import { FinderIcon } from "./icon";
import { FinderFilters } from "./filters";
import { FinderQuestionCard } from "./question-card";
import { FinderCategories, FinderDecoration, FinderHeader, FinderHero } from "./chrome";
import "./finder.css";
import "./finder-responsive.css";

const savedKey = "wyrplay:saved-questions:v1";
const popularSearches = [
  ["for kids", "kids"],
  ["funny", "funny"],
  ["relationships", "friends"],
  ["deep", "deep"],
  ["school", "classroom"],
  ["party", "party"],
  ["would you rather food", "food"],
  ["travel", "travel"],
] as const;
export function FinderExperience({
  questions,
  authEnabled = false,
}: {
  readonly questions: readonly Question[];
  readonly authEnabled?: boolean;
}) {
  const approved = useMemo(() => filterFinderQuestions(questions, {}), [questions]);
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [draft, setDraft] = useState<FinderCriteria>({});
  const [criteria, setCriteria] = useState<FinderCriteria>({});
  const [pageNumber, setPageNumber] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const ids = parseSavedQuestionIds(localStorage.getItem(savedKey) ?? "[]", questions);
      startTransition(() => setSaved(ids));
      if (new URLSearchParams(location.search).has("restore")) {
        const stored = sessionStorage.getItem(finderSessionKey);
        if (stored) {
          const restored = parseFinderSession(stored);
          startTransition(() => {
            setQuery(restored.query);
            setKeyword(restored.keyword);
            setDraft(restored.draft);
            setCriteria(restored.criteria);
            setPageNumber(restored.pageNumber);
            setSelected(restored.selected.filter((id) => approved.some((q) => q.id === id)));
          });
        }
      }
    } catch (error: unknown) {
      startTransition(() =>
        setNotice(
          error instanceof SyntaxError
            ? "Saved questions could not be read. You can save questions again."
            : "Saved questions are unavailable in this browser.",
        ),
      );
    }
  }, [questions, approved]);
  const filtered = useMemo(
    () =>
      filterFinderQuestions(questions, {
        ...criteria,
        ...(keyword ? { searchKeyword: keyword } : {}),
      }),
    [questions, criteria, keyword],
  );
  const currentPage = questionPage(filtered, pageNumber);
  const pool = selected.length ? approved.filter((q) => selected.includes(q.id)) : filtered;
  const activeFilters = Boolean(keyword || Object.keys(criteria).length);
  function clear() {
    setQuery("");
    setKeyword("");
    setDraft({});
    setCriteria({});
    setPageNumber(1);
  }
  function toggleSelected(id: string) {
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id],
    );
  }
  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id];
    try {
      localStorage.setItem(savedKey, JSON.stringify(next));
      setSaved(next);
    } catch {
      setNotice(
        "This browser could not save the question. Check your storage permissions and try again.",
      );
    }
  }
  function openPlayer(present = false, print = false) {
    if (!pool.length) {
      setNotice("No questions match. Clear your filters before playing.");
      return;
    }
    try {
      sessionStorage.setItem(
        finderSessionKey,
        JSON.stringify({ query, keyword, draft, criteria, pageNumber, selected }),
      );
      router.push(questionPoolUrl(print ? "/print" : "/play", pool, present));
    } catch {
      setNotice(
        "This browser could not preserve your question set. Check storage permissions and try again.",
      );
    }
  }
  function popularSearch(value: (typeof popularSearches)[number][1]) {
    clear();
    if (value === "kids") {
      setCriteria({ age: "kids" });
      setDraft({ age: "kids" });
    } else if (value === "funny" || value === "deep") {
      setCriteria({ tone: value });
      setDraft({ tone: value });
    } else if (value === "friends") {
      setCriteria({ relationship: "friends" });
      setDraft({ relationship: "friends" });
    } else if (value === "classroom" || value === "party") {
      setCriteria({ occasion: value });
      setDraft({ occasion: value });
    } else {
      setQuery(value);
      setKeyword(value);
    }
  }
  const visiblePages = Array.from({ length: currentPage.totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === currentPage.totalPages ||
      Math.abs(p - currentPage.page) <= 1 ||
      (currentPage.page < 4 && p <= 5),
  );
  function changePage(page: number) {
    setPageNumber(page);
    document.getElementById("questions")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <div className="finder-page" data-theme="light">
      <FinderDecoration />
      <FinderHeader
        authEnabled={authEnabled}
        onSearch={() => input.current?.focus()}
        onPlay={() => openPlayer()}
      />
      <FinderHero />
      <div className="search-area" id="search">
        <form
          className="search-form"
          onSubmit={(event) => {
            event.preventDefault();
            setKeyword(query.trim());
            setPageNumber(1);
          }}
        >
          <FinderIcon name="search" />
          <input
            ref={input}
            type="search"
            aria-label="Search questions"
            placeholder="Search questions, topics or keywords..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="black" type="submit">
            Search
          </button>
        </form>
        <div className="popular-searches">
          <strong>🔥 Popular searches:</strong>
          {popularSearches.map(([label, value]) => (
            <button key={label} onClick={() => popularSearch(value)}>
              {label}
            </button>
          ))}
          <a href="#category-links" aria-label="More categories">
            ...
          </a>
          <span className="tiny-blue" aria-hidden="true">
            ↔
          </span>
        </div>
      </div>
      <div className="directory">
        <FinderFilters
          draft={draft}
          onChange={setDraft}
          onApply={() => {
            setCriteria(draft);
            setPageNumber(1);
          }}
          onClear={clear}
        />
        <section className="question-panel" id="questions" aria-labelledby="questions-title">
          <div className="panel-heading">
            <div>
              <h2 id="questions-title">
                {activeFilters ? "Your Questions" : "Browse Questions"}
                <img className="crown-art" src="/finder/assets/crown.png" alt="" />
              </h2>
              <p aria-live="polite">
                {activeFilters
                  ? `${filtered.length} matching questions`
                  : `${approved.length} curated questions — browse before choosing filters.`}
              </p>
            </div>
            <div className="view-actions">
              <a className="black" href="#questions">
                <FinderIcon name="list" size={15} />
                Browse list
              </a>
              <button onClick={() => openPlayer()} disabled={!pool.length}>
                <FinderIcon name="play" size={15} />
                Play one-by-one
              </button>
            </div>
          </div>
          <div className="question-list">
            {currentPage.questions.map((question, i) => (
              <FinderQuestionCard
                key={question.id}
                question={question}
                number={(currentPage.page - 1) * 10 + i + 1}
                selected={selected.includes(question.id)}
                saved={saved.includes(question.id)}
                onSelect={() => toggleSelected(question.id)}
                onSave={() => toggleSaved(question.id)}
                revision={0}
              />
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
        <button disabled={currentPage.page <= 1} onClick={() => changePage(currentPage.page - 1)}>
          ← Previous
        </button>
        {visiblePages.map((p, i) => (
          <span className="pagination-entry" key={p}>
            {i > 0 && p > (visiblePages[i - 1] ?? 0) + 1 && <span aria-hidden="true">…</span>}
            <button
              className={currentPage.page === p ? "current" : ""}
              aria-current={currentPage.page === p ? "page" : undefined}
              aria-label={`Page ${p}`}
              onClick={() => changePage(p)}
            >
              {p}
            </button>
          </span>
        ))}
        <button
          disabled={currentPage.page >= currentPage.totalPages}
          onClick={() => changePage(currentPage.page + 1)}
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
          <button className="black" onClick={() => openPlayer()} disabled={!pool.length}>
            Play these questions <FinderIcon name="play" size={15} />
          </button>
          <button onClick={() => openPlayer(true)} disabled={!pool.length}>
            <FinderIcon name="screen" />
            Present
          </button>
          <button onClick={() => openPlayer(false, true)}>
            <FinderIcon name="print" />
            Print / Customize
          </button>
        </div>
      </section>
      <section className="category-banner">
        <img src="/finder/assets/bulb.png" alt="" />
        <div>
          <h2>Still can’t find the right questions?</h2>
          <p>Try our category browsing and discover more fun Would You Rather questions.</p>
        </div>
        <a className="black" href="#category-links">
          Browse all categories <FinderIcon name="arrow" size={15} />
        </a>
      </section>
      <FinderCategories />
      <details className="finder-about" id="finder-about">
        <summary>About this question bank</summary>
        <p>
          Browse reviewed questions from the WYRPLAY question bank. Votes and percentages come from
          the voting service; zero votes and unavailable statistics are shown explicitly. Saved
          questions stay in this browser. Choose questions across pages, or play the current
          filtered pool.
        </p>
      </details>
      {notice && (
        <div className="notice" role="status">
          <p>{notice}</p>
          <button aria-label="Dismiss message" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
