"use client";
/* eslint-disable @next/next/no-img-element -- Reused original illustration artwork. */
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "../../types";
import {
  filterFinderQuestions,
  parseSavedQuestionIds,
  questionPage,
  questionArtworks,
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
  ["friends", "friends"],
  ["deep", "deep"],
  ["school", "classroom"],
  ["party", "party"],
  ["would you rather food", "food"],
  ["travel", "travel"],
] as const;

const VALID_AGES = new Set(["kids", "teens", "adults", "7-9", "10-12"]);
const VALID_RELATIONSHIPS = new Set(["friends", "couples", "family", "coworkers"]);
const VALID_OCCASIONS = new Set(["classroom", "party", "road-trip", "dinner", "date-night"]);
const VALID_TONES = new Set(["funny", "weird", "deep"]);
const VALID_DIFFICULTIES = new Set(["easy", "hard"]);

function parseUrlParams(search: string): {
  keyword: string;
  criteria: FinderCriteria;
  page: number;
} {
  const params = new URLSearchParams(search);
  const q = params.get("q")?.trim() ?? "";
  const age = params.get("age");
  const relationship = params.get("relationship");
  const occasion = params.get("occasion");
  const tone = params.get("tone");
  const difficulty = params.get("difficulty");
  const partial: Record<string, unknown> = {};
  if (age && VALID_AGES.has(age)) partial.age = age;
  if (relationship && VALID_RELATIONSHIPS.has(relationship)) partial.relationship = relationship;
  if (occasion && VALID_OCCASIONS.has(occasion)) partial.occasion = occasion;
  if (tone && VALID_TONES.has(tone)) partial.tone = tone;
  if (difficulty && VALID_DIFFICULTIES.has(difficulty)) partial.difficulty = difficulty;
  const criteria = partial as FinderCriteria;
  const rawPage = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  return { keyword: q, criteria, page };
}

