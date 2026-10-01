"use client";
/* The illustrations are intentionally unoptimized reference crops for a static design preview. */
/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import { useRef, useState } from "react";

type AuthMode = "login" | "signup";
type DemoDialog = "google" | "magic" | "search" | "navigation";
function Arrow() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M4 14h19M15 6l8 8-8 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Search() {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.4" />
      <path d="m18 18 7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function Mail() {
  return (
    <svg viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="40" height="29" rx="3" stroke="currentColor" strokeWidth="3.5" />
      <path d="m5 7 19 15L43 7" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  );
}
function Google() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M43.61 24.46c0-1.36-.12-2.66-.35-3.92H24v7.42h11a9.4 9.4 0 0 1-4.08 6.18v5.14h6.6c3.86-3.55 6.09-8.78 6.09-14.82Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.12-1.82 13.5-4.92l-6.59-5.14c-1.83 1.23-4.18 1.97-6.91 1.97-5.3 0-9.8-3.58-11.41-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.59 27.51a12 12 0 0 1 0-7.02v-5.3H5.8a20 20 0 0 0 0 17.62l6.79-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12.09c3 0 5.67 1.03 7.79 3.04l5.85-5.85C34.11 5.99 29.5 4 24 4a20 20 0 0 0-18.2 11.19l6.79 5.3c1.61-4.82 6.11-8.4 11.41-8.4Z"
      />
    </svg>
  );
}
function Crown() {
  return (
    <svg className="crown" viewBox="0 0 110 115" fill="none" aria-hidden="true">
      <path
        d="m14 99-7-64 27 29 19-57 23 55 29-40-9 72-82 5Z"
        stroke="#ffbd00"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <circle cx="53" cy="2" r="7" fill="#ffbd00" />
      <circle cx="7" cy="21" r="6" fill="#ffbd00" />
    </svg>
  );
}
export function AuthPage({ mode }: { mode: AuthMode }) {
  const signup = mode === "signup";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dialog, setDialog] = useState<DemoDialog>("google");
  const [navigation, setNavigation] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  function openDialog(next: DemoDialog, label = "") {
    setDialog(next);
    setNavigation(label);
    setNotice("");
    dialogRef.current?.showModal();
  }
  const questions = [
    "Would you rather fly or be invisible?",
    "Would you rather explore space or the ocean?",
    "Would you rather eat pizza or tacos?",
  ];
  return (
    <main className={`auth-page ${mode}`} data-project="wyrplay-auth-reconstruction">
      <div className="artwork" aria-hidden="true">
        <img
          className="top-left-cloud"
          src={`/assets/${mode}-top-left-cloud-${signup ? "v4" : "v2"}.png`}
          alt=""
        />
        <img className="hero-art" src={`/assets/${mode}-hero-art-v4.png`} alt="" />
        <img className="left-clouds" src={`/assets/${mode}-left-clouds-v3.png`} alt="" />
        <img className="right-clouds" src={`/assets/${mode}-right-clouds-v3.png`} alt="" />
        <img className="bottom-clouds" src={`/assets/${mode}-bottom-clouds-v3.png`} alt="" />
        <div className="speech">
          <span>
            {signup ? (
              <>
                Great
                <br />
                questions
                <br />
                brighter
                <br />
                conversations!
              </>
            ) : (
              <>
                Same
                <br />
                questions.
                <br />
                Different
                <br />
                minds!
              </>
            )}
            <b>♥</b>
          </span>
        </div>
        <img className="mid-left-cloud" src={`/assets/${mode}-mid-left-cloud-v2.png`} alt="" />
        <img className="pre-card-clouds" src={`/assets/${mode}-pre-card-clouds.png`} alt="" />
        <Crown />
        <i className="confetti blue plus" />
        <i className="confetti yellow dash one" />
        <i className="confetti yellow dash two" />
        <i className="confetti yellow dash three" />
        {signup && (
          <>
            <i className="confetti orange dash four" />
            <i className="confetti orange dash five" />
          </>
        )}
      </div>
      <header className="site-header">
        <a className="logo" href="/" aria-label="WYRPLAY sign in">
          <img src={`/assets/${mode}-logo-v4.png`} alt="WYRPLAY" />
        </a>
        <nav aria-label="Main navigation">
          {["Home", "Questions", "Categories", "Leaderboards", "Create"].map((label) => (
            <button
              key={label}
              className={signup && label === "Home" ? "active" : ""}
              onClick={() => openDialog("navigation", label)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          className="search-button"
          aria-label="Search questions"
          onClick={() => openDialog("search")}
        >
          <Search />
        </button>
        <a className={`nav-login ${!signup ? "current" : ""}`} href="/">
          Log in
        </a>
        <a className="nav-signup" href="/sign-up/">
          Sign up
        </a>
      </header>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            {signup ? (
              <>
                <span className="join-word">Join</span>
                <span className="wyr-word">
                  <i>W</i>
                  <i>Y</i>
                  <i>R</i>
                  <i>P</i>
                  <i>L</i>
                  <i>A</i>
                  <i>Y</i>
                  <i>!</i>
                </span>
              </>
            ) : (
              <>
                <span className="welcome-word">Welcome</span>
                <span className="back-word">
                  Back<span>!</span>
                </span>
              </>
            )}
          </h1>
          {!signup && <h3>Good to see you again!</h3>}
          <p>
            {signup ? (
              <>
                Create an account to save your favorites,
                <br />
                join discussions and play with friends
                <br />
                around the world!
              </>
            ) : (
              <>
                Sign in to keep playing, discovering
                <br />
                and sharing great Would You Rather questions.
              </>
            )}
          </p>
        </div>
      </section>
      <section className="auth-card" aria-labelledby="auth-title">
        <h2 id="auth-title">{signup ? "Create Your Account" : "Sign In"}</h2>
        <p className="card-subtitle">
          {signup ? "Get started in seconds. It’s free!" : "Choose how you’d like to continue."}
        </p>
        <div className="auth-actions">
          <button className="auth-button google-button" onClick={() => openDialog("google")}>
            <Google />
            <span>Continue with Google</span>
            <Arrow />
          </button>
          <button className="auth-button magic-button" onClick={() => openDialog("magic")}>
            <Mail />
            <span>Continue with Magic Link</span>
            <Arrow />
          </button>
        </div>
        <div className="divider">
          <span />
          or
          <span />
        </div>
        <ul className="benefits">
          {[
            ["favorite", "Save your", "favorite questions"],
            ["discussion", "Join fun", "discussions"],
            ["world", "Play with friends", "anywhere"],
          ].map(([asset, first, second]) => (
            <li key={asset}>
              <img src={`/assets/${mode}-${asset}.png`} alt="" />
              <p>
                {first}
                <br />
                {second}
              </p>
            </li>
          ))}
        </ul>
        {!signup && (
          <p className="signup-prompt">
            Don’t have an account?{" "}
            <a href="/sign-up/">
              Sign up <Arrow />
            </a>
          </p>
        )}
      </section>
      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        aria-labelledby="dialog-title"
      >
        <button
          className="close-dialog"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
        <span className="demo-label">FRONTEND PREVIEW</span>
        <h2 id="dialog-title">
          {dialog === "google"
            ? "Continue with Google"
            : dialog === "magic"
              ? "Continue with Magic Link"
              : dialog === "search"
                ? "Search questions"
                : navigation}
        </h2>
        {dialog === "google" && (
          <p>This preview isn’t connected to Google. No sign-in or account creation takes place.</p>
        )}
        {dialog === "navigation" && (
          <p>
            This standalone preview includes the registration and sign-in pages. The{" "}
            {navigation.toLowerCase()} section isn’t included.
          </p>
        )}
        {dialog === "magic" && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setNotice("Preview only — no email was sent and no account was created.");
            }}
          >
            <p>Preview the email form. This demo does not send email.</p>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button className="demo-submit" type="submit">
              Preview Magic Link
            </button>
            <p role="status">{notice}</p>
          </form>
        )}
        {dialog === "search" && (
          <>
            <label htmlFor="search">Search demo questions</label>
            <input
              id="search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try pizza or space"
            />
            <ul className="search-results">
              {questions
                .filter((question) => question.toLowerCase().includes(query.toLowerCase()))
                .map((question) => (
                  <li key={question}>{question}</li>
                ))}
            </ul>
            {!questions.some((question) =>
              question.toLowerCase().includes(query.toLowerCase()),
            ) && <p>No matching demo questions.</p>}
          </>
        )}
      </dialog>
    </main>
  );
}
