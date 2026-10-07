/* eslint-disable @next/next/no-img-element -- Pre-sized static WebP avoids runtime re-encoding; explicit dimensions and srcset reserve layout and serve the appropriate resolution. */
import { useId, type ReactNode } from "react";

import { kidsAssets, kidsHeroSrcSet, kidsRetinaAssets } from "./assets.generated";

export function KidsArt({ name, className = "" }: { name: string; className?: string }) {
  const asset = kidsAssets[name];
  if (!asset) throw new Error(`Unknown Kids illustration: ${name}`);
  const { src, width, height } = asset;
  const retinaSrc = kidsRetinaAssets[name];
  return (
    <img
      src={src}
      srcSet={
        name === "hero" ? kidsHeroSrcSet : retinaSrc ? `${src} 1x, ${retinaSrc} 2x` : undefined
      }
      sizes={
        name === "hero"
          ? "(max-width: 480px) calc(100vw - 28px), (max-width: 900px) 460px, (max-width: 1150px) calc((100vw - 72px) / 2.05), 540px"
          : undefined
      }
      width={width}
      height={height}
      loading={name === "hero" ? "eager" : "lazy"}
      fetchPriority={name === "hero" ? "high" : "auto"}
      decoding="async"
      className={`kids-art ${className}`}
      alt=""
    />
  );
}

