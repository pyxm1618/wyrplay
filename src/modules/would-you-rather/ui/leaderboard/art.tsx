import Image from "next/image";
import { useId } from "react";

export function LeaderboardArt({
  name,
  className = "",
  alt = "",
  width = 180,
  height = 113,
  sizes,
}: {
  name: string;
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: string;
}) {
  return (
    <Image
      src={`/leaderboard-art/${name}.${name.startsWith("medal-") ? "svg" : "png"}`}
      className={className}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      unoptimized={name.startsWith("medal-")}
    />
  );
}

/** Neutral choice illustration, not a fabricated picture of the question's subjects. */
export function ChoiceArt({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg className={className} viewBox="0 0 180 113" aria-hidden="true">
      <defs>
        <linearGradient id={id} x2="1" y2="1">
          <stop stopColor="#d4f0ff" />
          <stop offset="1" stopColor="#fff0cf" />
        </linearGradient>
      </defs>
      <rect width="180" height="113" rx="13" fill={`url(#${id})`} />
      <path
        d="M0 29q20-28 40 0t40 0M125 97q18-28 36 0t36 0"
        fill="none"
        stroke="#fff"
        strokeWidth="12"
        opacity=".75"
      />
      <g transform="rotate(-12 60 59)">
        <rect x="22" y="22" width="68" height="72" rx="22" fill="#008cff" />
        <rect x="24" y="23" width="63" height="63" rx="21" fill="#39c1ff" />
        <text
          x="56"
          y="69"
          textAnchor="middle"
          fill="white"
          fontSize="44"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          A
        </text>
      </g>
      <g transform="rotate(12 121 61)">
        <rect x="90" y="28" width="68" height="72" rx="22" fill="#ff8d08" />
        <rect x="92" y="29" width="63" height="63" rx="21" fill="#ffc631" />
        <text
          x="123"
          y="75"
          textAnchor="middle"
          fill="white"
          fontSize="44"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          B
        </text>
      </g>
      <path d="m151 10 3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z" fill="#ffb000" />
      <circle cx="15" cy="97" r="4" fill="#ff6484" />
    </svg>
  );
}
