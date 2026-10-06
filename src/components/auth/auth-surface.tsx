import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "./auth-icons";
import "./auth-surface.css";

type AuthMode = "login" | "signup" | "confirm";

export function AuthSurface({ mode, children }: Readonly<{ mode: AuthMode; children: ReactNode }>) {
  const signup = mode === "signup";
  const confirmation = mode === "confirm";
  return (
    <main className={`auth-page ${mode}`}>
      <header className="auth-header">
        <Link className="auth-logo" href="/" aria-label="WYRPlay home">
          <Image src="/brand/logo.svg" alt="" width={48} height={48} />
          <span>
            WYR<span>Play</span>
          </span>
        </Link>
        <nav aria-label="Account navigation">
          <span>
            {signup
              ? "Already have an account?"
              : confirmation
                ? "Need a new link?"
                : "New to WYRPlay?"}
          </span>
          <Link href={signup || confirmation ? "/sign-in" : "/sign-up"}>
            {signup || confirmation ? "Log in" : "Sign up"} <Arrow />
          </Link>
        </nav>
      </header>
      <div className="auth-layout">
        <section className="auth-hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              {signup ? (
                <>
                  <span>Join</span>
                  <span className="hero-accent">
                    WYRPlay<span>!</span>
                  </span>
                </>
              ) : confirmation ? (
                <>
                  <span>One last</span>
                  <span className="hero-accent">
                    step<span>!</span>
                  </span>
                </>
              ) : (
                <>
                  <span>Welcome</span>
                  <span className="hero-accent">
                    Back<span>!</span>
                  </span>
                </>
              )}
            </h1>
            {!signup && (
              <p className="hero-greeting">
                {confirmation ? "A little check. A secure sign in." : "Good to see you again!"}
              </p>
            )}
            <p className="hero-description">
              {signup
                ? "Save your favorite questions, join discussions and play with friends around the world."
                : confirmation
                  ? "Your next great conversation is just around the corner."
                  : "Sign in to keep playing, discovering and sharing great Would You Rather questions."}
            </p>
          </div>
          <Image
            className="hero-art"
            src={`/brand/auth/${signup ? "signup" : "login"}-hero.webp`}
            alt=""
            width={1106}
            height={1422}
            priority
            sizes="(max-width: 767px) 180px, (max-height: 850px) 290px, 360px"
          />
        </section>
        <section className="auth-card" aria-labelledby="auth-title">
          {confirmation && <p className="security-eyebrow">Security confirmation</p>}
          <h2 id="auth-title">
            {signup ? "Create Your Account" : confirmation ? "Confirm sign in" : "Sign In"}
          </h2>
          <p className="card-subtitle">
            {signup
              ? "Get started in seconds. It’s free!"
              : confirmation
                ? "You’re in control of this sign in."
                : "Choose how you’d like to continue."}
          </p>
          {children}
          {signup && (
            <div className="join-benefits">
              <h3>Why join WYRPlay?</h3>
              <ul className="benefits">
                <li>
                  <span aria-hidden="true">♥</span>Save your favorite questions
                </li>
                <li>
                  <span aria-hidden="true">✦</span>Join fun discussions
                </li>
                <li>
                  <span aria-hidden="true">↗</span>Play with friends anywhere
                </li>
              </ul>
            </div>
          )}
          {!confirmation && (
            <p className="signup-prompt">
              {signup ? "Already have an account?" : "Don’t have an account?"}{" "}
              <Link href={signup ? "/sign-in" : "/sign-up"}>
                {signup ? "Log in" : "Sign up"} <Arrow />
              </Link>
            </p>
          )}
          {signup && (
            <p className="auth-terms">
              By continuing, you agree to our <Link href="/terms">Terms</Link> and acknowledge our{" "}
              <Link href="/privacy">Privacy Notice</Link>.
            </p>
          )}
        </section>
      </div>
      <div className="auth-clouds" aria-hidden="true" />
    </main>
  );
}
