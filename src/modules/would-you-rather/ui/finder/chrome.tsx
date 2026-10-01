/* eslint-disable @next/next/no-img-element -- Original brand and decorative screenshot crops. */
import Link from "next/link";
import { FinderIcon } from "./icon";
export function FinderHeader({
  authEnabled,
  onSearch,
  onPlay,
}: {
  readonly authEnabled: boolean;
  readonly onSearch: () => void;
  readonly onPlay: () => void;
}) {
  return (
    <header className="site-header">
      <Link href="/" aria-label="WYRPLAY home">
        <img className="logo" src="/finder/assets/logo.png" alt="WYRPLAY" />
      </Link>
      <nav aria-label="Find Questions navigation">
        <Link href="/">Home</Link>
        <Link className="active" href="/find-questions" aria-current="page">
          Find Questions
        </Link>
        <a href="#questions">Browse</a>
        <a href="#category-links">Categories</a>
        <a href="#finder-about">About</a>
      </nav>
      <button className="nav-search icon-button" aria-label="Focus search" onClick={onSearch}>
        <FinderIcon name="search" />
      </button>
      <details className="finder-menu">
        <summary aria-label="Open Find Questions menu">Menu</summary>
        <nav aria-label="Mobile Find Questions navigation">
          <Link href="/">Home</Link>
          <a href="#questions">Browse questions</a>
          <a href="#category-links">Categories</a>
          <a href="#finder-about">About</a>
          {authEnabled ? <Link href="/sign-in">Log in</Link> : null}
        </nav>
      </details>
      {authEnabled ? (
        <>
          <Link className="login" href="/sign-in">
            Log in
          </Link>
          <Link className="signup black" href="/sign-up">
            Sign up
          </Link>
        </>
      ) : (
        <button className="signup black" onClick={onPlay}>
          Play now
        </button>
      )}
    </header>
  );
}
export function FinderDecoration() {
  const art = [
    ["search-left", "search-left-art"],
    ["search-right", "search-right-art"],
    ["selection-left", "selection-left-art"],
    ["bottom-band", "bottom-band-art"],
    ["left-top", "left-top-art"],
    ["left-edge", "left-edge-art"],
    ["right-edge", "right-edge-art"],
    ["left-bottom", "left-bottom-art"],
    ["bottom-left", "bottom-left-art"],
    ["bottom-right", "bottom-right-art"],
  ];
  return (
    <div className="page-art" aria-hidden="true">
      {art.map(([file, className]) => (
        <img key={file} className={className} src={`/finder/assets/${file}.png`} alt="" />
      ))}
    </div>
  );
}
export function FinderHero() {
  return (
    <section className="hero" aria-labelledby="finder-title">
      <div className="hero-copy">
        <h1 id="finder-title">
          <span className="find-word">Find</span>{" "}
          <span className="rather-line">
            Would You{" "}
            <span className="rather">
              <i>Ra</i>ther
            </span>
          </span>
          <span className="questions-word"> Questions</span>
        </h1>
        <p>Browse first. Filter only when you need to narrow the pool.</p>
      </div>
      <span className="spark spark-one" aria-hidden="true">
        ✦
      </span>
      <span className="spark spark-two" aria-hidden="true">
        ✦
      </span>
      <span className="spark spark-three" aria-hidden="true">
        ✦
      </span>
      <img
        className="hero-character"
        src="/finder/assets/hero-character.png"
        alt="A curious cartoon explorer looking through a magnifying glass"
      />
    </section>
  );
}
export function FinderCategories() {
  return (
    <section
      id="category-links"
      className="finder-categories"
      aria-labelledby="category-links-title"
    >
      <h2 id="category-links-title">Browse by category</h2>
      <div>
        {[
          ["Kids", "/would-you-rather-questions-for-kids"],
          ["Funny", "/funny-would-you-rather-questions"],
          ["Hard", "/hard-would-you-rather-questions"],
          ["Friends", "/would-you-rather-questions-for-friends"],
          ["Couples", "/would-you-rather-questions-for-couples"],
        ].map(([label, href]) => (
          <Link href={href!} key={href}>
            {label} questions <FinderIcon name="arrow" size={14} />
          </Link>
        ))}
      </div>
    </section>
  );
}
