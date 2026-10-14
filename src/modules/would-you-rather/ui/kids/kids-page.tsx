"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AgeGroup, Question } from "../../types";
import { getPlayableQuestionsByCollection } from "../../data/questions";
import { questionPoolUrl } from "../../domain/question-pool";
import { DuelArena } from "../duel-arena";
import { FinderIcon } from "../finder/icon";
import { KidsArt, KidsBurst, KidsChoicePanels, KidsMotif, KidsArenaEdge } from "./art";

const faq = [
  [
    "Are these Would You Rather questions for kids clean and age-appropriate?",
    "This collection is selected for wholesome, kid-friendly and school-safe play.",
  ],
  [
    "What ages are these questions for?",
    "These Would You Rather questions for kids are reviewed for ages 4–6, 7–9, and 10–12, so you can choose prompts that fit your group.",
  ],
  [
    "Can I use these Would You Rather questions for kids in a classroom?",
    "Yes. Classroom-friendly questions can be used for morning meetings, icebreakers, discussion activities, and group games.",
  ],
] as const;
function topicMotif(question: Question) {
  const topics = question.topics.join(" ");
  if (/space|travel|science|technology/.test(topics)) return "discovery";
  if (/game|entertainment|sport|school|learning/.test(topics)) return "games";
  if (/nature|animal|outdoor|adventure/.test(topics)) return "outdoors";
  return "imagination";
}

function KidsPresenter({
  questionId,
  a,
  b,
  onClose,
  onNext,
  onPrev,
  canNavigate,
}: {
  questionId?: string | undefined;
  a: string;
  b: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  canNavigate: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const focused = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      focused?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="kids-presenter"
      onCancel={onClose}
      aria-labelledby="kids-presenter-title"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" && canNavigate) {
          event.preventDefault();
          onNext();
        }
        if (event.key === "ArrowLeft" && canNavigate) {
          event.preventDefault();
          onPrev();
        }
      }}
    >
      <button className="kids-pill kids-presenter-close" onClick={onClose}>
        Close ×
      </button>
      <h2 id="kids-presenter-title">Would you rather…</h2>
      <KidsChoicePanels questionId={questionId} a={a} b={b} />
      <p>Discuss your choice. Close to vote in the arena.</p>
      <div className="kids-presenter-controls">
        <button className="kids-pill" onClick={onPrev} disabled={!canNavigate}>
          ← Previous
        </button>
        <button className="kids-pill kids-dark" onClick={onNext} disabled={!canNavigate}>
          Next question →
        </button>
      </div>
    </dialog>
  );
}