/** A small reusable set of clean vector scenes for topic cards, not question answers. */
export function KidsMotif({
  theme = "imagination",
}: {
  theme?: "home" | "outdoors" | "imagination" | "discovery" | "games";
}) {
  return (
    <svg className="kids-motif" viewBox="0 0 160 88" aria-hidden="true">
      <ellipse cx="80" cy="78" rx="64" ry="5" fill="#e4eef4" />
      <g stroke="#ffbd12" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M12 23v8m-4-4h8M144 53v8m-4-4h8M77 8v6m-3-3h6" />
      </g>
      {theme === "home" ? (
        <>
          <path d="M34 72V36" stroke="#a96727" strokeWidth="12" />
          <path d="M14 23q-4-17 17-16 18-8 28 10 17 16-7 27H24Q3 39 14 23" fill="#73cd69" />
          <path d="M20 30h32v29H20z" fill="#ffbd55" stroke="#b87525" strokeWidth="2" />
          <path d="m16 31 20-17 20 17" fill="#e36836" />
          <path d="M29 39h13v13H29z" fill="#a6ebff" />
          <path d="M100 76V33h13V16h14v17h13v43z" fill="#bcabed" stroke="#8262c2" strokeWidth="2" />
          <path d="M92 76V36h13v40m26 0V36h15v40" fill="#d5c3ff" stroke="#8262c2" strokeWidth="2" />
          <path d="m90 36 9-15 9 15m24 0 8-15 8 15m-38-20 10-15 10 15" fill="#f47e65" />
          <path d="M112 76V62q8-14 16 0v14" fill="#79549a" />
        </>
      ) : theme === "outdoors" ? (
        <>
          <path d="M6 66q23-15 61 0v13H6z" fill="#36caf0" />
          <path d="M6 71q25-5 61 2v6H6z" fill="#ffda74" />
          <path d="m30 70 4-32" stroke="#b77a37" strokeWidth="5" />
          <path
            d="M34 39Q9 23 11 42q16-3 23-3Q27 12 44 18q-8 11-10 21Q58 18 61 36q-15-1-27 3"
            fill="#52be62"
          />
          <circle cx="61" cy="18" r="9" fill="#ffce32" />
          <path d="m85 76 28-58 38 58z" fill="#4ba0c6" />
          <path d="m112 76 27-40 18 40z" fill="#71c6df" />
          <path d="m105 34 8-16 12 18-9-5-5 7z" fill="#edfaff" />
          <path d="M83 77q30-18 71 0" fill="#77c86a" />
        </>
      ) : theme === "games" ? (
        <>
          <path
            d="M17 38q7-16 25-7h15q20-8 25 11l5 24q-2 17-14 5L61 60H40L26 74q-15 9-13-7z"
            fill="#794ed5"
            stroke="#513196"
            strokeWidth="3"
          />
          <path d="M32 41v17m-8-8h17" stroke="#37e4ec" strokeWidth="6" strokeLinecap="round" />
          <circle cx="65" cy="45" r="4" fill="#ffdd30" />
          <circle cx="73" cy="54" r="4" fill="#ff758b" />
          <path
            d="M99 25q16-4 24 3 9-7 25-3v46q-16-3-25 3-9-6-24-3z"
            fill="#fff1cc"
            stroke="#dc9462"
            strokeWidth="3"
          />
          <path
            d="M123 28v45m-17-35h10m-10 8h10m14-8h11m-11 8h11"
            stroke="#c18d66"
            strokeWidth="2"
          />
        </>
      ) : theme === "discovery" ? (
        <>
          <circle cx="37" cy="45" r="24" fill="#51cce7" />
          <path d="m14 47 44-11m-39 23 43-11" stroke="#fcdb67" strokeWidth="9" />
          <ellipse
            cx="37"
            cy="45"
            rx="34"
            ry="9"
            transform="rotate(-25 37 45)"
            fill="none"
            stroke="#ce9bea"
            strokeWidth="4"
          />
          <path
            d="M105 67q-13-29 18-58 32 29 19 58l-18-9z"
            fill="#fff4de"
            stroke="#ec7654"
            strokeWidth="3"
          />
          <circle cx="124" cy="36" r="9" fill="#49cced" stroke="#8bc6d6" strokeWidth="3" />
          <path d="m116 65 8 17 8-17" fill="#ffbd25" />
        </>
      ) : (
        <>
          <path d="m21 69 6-39 30-9 14 43-23 12z" fill="#ff7657" />
          <path d="M29 30q17 12 28-9" stroke="#be423c" strokeWidth="3" fill="none" />
          <path d="m45 35-5 11 8 2-4 13 14-18-10-1 5-9z" fill="#ffe442" />
          <path
            d="M103 73q-28-10-13-38 16-30 45-10 25 18 10 38-7 8-20-1-8-5-9 4 2 13-13 7"
            fill="#ffd281"
            stroke="#d79a46"
            strokeWidth="2"
          />
          <circle cx="104" cy="34" r="6" fill="#ff7657" />
          <circle cx="123" cy="31" r="6" fill="#4dcee0" />
          <circle cx="134" cy="46" r="6" fill="#9b73df" />
          <path d="m107 64 27-44" stroke="#548b72" strokeWidth="5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function KidsArenaEdge({ side }: { side: "left" | "right" }) {
  return (
    <svg className={`kids-arena-edge ${side}`} viewBox="0 0 64 216" aria-hidden="true">
      <path d="m28 8 4 10 11 1-9 7 3 11-10-6-9 6 2-11-8-7 12-1z" fill="#ffd028" />
      <path
        d="M9 69q-5-12 7-15 6-15 17-5 13-4 17 8 14 4 6 14-8 5-16 0-8 7-16 0-10 4-15-2z"
        fill="#fff"
        stroke="#07111d"
        strokeWidth="2.5"
      />
      <path
        d="m34 102 3 9 10 3-10 4-3 10-4-10-9-4 9-3z"
        fill="none"
        stroke="#ff6842"
        strokeWidth="2.5"
      />
      <path d="M0 192q6-32 27-25 15-12 29 9 15 5 8 40H0" fill="#a4e7fa" />
      <path d="M0 211q15-36 32-13 23-18 32 18H0" fill="#fff0bb" />
    </svg>
  );
}

export function KidsBurst({ className = "" }: { className?: string }) {
  return (
    <svg className={`kids-burst ${className}`} viewBox="0 0 25 36" aria-hidden="true">
      <path
        d="m9 3 6 9M3 17l12 3M8 33l8-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KidsChoicePanels({
  a,
  b,
  selected,
  busy = false,
  onChoose,
  children,
}: {
  a: string;
  b: string;
  selected?: "A" | "B" | null;
  busy?: boolean;
  onChoose?: (option: "A" | "B") => void;
  children?: ReactNode;
}) {
  const gradientId = useId();
  return (
    <div className="kids-choices">
      {(["A", "B"] as const).map((option) => (
        <button
          key={option}
          type="button"
          className={`kids-choice kids-choice-${option.toLowerCase()}`}
          disabled={busy || !onChoose}
          aria-pressed={selected === option}
          aria-label={`Choose option ${option}: ${option === "A" ? a : b}`}
          onClick={() => onChoose?.(option)}
        >
          <svg
            className="kids-choice-frame"
            viewBox="0 0 290 180"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`${gradientId}-${option}`} x1="0" y1="0" x2=".65" y2="1">
                <stop stopColor={option === "A" ? "#ffe35a" : "#38e7ef"} />
                <stop offset=".55" stopColor={option === "A" ? "#ffad27" : "#00c6ee"} />
                <stop offset="1" stopColor={option === "A" ? "#ff5b22" : "#00a9f6"} />
              </linearGradient>
            </defs>
            <path
              d={
                option === "A"
                  ? "M29 7 268 1Q288 0 288 20L290 157Q292 174 274 175L19 180Q-1 180 2 160L16 24Q18 8 29 7Z"
                  : "M17 1 259 5Q277 5 280 24L293 160Q296 180 275 180L18 175Q1 175 2 155L4 18Q4 1 17 1Z"
              }
              fill={`url(#${gradientId}-${option})`}
            />
          </svg>
          <svg className="kids-choice-doodles" viewBox="0 0 290 180" aria-hidden="true">
            <g
              fill="none"
              stroke={option === "A" ? "#fff" : "#ffec30"}
              strokeWidth="2.5"
              strokeLinejoin="round"
            >
              <path d="m42 22 3 8 9 1-7 6 2 9-8-5-8 4 2-9-6-6 9-1Z" />
              <path d="m258 16 2 6 7 1-6 4 2 7-6-3-6 3 1-7-5-5 7-1Z" />
              <path d="m252 137 3 8 9 1-7 6 2 9-8-5-8 4 2-9-6-6 9-1Z" />
            </g>
            <g
              fill="none"
              stroke={option === "A" ? "#ffde21" : "#fff"}
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M235 141q11-26 26 0m-10-11q13-17 22 3M30 151l4 4m-4 0 4-4" />
            </g>
            <g stroke="#fff" strokeWidth="1.5">
              <path d="M25 114v12m-4-6h8M255 109v9m-3-4h6" />
            </g>
          </svg>
          <span className="kids-choice-text">{option === "A" ? a : b}</span>
          {selected === option && <span className="kids-choice-selected">Your choice ✓</span>}
        </button>
      ))}
      <span className="kids-or" aria-hidden="true">
        OR
      </span>
      {children}
    </div>
  );
}
