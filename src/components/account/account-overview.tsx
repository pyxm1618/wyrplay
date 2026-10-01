"use client";
/* eslint-disable @next/next/no-img-element -- User avatar URLs and reused screenshot artwork. */
import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import { DuelArena, type Question, type LeaderboardResult } from "@/modules/would-you-rather";
import { AccountIcon } from "./account-icons";
import "./account-overview.css";
import "./account-panels.css";
import { AccountChrome, type AccountProfile } from "./account-chrome";
import { SavedLibrary, MyQuestionsPanel } from "./account-panels";

const savedKey = "wyrplay:saved-questions:v1";
const tabs = ["Overview", "Saved Questions", "My Questions", "Recent Activity"] as const;
type Tab = (typeof tabs)[number];
function readSavedIds(): string[] {
  const parsed: unknown = JSON.parse(localStorage.getItem(savedKey) ?? "[]");
  if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string")) {
    throw new Error("Saved questions must contain question IDs.");
  }
  return parsed;
}
function randomQuestion(questions: readonly Question[]) {
  return questions[Math.floor(Math.random() * questions.length)];
}
export function AccountOverview({
  profile,
  questions,
  commerceEnabled,
  votes,
  initialTab = "Overview",
}: {
  profile: AccountProfile;
  questions: readonly Question[];
  commerceEnabled: boolean;
  votes: LeaderboardResult;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [savedIds, setSavedIds] = useState<string[] | null>(null);
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const read = () => {
      try {
        const ids = readSavedIds();
        startTransition(() => {
          setSavedIds(ids);
          setNotice("");
        });
      } catch {
        startTransition(() => {
          setSavedIds(null);
          setNotice(
            "Saved questions could not be read in this browser. Your stored data has not been changed.",
          );
        });
      }
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
    };
  }, []);
  const saved = questions.filter((question) => savedIds?.includes(question.id));
  const shownSaved = tab === "Overview" ? saved.slice(0, 3) : saved;
  const current = saved.find((question) => question.id === selectedId);
  function removeSaved(id: string) {
    try {
      const next = readSavedIds().filter((storedId) => storedId !== id);
      localStorage.setItem(savedKey, JSON.stringify(next));
      setSavedIds(next);
      setNotice("");
    } catch {
      setNotice("This browser could not update your saved questions. Nothing was removed.");
    }
  }
  function openQuestion(id: string) {
    setSelectedId(id);
    dialog.current?.showModal();
  }
  function nextQuestion(random: boolean) {
    const alternatives = saved.filter((q) => q.id !== selectedId);
    const next = random
      ? randomQuestion(alternatives)
      : saved[(saved.findIndex((q) => q.id === selectedId) + 1) % saved.length];
    if (next) setSelectedId(next.id);
  }
  const overview = tab === "Overview";
  return (
    <div className="account-overview">
      <div className="account-cloud account-cloud-top" aria-hidden="true" />
      <div className="account-cloud account-cloud-bottom" aria-hidden="true" />
      <div className="account-page">
        <AccountChrome profile={profile} commerceEnabled={commerceEnabled} />
        <main>
          <nav className="account-tabs" aria-label="Account sections">
            {tabs.map((item) => (
              <button
                key={item}
                aria-pressed={tab === item}
                className={tab === item ? "active" : ""}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </nav>
          {tab === "Saved Questions" && (
            <SavedLibrary
              questions={saved}
              ready={savedIds !== null}
              error={notice}
              votes={votes}
              onRemove={removeSaved}
              onPlay={openQuestion}
            />
          )}
          {tab === "My Questions" && <MyQuestionsPanel />}
          {notice && (
            <p className="account-notice" role="alert">
              {notice}
            </p>
          )}
          {(overview || tab === "Recent Activity") && (
            <div className={overview ? "account-columns" : "account-tab-content"}>
              <div className="account-left">
                {overview && (
                  <section className="account-continue account-panel">
                    <div className="account-section-heading">
                      <AccountIcon name="game" />
                      <div>
                        <h2>Continue Playing</h2>
                        <p>Explore a collection and pick your next question!</p>
                      </div>
                    </div>
                    <img className="account-travel" src="/account-art/travel-sign.png" alt="" />
                    <div className="account-continue-card">
                      <div className="account-tags">
                        <span>Travel</span>
                        <span>Funny</span>
                      </div>
                      <h3>Find your next dilemma</h3>
                      <p>
                        No saved game progress is available.
                        <br />
                        Choose a collection to start a new round.
                      </p>
                      <Link className="account-dark-button" href="/find-questions">
                        Browse Questions <AccountIcon name="arrow" />
                      </Link>
                    </div>
                  </section>
                )}
                {overview && (
                  <section className="account-saved account-panel">
                    <div className="account-section-heading">
                      <AccountIcon name="heart" />
                      <div>
                        <h2>Saved Questions</h2>
                        <p>Saved on this browser, ready to play again.</p>
                      </div>
                      {overview && (
                        <button
                          className="account-text-button"
                          onClick={() => setTab("Saved Questions")}
                        >
                          View all <AccountIcon name="arrow" />
                        </button>
                      )}
                    </div>
                    <div className="account-saved-grid">
                      {shownSaved.map((question, index) => (
                        <article
                          className={`account-saved-card tone-${index % 3}`}
                          key={question.id}
                        >
                          <div className="account-card-heading">
                            <span className="account-tag">{question.topics[0] ?? "Questions"}</span>
                            <details>
                              <summary aria-label={`Options for ${question.question}`}>•••</summary>
                              <button onClick={() => removeSaved(question.id)}>
                                Remove from saved
                              </button>
                            </details>
                          </div>
                          <button
                            className="account-question-title"
                            title={question.question}
                            onClick={() => openQuestion(question.id)}
                          >
                            {question.question
                              .replace(/^would you rather\s+/i, "")
                              .replace(/^./, (letter) => letter.toUpperCase())}
                          </button>
                          <div className="account-card-bottom">
                            <span>
                              <AccountIcon name="heart" />
                              Saved
                            </span>
                            <button
                              aria-label={`Play ${question.question}`}
                              onClick={() => openQuestion(question.id)}
                            >
                              <AccountIcon name="arrow" />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                    {saved.length === 0 && (
                      <div className="account-empty">
                        <AccountIcon name="heart" />
                        <h3>
                          {notice
                            ? "Saved questions unavailable"
                            : savedIds === null
                              ? "Loading saved questions…"
                              : "Your favorites start here"}
                        </h3>
                        <p>
                          {notice
                            ? "Check your browser storage permissions and try again."
                            : "Save questions in the question finder to see them here."}
                        </p>
                        <Link href="/find-questions">
                          Find Questions <AccountIcon name="arrow" />
                        </Link>
                      </div>
                    )}
                    {savedIds && savedIds.some((id) => !questions.some((q) => q.id === id)) && (
                      <p className="account-storage-note">
                        Some stored questions are not currently available. Their saved IDs are
                        preserved.
                      </p>
                    )}
                  </section>
                )}
              </div>
              <div className="account-right">
                {(overview || tab === "Recent Activity") && (
                  <section className="account-activity account-panel">
                    <div className="account-section-heading">
                      <AccountIcon name="clock" />
                      <h2>Recent Activity</h2>
                      {overview && (
                        <button
                          className="account-text-button"
                          onClick={() => setTab("Recent Activity")}
                        >
                          See all <AccountIcon name="arrow" />
                        </button>
                      )}
                    </div>
                    <div className="account-empty">
                      <AccountIcon name="clock" />
                      <h3>Your next adventure awaits</h3>
                      <p>
                        Account activity history is not available yet. Anonymous votes are not
                        linked to your account.
                      </p>
                      <Link href="/find-questions">
                        Explore questions <AccountIcon name="arrow" />
                      </Link>
                    </div>
                  </section>
                )}
                {overview && (
                  <section className="account-create account-panel">
                    <AccountIcon name="edit" />
                    <div>
                      <h2>Create a New Question</h2>
                      <p>Question submissions are not open yet.</p>
                      <button
                        className="account-blue-button"
                        disabled
                        title="Question submissions are not available yet."
                      >
                        Create Question <AccountIcon name="arrow" />
                      </button>
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
          {overview && (
            <section className="account-mine account-panel">
              <div className="account-section-heading">
                <AccountIcon name="edit" />
                <div>
                  <h2>My Questions</h2>
                  <p>Questions you&apos;ve created or submitted.</p>
                </div>
                {overview && (
                  <button className="account-text-button" onClick={() => setTab("My Questions")}>
                    View all <AccountIcon name="arrow" />
                  </button>
                )}
              </div>
              <div className="account-empty">
                <AccountIcon name="game" />
                <h3>A place for your curious questions</h3>
                <p>
                  Creating and submitting questions is not available yet.
                  <br />
                  Published, pending and draft records will appear when submissions are supported.
                </p>
                <button className="account-blue-button" disabled>
                  Create a Question
                </button>
              </div>
            </section>
          )}
          <section className="account-explore">
            <img src="/account-art/bulb.png" width="105" height="120" alt="" />
            <div>
              <h2>Want something different?</h2>
              <p>Explore more questions or change the vibe.</p>
            </div>
            <nav aria-label="Explore collections">
              <Link href="/funny-would-you-rather-questions">😄 Funny</Link>
              <Link href="/hard-would-you-rather-questions">🧠 Hard</Link>
              <Link href="/find-questions" title="Choose the Travel filter in the question finder">
                🚀 Travel
              </Link>
              <Link href="/would-you-rather-questions-for-friends">👥 Friends</Link>
              <Link href="/find-questions">
                Browse all <AccountIcon name="arrow" />
              </Link>
            </nav>
          </section>
          <footer className="account-footer">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </footer>
        </main>
      </div>
      <dialog
        ref={dialog}
        className="account-vote-dialog"
        aria-label="Play a saved question"
        onClose={() => setSelectedId(null)}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <button
          className="account-dialog-close"
          aria-label="Close voting"
          onClick={() => dialog.current?.close()}
        >
          ×
        </button>
        {current && (
          <DuelArena
            key={current.id}
            question={current}
            currentIndex={saved.findIndex((q) => q.id === current.id)}
            totalQuestions={saved.length}
            categoryBadge="Saved on this browser"
            onNext={() => nextQuestion(false)}
            onRandom={() => nextQuestion(true)}
          />
        )}
      </dialog>
    </div>
  );
}
