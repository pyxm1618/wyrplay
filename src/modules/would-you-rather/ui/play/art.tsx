/* eslint-disable @next/next/no-img-element -- Reused local brand artwork. */
import Link from "next/link";
import { FinderIcon } from "../finder/icon";
export function PlayArtwork() {
  return (
    <div className="play-art" aria-hidden="true">
      <i className="blob yellow" />
      <i className="blob blue" />
      <i className="blob pink" />
      <i className="blob blue-bottom" />
      <i className="blob yellow-bottom" />
      <img className="art-star" src="/play-art/star.png" alt="" />
      <img className="art-question" src="/play-art/question.png" alt="" />
    </div>
  );
}
export function PlayHeader({
  authEnabled = false,
  onPresent,
}: {
  readonly authEnabled?: boolean;
  readonly onPresent?: () => void;
}) {
  return (
    <header className="play-header">
      <Link href="/" aria-label="WYRPLAY home">
        <img src="/play-art/logo.png" alt="WYRPLAY" />
      </Link>
      <nav aria-label="Play navigation">
        <Link href="/">Home</Link>
        <Link href="/find-questions">Questions</Link>
        <Link href="/find-questions#category-links">Categories</Link>
        <Link href="/leaderboards">Leaderboards</Link>
        <Link href="/create">Create</Link>
      </nav>
      <Link href="/find-questions#search" aria-label="Search questions">
        <FinderIcon name="search" size={28} />
      </Link>
      {onPresent && (
        <button onClick={onPresent}>
          <FinderIcon name="screen" size={25} /> Present
        </button>
      )}
      <details className="play-menu">
        <summary aria-label="More actions">•••</summary>
        <Link href="/find-questions">Browse questions</Link>
        <Link href="/print">Print questions</Link>
      </details>
      {authEnabled && (
        <Link className="dark-pill" href="/sign-in">
          Sign in
        </Link>
      )}
    </header>
  );
}
export function PlayHeading({ question }: { readonly question: string }) {
  return (
    <div className="play-heading">
      <img className="heading-crown" src="/finder/assets/crown.png" alt="" />
      <h1>
        Would You{" "}
        <span className="word-rather">
          <i>Rath</i>er?
        </span>
      </h1>
      <p>{question}</p>
    </div>
  );
}
export function OptionPanels({
  a,
  b,
  childrenA,
  childrenB,
}: {
  readonly a: string;
  readonly b: string;
  readonly childrenA?: React.ReactNode;
  readonly childrenB?: React.ReactNode;
}) {
  return (
    <div className="play-options">
      <section className="option-panel option-a">
        <img className="option-symbol" src="/play-art/clock.png" alt="" />
        <h2>{a}</h2>
        {childrenA}
      </section>
      <span className="or-disc" aria-hidden="true">
        OR
      </span>
      <section className="option-panel option-b">
        <img className="option-symbol" src="/play-art/rocket.png" alt="" />
        <h2>{b}</h2>
        {childrenB}
      </section>
    </div>
  );
}
