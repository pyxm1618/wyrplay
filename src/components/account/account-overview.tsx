"use client";
/* eslint-disable @next/next/no-img-element -- User avatar URLs and reused screenshot artwork. */
import Link from "next/link";
import { useRef, useState } from "react";
import {
  DuelArena,
  type Question,
  type LeaderboardResult,
  useSavedQuestions,
} from "@/modules/would-you-rather";
import { AccountNavigation } from "./account-navigation";
import { AccountIcon } from "./account-icons";
import "./account-overview.css";
import "./account-panels.css";
import "./account-system.css";
import { AccountChrome, type AccountProfile } from "./account-chrome";
import { SavedLibrary, MyQuestionsPanel } from "./account-panels";

type Tab = "Overview" | "Saved Questions" | "My Questions" | "Recent Activity";
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
  const tab = initialTab;
  const setTab = (next: Tab) => {
    window.location.assign(
      next === "Overview"
        ? "/account"
        : `/account?view=${next === "Saved Questions" ? "saved" : next === "My Questions" ? "my" : "activity"}`,
    );
  };
  const { savedIds, notice, removeSaved } = useSavedQuestions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const saved = questions.filter((question) => savedIds?.includes(question.id));
  const shownSaved = tab === "Overview" ? saved.slice(0, 3) : saved;
  const current = saved.find((question) => question.id === selectedId);
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
          <AccountNavigation commerceEnabled={commerceEnabled} />
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
                    <img className="account-travel" src="/account-art/travel-sign-v2.webp" alt="" />
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
                        <p>Saved to your account, ready on any device.</p>
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
                          {notice && savedIds === null
                            ? "Saved questions unavailable"
                            : savedIds === null
                              ? "Loading saved questions…"
                              : "Your favorites start here"}
                        </h3>
                        <p>
                          {notice && savedIds === null
                            ? "Reload to retry loading your account favorites."
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
              </div>
            </div>
          )}
          <section className="account-explore">
            <img src="/account-art/bulb-v2.webp" width="105" height="120" alt="" />
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
            categoryBadge="Account favorites"
            onNext={() => nextQuestion(false)}
            onRandom={() => nextQuestion(true)}
          />
        )}
      </dialog>
    </div>
  );
}
