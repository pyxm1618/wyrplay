/* eslint-disable @next/next/no-img-element -- Tiny decorative screenshot crops stay native where optimization has no material benefit. */
import Image from "next/image";
import Link from "next/link";
import { FinderIcon } from "./icon";
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
  ] as const;
  const desktopCssArt = new Set(["search-left", "search-right"]);
  const lazyArt = new Set([
    "selection-left",
    "bottom-band",
    "left-bottom",
    "bottom-left",
    "bottom-right",
  ]);

  return (
    <div className="page-art" aria-hidden="true">
      {art.map(([file, className]) =>
        desktopCssArt.has(file) ? (
          <span key={file} className={className} />
        ) : (
          <img
            key={file}
            className={className}
            src={`/finder/assets/${file}.png`}
            alt=""
            loading={lazyArt.has(file) ? "lazy" : undefined}
            decoding="async"
          />
        ),
      )}
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
      <Image
        className="hero-character"
        src="/finder/assets/hero-character.png"
        alt="A curious cartoon explorer looking through a magnifying glass"
        width={332}
        height={213}
        sizes="(max-width: 700px) 160px, (max-width: 1099px) 240px, 332px"
        loading="eager"
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