export function KidsPage({ questions }: { questions: readonly Question[] }) {
  const approved = getPlayableQuestionsByCollection("kids", questions);
  const [age, setAge] = useState<AgeGroup | undefined>();
  const [activeId, setActiveId] = useState<string>(approved[0]?.id ?? "");
  const [expanded, setExpanded] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const pool = approved.filter((q) => !age || q.ageGroups.includes(age));
  const active = (activeId ? pool.find((q) => q.id === activeId) : undefined) ?? pool[0];
  const index = active ? pool.findIndex((q) => q.id === active.id) : -1;
  const visibleQuestions = expanded ? pool : pool.slice(0, 8);
  function select(id: string) {
    setActiveId(id);
  }
  function next() {
    if (pool.length === 0) return;
    const nextIndex = index >= 0 ? (index + 1) % pool.length : 0;
    const q = pool[nextIndex];
    if (q) select(q.id);
  }
  function previous() {
    if (index > 0) {
      const q = pool[index - 1];
      if (q) select(q.id);
    }
  }
  function jumpToArena() {
    document.getElementById("play")?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    document.getElementById("play")?.focus({ preventScroll: true });
  }
  function playQuestion(id: string) {
    select(id);
    jumpToArena();
  }
  const a = active?.optionA ?? "";
  const b = active?.optionB ?? "";
  return (
    <div className="kids-page">
      <a className="kids-skip" href="#play">
        Skip to kids arena
      </a>

      <main>
        <section className="kids-hero" aria-labelledby="kids-title">
          <nav className="kids-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">⌂ &nbsp;Home</Link>
            <span>›</span>
            <span>Kids</span>
          </nav>
          <div className="kids-hero-copy">
            <div className="kids-eyebrow">
              Clean &amp; Classroom Safe
              <KidsBurst />
            </div>
            <h1 id="kids-title">
              Would You Rather
              <br />
              Questions <span className="kids-orange">for</span>{" "}
              <span className="kids-blue">Kids</span>
            </h1>
            <p>
              Fun, imaginative Would You Rather questions
              <br /> for kids, classrooms, family time, and road trips.
            </p>
            <div className="kids-hero-actions">
              <button
                className="kids-pill kids-dark"
                onClick={() => {
                  if (pool[0]) select(pool[0].id);
                  jumpToArena();
                }}
              >
                Play kids dilemmas
                <FinderIcon name="arrow" />
              </button>
              <Link className="kids-pill" href="/find-questions">
                Browse all questions
              </Link>
            </div>
          </div>
          <KidsArt name="hero" className="kids-hero-art" />
          <svg className="kids-hero-crown" viewBox="0 0 45 40" aria-hidden="true">
            <path
              d="m5 10 8 12L22 3l8 18 12-9-6 25H10Z"
              fill="none"
              stroke="#ffc20a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
        </section>
        <section id="play" tabIndex={-1} className="kids-arena" aria-labelledby="kids-arena-title">
          <KidsArenaEdge side="left" />
          <KidsArenaEdge side="right" />
          <div className="kids-arena-heading">
            <div className="kids-eyebrow">
              Would You Rather Questions for Kids
              <KidsBurst />
            </div>
            <h2 id="kids-arena-title">Play Would You Rather Questions for Kids</h2>
            <p>Pick A or B, then talk about why.</p>
          </div>
          <span className="kids-question-label">
            {active ? `Question ${index + 1} of ${pool.length}` : "No matching questions"}
          </span>
          <DuelArena
            key={active?.id ?? "empty"}
            appearance="illustrated-kids"
            question={active}
            currentIndex={index}
            totalQuestions={pool.length}
            onNext={next}
            onRandom={next}
            keyboardEnabled={!presenting}
            hasActiveFilters={Boolean(age)}
          />
          <div className="kids-arena-controls">
            <button className="kids-pill" onClick={previous} disabled={index <= 0}>
              <span className="kids-arrow-left">
                <FinderIcon name="arrow" />
              </span>
              Previous
            </button>
            <button className="kids-pill kids-dark" onClick={next} disabled={pool.length === 0}>
              Next question
              <FinderIcon name="arrow" />
            </button>
            <button className="kids-pill" onClick={() => setPresenting(true)} disabled={!a || !b}>
              <FinderIcon name="screen" />
              Present
            </button>
            <Link
              className="kids-pill"
              title={active ? "Print this reviewed question" : "Print the reviewed kids deck"}
              href={questionPoolUrl("/print", active ? [active] : pool)}
            >
              <FinderIcon name="print" />
              Print
            </Link>
          </div>
        </section>
        <section id="questions" className="kids-browse" aria-labelledby="kids-browse-title">
          <h2 id="kids-browse-title">
            <KidsBurst />
            Browse Would You Rather Questions for Kids
            <KidsBurst />
          </h2>
          <p className="kids-browse-intro">
            Browse Would You Rather questions for kids by age, then pick the prompts that fit your
            group before you play.
          </p>
          <div className="kids-age-filters" role="group" aria-label="Filter by age">
            {([undefined, "4-6", "7-9", "10-12"] as const).map((value) => (
              <button
                key={value ?? "all"}
                className={`kids-pill ${age === value ? "kids-dark" : ""}`}
                aria-pressed={age === value}
                onClick={() => {
                  setAge(value);
                }}
              >
                {value ? `Ages ${value.replace("-", "–")}` : "All"}
              </button>
            ))}
          </div>
          <div className="kids-question-grid">
            {visibleQuestions.map((q) => (
              <article className="kids-card kids-reviewed-card" key={q.id}>
                <span
                  className={`kids-age-tag ${(age ?? q.primaryAgeBand) === "10-12" ? "pink" : (age ?? q.primaryAgeBand) === "7-9" ? "orange" : "green"}`}
                >
                  {age || q.primaryAgeBand
                    ? `Ages ${(age ?? q.primaryAgeBand)!.replace("-", "–")}`
                    : "Kids"}
                </span>
                <KidsMotif theme={topicMotif(q)} />
                <h3>{q.question}</h3>
                <button className="kids-pill" onClick={() => playQuestion(q.id)}>
                  Play this question
                  <FinderIcon name="arrow" />
                </button>
              </article>
            ))}
          </div>
          {pool.length === 0 && (
            <p role="status" className="kids-empty">
              No reviewed questions match this age. Try another age group.
            </p>
          )}
          <div className="kids-browse-bottom">
            <KidsArt name="browse-star" />
            <button
              className="kids-pill"
              aria-expanded={expanded}
              aria-label={expanded ? "Show fewer questions" : "Browse more kids questions"}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded
                ? "Show fewer questions"
                : "Browse More Would You Rather Questions for Kids"}
              <FinderIcon name="arrow" />
            </button>
            <KidsArt name="browse-spark" />
          </div>
        </section>
        <section className="kids-uses" aria-labelledby="kids-uses-title">
          <KidsArt name="uses-cloud" className="kids-uses-cloud" />
          <h2 id="kids-uses-title">
            <KidsBurst />
            Ways to Use Would You Rather Questions for Kids
            <KidsBurst />
          </h2>
          <div className="kids-use-grid">
            {[
              {
                art: "classroom",
                title: "Morning classroom meetings",
                body: "Use Would You Rather questions for kids as quick classroom warmups that get everyone talking.",
              },
              {
                art: "road",
                title: "Long family road trips",
                body: "Use Would You Rather questions for kids on road trips for easy, screen-free family conversation.",
              },
              {
                art: "dinner",
                title: "Dinner table icebreakers",
                body: "Use Would You Rather questions for kids at dinner to turn short answers into family conversations.",
              },
            ].map((use) => (
              <article key={use.art}>
                <KidsArt name={`use-${use.art}`} />
                <div>
                  <h3>{use.title}</h3>
                  <p>{use.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="kids-faq" aria-labelledby="kids-faq-title">
          <h2 id="kids-faq-title">Would You Rather Questions for Kids FAQ</h2>
          <div className="kids-faq-rows">
            {faq.map(([question, answer]) => (
              <details key={question} open>
                <summary>
                  <span className="kids-faq-plus" aria-hidden="true">
                    +
                  </span>
                  {question}
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="kids-related" aria-labelledby="kids-related-title">
          <h2 id="kids-related-title">
            Explore More Question Categories
            <KidsBurst />
          </h2>
          <div className="kids-related-grid">
            {[
              {
                art: "funny",
                title: "Funny dilemmas",
                body: "Hilarious and absurd questions for all ages.",
                href: "/funny-would-you-rather-questions",
              },
              {
                art: "friends",
                title: "Friends questions",
                body: "Questions for friends, hangouts, and group game nights.",
                href: "/would-you-rather-questions-for-friends",
              },
              {
                art: "all",
                title: "All questions",
                body: "Explore the main question directory.",
                href: "/find-questions",
              },
            ].map((deck) => (
              <Link className={`kids-related-card ${deck.art}`} key={deck.art} href={deck.href}>
                <KidsArt name={`related-${deck.art}`} />
                <div>
                  <h3>{deck.title}</h3>
                  <p>{deck.body}</p>
                </div>
                <span className="kids-related-arrow">
                  <FinderIcon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="kids-closing" aria-labelledby="kids-closing-title">
          <KidsArt name="closing-left" className="kids-closing-left" />
          <KidsArt name="closing-right" className="kids-closing-right" />
          <h2 id="kids-closing-title">Start Playing Would You Rather Questions for Kids</h2>
          <p>Pick a question and start the conversation.</p>
          <button className="kids-pill" onClick={jumpToArena}>
            Jump to kids arena
            <FinderIcon name="arrow" />
          </button>
        </section>
      </main>

      {presenting && (
        <KidsPresenter
          questionId={active?.id}
          a={a}
          b={b}
          onClose={() => setPresenting(false)}
          onNext={next}
          onPrev={previous}
          canNavigate={pool.length > 0}
        />
      )}
    </div>
  );
}
