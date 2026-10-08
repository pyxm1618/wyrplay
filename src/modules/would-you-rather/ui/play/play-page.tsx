"use client";
/* eslint-disable @next/next/no-img-element -- Original local illustration. */
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import type { Question } from "../../types";
import { resolveQuestionPool, questionPoolUrl } from "../../domain/question-pool";
import { useSavedQuestions } from "../use-saved-questions";
import { DuelArena } from "../duel-arena";
import { PresenterModal, tryEnterFullscreen } from "../presenter-modal";
import { PlayArtwork } from "./art";
import { FinderIcon } from "../finder/icon";
import "./play.css";

function PlaySessionFallback() {
  return (
    <div className="play-toolbar" aria-busy="true">
      <Link href="/find-questions?restore=1">← Back to questions</Link>
      <span className="text-sm font-medium text-muted">Loading play session…</span>
    </div>
  );
}

function PlaySession({
  questions,
  authEnabled,
}: {
  readonly questions: readonly Question[];
  readonly authEnabled: boolean;
}) {
  const search = useSearchParams();
  const router = useRouter();
  const pool = resolveQuestionPool(questions, search.get("set"));
  const requested = pool.findIndex((q) => q.id === search.get("question"));
  const [index, setIndex] = useState(Math.max(0, requested));
  const [present, setPresent] = useState(search.get("present") === "1");
  const { savedIds, notice: savedNotice, toggleSaved } = useSavedQuestions(authEnabled);
  const saved = savedIds ?? [];
  const [notice, setNotice] = useState("");
  const question = pool[index];
  function move(next: number) {
    setIndex(next);
    const params = new URLSearchParams(search);
    if (pool[next]) params.set("question", pool[next].id);
    router.replace(`/play?${params}`, { scroll: false });
  }
  async function share() {
    if (!question) return;
    const url = new URL(location.href);
    url.searchParams.delete("present");
    url.searchParams.set("question", question.id);
    try {
      if (navigator.share) await navigator.share({ title: question.question, url: url.href });
      else {
        await navigator.clipboard.writeText(url.href);
        setNotice("Question link copied.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setNotice("Could not share. Copy the page address to share this question.");
    }
  }
  return (
    <>
      <div className="play-toolbar">
        <Link href="/find-questions?restore=1">← Back to questions</Link>
        <div className="topic-pills">
          {question?.topics.slice(0, 3).map((t) => (
            <span key={t}>{t.replaceAll("-", " ")}</span>
          ))}
        </div>
        <div className="question-navigation">
          <button
            aria-label="Previous question"
            disabled={index === 0}
            onClick={() => move(index - 1)}
          >
            ←
          </button>
          <b>
            {pool.length ? index + 1 : 0} / {pool.length}
          </b>
          <button
            aria-label="Next question"
            disabled={index >= pool.length - 1}
            onClick={() => move(index + 1)}
          >
            →
          </button>
        </div>
      </div>
      {!question ? (
        <section id="play" className="play-notice" role="status">
          No approved questions in this set. Return to questions to choose another set.
        </section>
      ) : (
        <DuelArena
          key={question?.id}
          appearance="illustrated-play"
          question={question}
          currentIndex={index}
          totalQuestions={pool.length}
          onNext={() => move(Math.min(index + 1, pool.length - 1))}
          onRandom={() => move(Math.floor(Math.random() * pool.length))}
        />
      )}
      {question && (
        <div className="play-actions">
          <button
            onClick={() => {
              void tryEnterFullscreen();
              setPresent(true);
            }}
          >
            <FinderIcon name="screen" size={26} /> Present
          </button>
          <button
            aria-pressed={saved.includes(question.id)}
            disabled={savedIds === null}
            onClick={() => toggleSaved(question.id)}
          >
            <FinderIcon name="heart" size={26} /> {saved.includes(question.id) ? "Saved" : "Save"}
          </button>
          <button onClick={() => void share()}>
            <FinderIcon name="share" size={26} /> Share
          </button>
          <Link href="/find-questions?restore=1">
            <FinderIcon name="list" /> Browse this set
          </Link>
          <Link href={questionPoolUrl("/print", pool)}>
            <FinderIcon name="print" /> Print
          </Link>
        </div>
      )}
      {savedNotice && (
        <p className="play-notice" role="alert">
          {savedNotice}
        </p>
      )}
      {notice && (
        <p className="play-notice" role="status">
          {notice}
        </p>
      )}
      <PresenterModal
        isOpen={present}
        question={question}
        currentIndex={index}
        totalCount={pool.length}
        onNext={() => move(Math.min(index + 1, pool.length - 1))}
        onPrev={() => move(Math.max(index - 1, 0))}
        onClose={() => setPresent(false)}
      />
    </>
  );
}

export function PlayPage({
  questions,
  authEnabled,
}: {
  readonly questions: readonly Question[];
  readonly authEnabled: boolean;
}) {
  return (
    <div className="play-page">
      <PlayArtwork />
      <Suspense fallback={<PlaySessionFallback />}>
        <PlaySession questions={questions} authEnabled={authEnabled} />
      </Suspense>
      <aside className="play-discover">
        <img src="/finder/assets/bulb.png" alt="" />
        <div>
          <h2>Want something different?</h2>
          <p>Explore more questions or change the vibe.</p>
        </div>
        <Link href="/funny-would-you-rather-questions">😄 Funny</Link>
        <Link href="/hard-would-you-rather-questions">🧠 Hard</Link>
        <Link href="/would-you-rather-questions-for-friends">👥 Friends</Link>
        <Link href="/find-questions">▦ Browse all →</Link>
      </aside>
    </div>
  );
}