function buildFinderUrl(keyword: string, criteria: FinderCriteria, page: number): string {
  const params = new URLSearchParams();
  if (keyword.trim()) params.set("q", keyword.trim());
  if (criteria.age) params.set("age", criteria.age);
  if (criteria.relationship) params.set("relationship", criteria.relationship);
  if (criteria.occasion) params.set("occasion", criteria.occasion);
  if (criteria.tone) params.set("tone", criteria.tone);
  if (criteria.difficulty) params.set("difficulty", criteria.difficulty);
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/find-questions?${queryString}` : "/find-questions";
}

export function FinderExperience({
  questions,
  authEnabled = false,
}: {
  readonly questions: readonly Question[];
  readonly authEnabled?: boolean;
}) {
  const approved = useMemo(() => filterFinderQuestions(questions, {}), [questions]);
  const artworks = useMemo(() => questionArtworks(approved), [approved]);
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [draft, setDraft] = useState<FinderCriteria>({});
  const [criteria, setCriteria] = useState<FinderCriteria>({});
  const [pageNumber, setPageNumber] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [reviewSelectedOnly, setReviewSelectedOnly] = useState(false);
  const browsePageBeforeReview = useRef(1);
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  function syncUrl(nextKeyword: string, nextCriteria: FinderCriteria, nextPage: number) {
    if (typeof window !== "undefined") {
      const nextUrl = buildFinderUrl(nextKeyword, nextCriteria, nextPage);
      window.history.pushState(null, "", nextUrl);
    }
  }

  useEffect(() => {
    // 1. Saved questions from localStorage (isolated)
    try {
      const rawSaved = localStorage.getItem(savedKey);
      if (rawSaved !== null) {
        const ids = parseSavedQuestionIds(rawSaved, questions);
        startTransition(() => setSaved(ids));
      }
    } catch (error: unknown) {
      startTransition(() =>
        setNotice(
          error instanceof SyntaxError ||
            (error instanceof Error && error.message.includes("Saved questions"))
            ? "Saved questions could not be read. You can save questions again."
            : "Saved questions are unavailable in this browser.",
        ),
      );
    }

    // 2. Finder session restore from sessionStorage (isolated)
    try {
      const isRestore = new URLSearchParams(window.location.search).has("restore");
      if (isRestore) {
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
          return;
        }
      }
    } catch {
      startTransition(() => setNotice("Previous search and filter session could not be restored."));
    }

    // 3. Normal URL query state restoration
    const urlState = parseUrlParams(window.location.search);
    if (urlState.keyword || Object.keys(urlState.criteria).length > 0 || urlState.page > 1) {
      startTransition(() => {
        setQuery(urlState.keyword);
        setKeyword(urlState.keyword);
        setDraft(urlState.criteria);
        setCriteria(urlState.criteria);
        setPageNumber(urlState.page);
      });
    }

    // 4. Popstate listener for browser back / forward
    const handlePopState = () => {
      const popState = parseUrlParams(window.location.search);
      startTransition(() => {
        setQuery(popState.keyword);
        setKeyword(popState.keyword);
        setDraft(popState.criteria);
        setCriteria(popState.criteria);
        setPageNumber(popState.page);
        setReviewSelectedOnly(false);
      });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [questions, approved]);

  const filtered = useMemo(
    () =>
      filterFinderQuestions(questions, {
        ...criteria,
        ...(keyword ? { searchKeyword: keyword } : {}),
      }),
    [questions, criteria, keyword],
  );

  const displayedPool = useMemo(() => {
    if (reviewSelectedOnly) {
      return approved.filter((q) => selected.includes(q.id));
    }
    return filtered;
  }, [reviewSelectedOnly, approved, selected, filtered]);

  const currentPage = questionPage(displayedPool, pageNumber);
  const pool = selected.length ? approved.filter((q) => selected.includes(q.id)) : filtered;
  const activeFilters = Boolean(keyword || Object.keys(criteria).length);
  const browseTotalPages = Math.max(1, Math.ceil(filtered.length / 10));

  function restoreBrowsePage() {
    const restoredPage = Math.min(
      Math.max(browsePageBeforeReview.current, 1),
      browseTotalPages,
    );
    setReviewSelectedOnly(false);
    setPageNumber(restoredPage);
    syncUrl(keyword, criteria, restoredPage);
  }

  function enterReview() {
    browsePageBeforeReview.current = currentPage.page;
    setReviewSelectedOnly(true);
    setPageNumber(1);
  }

  function clear() {
    setQuery("");
    setKeyword("");
    setDraft({});
    setCriteria({});
    setPageNumber(1);
    setReviewSelectedOnly(false);
    syncUrl("", {}, 1);
  }

  function toggleSelected(id: string) {
    const exitsReview = reviewSelectedOnly && selected.length === 1 && selected[0] === id;
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id],
    );
    if (exitsReview) restoreBrowsePage();
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
    setReviewSelectedOnly(false);
    let nextCriteria: FinderCriteria = {};
    let nextKeyword = "";
    if (value === "kids") {
      nextCriteria = { age: "kids" };
      setCriteria(nextCriteria);
      setDraft(nextCriteria);
      setQuery("");
      setKeyword("");
    } else if (value === "funny" || value === "deep") {
      nextCriteria = { tone: value };
      setCriteria(nextCriteria);
      setDraft(nextCriteria);
      setQuery("");
      setKeyword("");
    } else if (value === "friends") {
      nextCriteria = { relationship: "friends" };
      setCriteria(nextCriteria);
      setDraft(nextCriteria);
      setQuery("");
      setKeyword("");
    } else if (value === "classroom" || value === "party") {
      nextCriteria = { occasion: value };
      setCriteria(nextCriteria);
      setDraft(nextCriteria);
      setQuery("");
      setKeyword("");
    } else {
      nextKeyword = value;
      setCriteria({});
      setDraft({});
      setQuery(value);
      setKeyword(value);
    }
    setPageNumber(1);
    syncUrl(nextKeyword, nextCriteria, 1);
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
    syncUrl(keyword, criteria, page);
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
            const trimmed = query.trim();
            setKeyword(trimmed);
            setPageNumber(1);
            setReviewSelectedOnly(false);
            syncUrl(trimmed, criteria, 1);
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
            setReviewSelectedOnly(false);
            syncUrl(keyword, draft, 1);
          }}
          onClear={clear}
        />
        <section className="question-panel" id="questions" aria-labelledby="questions-title">
          <div className="panel-heading">
            <div>
              <h2 id="questions-title">
                {reviewSelectedOnly
                  ? "Selected Questions"
                  : activeFilters
                    ? "Your Questions"
                    : "Browse Questions"}
                <img className="crown-art" src="/finder/assets/crown.png" alt="" />
              </h2>
              <p aria-live="polite">
                {reviewSelectedOnly
                  ? `${selected.length} questions selected across pages — manage or unselect below.`
                  : activeFilters
                    ? `${filtered.length} matching questions`
                    : `${approved.length} curated questions — browse before choosing filters.`}
              </p>
            </div>
            <div className="view-actions">
              {reviewSelectedOnly ? (
                <button
                  type="button"
                  className="black"
                  onClick={restoreBrowsePage}
                >
                  <FinderIcon name="list" size={15} />
                  Exit review
                </button>
              ) : (
                <a className="black" href="#questions">
                  <FinderIcon name="list" size={15} />
                  Browse list
                </a>
              )}
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
                artwork={artworks.get(question.id)!}
                number={(currentPage.page - 1) * 10 + i + 1}
                selected={selected.includes(question.id)}
                saved={saved.includes(question.id)}
                onSelect={() => toggleSelected(question.id)}
                onSave={() => toggleSaved(question.id)}
                revision={0}
              />
            ))}
            {!displayedPool.length && (
              <div className="empty-state">
                <h3>{reviewSelectedOnly ? "No questions selected" : "No questions found"}</h3>
                <p>
                  {reviewSelectedOnly
                    ? "You haven't selected any questions yet."
                    : "Try another keyword or clear your filters."}
                </p>
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
          {selected.length > 0 && (
            <>
              <button
                type="button"
                className="review-selected-btn"
                onClick={() => {
                  if (reviewSelectedOnly) restoreBrowsePage();
                  else enterReview();
                }}
              >
                <FinderIcon name={reviewSelectedOnly ? "list" : "bookmark"} size={15} />
                {reviewSelectedOnly ? "Back to browsing" : "Review selected"}
              </button>
              <button
                type="button"
                className="clear-selected-btn"
                onClick={() => {
                  setSelected([]);
                  if (reviewSelectedOnly) restoreBrowsePage();
                }}
              >
                Clear selected
              </button>
            </>
          )}
          <button className="black" onClick={() => openPlayer()} disabled={!pool.length}>
            Play these questions <FinderIcon name="play" size={15} />
          </button>
          <button onClick={() => openPlayer(true)} disabled={!pool.length}>
            <FinderIcon name="screen" />
            Present
          </button>
          <button onClick={() => openPlayer(false, true)} disabled={!pool.length}>
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
