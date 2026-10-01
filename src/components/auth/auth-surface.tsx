/* eslint-disable @next/next/no-img-element -- Decorative reference crops use measured CSS containers. */
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Crown, Search } from "./auth-icons";
import "./auth-surface.css";

export function AuthSurface({
  mode,
  children,
}: Readonly<{ mode: "login" | "signup"; children: ReactNode }>) {
  const signup = mode === "signup";
  return (
    <main className={`auth-page ${mode}`}>
      <div className="artwork" aria-hidden="true">
        <img
          className="top-left-cloud"
          src={`/brand/auth/${mode}-top-left-cloud-${signup ? "v4" : "v2"}.png`}
          alt=""
        />
        <img className="hero-art" src={`/brand/auth/${mode}-hero-art-v4.png`} alt="" />
        <img className="left-clouds" src={`/brand/auth/${mode}-left-clouds-v3.png`} alt="" />
        <img className="right-clouds" src={`/brand/auth/${mode}-right-clouds-v3.png`} alt="" />
        <img className="bottom-clouds" src={`/brand/auth/${mode}-bottom-clouds-v3.png`} alt="" />
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
        <img className="mid-left-cloud" src={`/brand/auth/${mode}-mid-left-cloud-v2.png`} alt="" />
        <img className="pre-card-clouds" src={`/brand/auth/${mode}-pre-card-clouds.png`} alt="" />
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
        <Link className="logo" href="/" aria-label="WYRPLAY Home">
          <Image
            src={`/brand/auth/${mode}-logo-v4.png`}
            alt="WYRPLAY"
            width={signup ? 193 : 180}
            height={signup ? 73 : 69}
            priority
          />
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/find-questions">Questions</Link>
          <Link href="/find-questions">Categories</Link>
          <button type="button" disabled title="Leaderboards are not available yet">
            Leaderboards
          </button>
          <button type="button" disabled title="Question creation is not available yet">
            Create
          </button>
        </nav>
        <Link className="search-button" href="/find-questions" aria-label="Search questions">
          <Search />
        </Link>
        <Link
          className={`nav-login ${!signup ? "current" : ""}`}
          href="/sign-in"
          aria-current={!signup ? "page" : undefined}
        >
          Log in
        </Link>
        <Link className="nav-signup" href="/sign-up" aria-current={signup ? "page" : undefined}>
          Sign up
        </Link>
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
        {children}
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
              <img src={`/brand/auth/${mode}-${asset}.png`} alt="" />
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
            <Link href="/sign-up">
              Sign up <Arrow />
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
