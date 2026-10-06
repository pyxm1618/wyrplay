"use client";

import "@/components/status/status-page.css";

function StatusIcon({ kind }: { kind: "home" | "retry" }) {
  const path =
    kind === "home"
      ? "M3 11 12 3l9 8v10h-6v-7H9v7H3Z"
      : "M20 7v5h-5M20 12a8 8 0 1 0-2 6M20 7l-3-3";

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
      <path d={path} />
    </svg>
  );
}

export default function GlobalError() {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong | WYRPlay</title>
      </head>
      <body style={{ margin: 0, background: "#fff8ee" }}>
        <main className="status-page status-page--error" aria-label="Page error">
          <div className="status-edge status-edge--left" aria-hidden="true" />
          <div className="status-edge status-edge--right" aria-hidden="true" />

          <div className="status-artwork" aria-hidden="true">
            <img
              className="status-hero"
              src="/status-art/error-hero-v2.webp"
              alt=""
              width="810"
              height="368"
            />
          </div>

          <div className="status-content">
            <h1>
              <span className="status-oops">Oops!</span>
              <span className="status-headline">
                Something <em>went wrong.</em>
              </span>
            </h1>
            <p>We couldn’t load this page right now. Please try again.</p>

            <div className="status-actions">
              <button
                type="button"
                className="status-button status-button--primary"
                onClick={() => window.location.reload()}
              >
                <StatusIcon kind="retry" />
                Try Again
              </button>
              <a className="status-button" href="/">
                <StatusIcon kind="home" />
                Back to Home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
