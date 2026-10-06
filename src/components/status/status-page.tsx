"use client";

import Image from "next/image";
import Link from "next/link";
import "./status-page.css";

type StatusKind = "404" | "error" | "loading";

function StatusIcon({ kind }: { kind: "home" | "retry" | "search" | "arrow" }) {
  const paths = {
    home: "M3 11 12 3l9 8v10h-6v-7H9v7H3Z",
    retry: "M20 7v5h-5M20 12a8 8 0 1 0-2 6M20 7l-3-3",
    search: "M21 21l-6-6M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    arrow: "M4 12h16m-6-6 6 6-6 6",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={kind === "home" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[kind]} />
    </svg>
  );
}

function StatusArtwork({ kind }: { kind: StatusKind }) {
  return (
    <div className="status-artwork" aria-hidden="true">
      {kind === "404" ? (
        <Image
          className="status-404-hero"
          src="/status-art/404-hero.webp"
          alt=""
          width={1215}
          height={455}
          priority
          unoptimized
        />
      ) : (
        <Image
          className="status-hero"
          src={`/status-art/${kind}-hero-v2.webp`}
          alt=""
          width={kind === "error" ? 810 : 745}
          height={kind === "error" ? 368 : 278}
          priority
          unoptimized
        />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="status-skeleton" aria-hidden="true">
      <div className="status-skeleton-heading" />
      <div className="status-skeleton-subheading" />
      <div className="status-skeleton-options">
        <div className="status-skeleton-card">
          <i />
          <div>
            <b />
            <b />
          </div>
        </div>
        <span>OR</span>
        <div className="status-skeleton-card">
          <i />
          <div>
            <b />
            <b />
          </div>
        </div>
      </div>
      <div className="status-skeleton-button" />
      <div className="status-skeleton-dots">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export function StatusPage({ kind, reset }: { kind: StatusKind; reset?: () => void }) {
  const loading = kind === "loading";
  return (
    <main
      className={`status-page status-page--${kind}`}
      aria-label={loading ? "Loading page" : kind === "404" ? "Page not found" : "Page error"}
    >
      <div className="status-edge status-edge--left" aria-hidden="true" />
      <div className="status-edge status-edge--right" aria-hidden="true" />
      {kind === "404" && (
        <>
          <div className="status-bottom status-bottom--left" aria-hidden="true" />
          <div className="status-bottom status-bottom--right" aria-hidden="true" />
        </>
      )}
      <StatusArtwork kind={kind} />
      <div
        className="status-content"
        role={loading ? "status" : undefined}
        aria-live={loading ? "polite" : undefined}
      >
        <h1>
          {loading ? (
            "Loading..."
          ) : (
            <>
              <span className="status-oops">Oops!</span>
              <span className="status-headline">
                {kind === "404" ? (
                  <>
                    This page <em>doesn’t exist.</em>
                  </>
                ) : (
                  <>
                    Something <em>went wrong.</em>
                  </>
                )}
              </span>
            </>
          )}
        </h1>
        <p>
          {loading ? (
            "Getting things ready for you."
          ) : kind === "404" ? (
            <>
              The page you’re looking for may have moved,
              <br />
              been removed, or never existed.
            </>
          ) : (
            "We couldn’t load this page right now. Please try again."
          )}
        </p>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="status-actions">
            {kind === "error" ? (
              <button className="status-button status-button--primary" onClick={reset}>
                <StatusIcon kind="retry" />
                Try Again
              </button>
            ) : (
              <Link className="status-button status-button--primary" href="/">
                <StatusIcon kind="home" />
                Back to Home
                <StatusIcon kind="arrow" />
              </Link>
            )}
            <Link className="status-button" href={kind === "404" ? "/find-questions" : "/"}>
              <StatusIcon kind={kind === "404" ? "search" : "home"} />
              {kind === "404" ? "Browse Questions" : "Back to Home"}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <StatusPage kind="error" reset={reset} />;
}
export function NotFoundPage() {
  return <StatusPage kind="404" />;
}
export function LoadingPage() {
  return <StatusPage kind="loading" />;
}
