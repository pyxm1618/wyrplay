export type IconName =
  | "crown"
  | "flame"
  | "chat"
  | "star"
  | "trophy"
  | "calendar"
  | "heart"
  | "bookmark"
  | "search"
  | "arrow"
  | "people"
  | "bars"
  | "question";
export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    crown: (
      <>
        <path d="m3 7 4 5 5-8 5 8 4-5-3 13H6Z" fill="currentColor" />
        <path d="M7 17h10" stroke="#ffe995" strokeWidth="1.5" />
        <circle cx="3" cy="5" r="1.7" fill="currentColor" />
        <circle cx="12" cy="2" r="1.7" fill="currentColor" />
        <circle cx="21" cy="5" r="1.7" fill="currentColor" />
      </>
    ),
    flame: (
      <>
        <path
          d="M12 1c3 5-1 6 3 9 1-2 2-3 2-5 7 8 5 17-5 18C2 23 0 14 6 8c0 4 2 5 3 4 3-3-1-5 3-11"
          fill="currentColor"
        />
        <path d="M12 13c-5 5-4 8 0 9 5-1 5-5 2-8l-1 3Z" fill="#ffbc21" />
      </>
    ),
    chat: (
      <>
        <path
          d="M12 2C5 2 1 6 1 12c0 3 1 5 4 7l-1 4 6-3c8 1 13-3 13-9 0-5-4-9-11-9Z"
          fill="currentColor"
        />
        <circle cx="7" cy="11" r="1" fill="white" />
        <circle cx="12" cy="11" r="1" fill="white" />
        <circle cx="17" cy="11" r="1" fill="white" />
      </>
    ),
    star: (
      <path
        d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
    trophy: (
      <>
        <path d="M7 2h10v7c0 5-3 7-5 7s-5-2-5-7Z" fill="currentColor" />
        <path
          d="M7 4H2v3c0 4 3 6 6 6M17 4h5v3c0 4-3 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M11 15h2v5h5v3H6v-3h5Z" fill="currentColor" />
        <path d="m12 5 1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L9 7.3l2-.3Z" fill="#fff1a1" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="17" rx="2" fill="currentColor" />
        <path d="M7 2v6M17 2v6" stroke="currentColor" strokeWidth="3" />
        <path d="M6 10h12v9H6Z" fill="white" />
        <path d="M8 12h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="2" />
      </>
    ),
    heart: <path d="M12 22 3 13C-4 5 6-2 12 5 18-2 28 5 21 13Z" fill="currentColor" />,
    bookmark: (
      <path
        d="M6 2h12v20l-6-4-6 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" />
      </>
    ),
    arrow: (
      <path
        d="M3 12h18m-6-6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="4" fill="currentColor" />
        <circle cx="18" cy="8" r="3" fill="currentColor" />
        <path d="M1 22v-5c0-7 16-7 16 0v5Zm18 0v-6c0-2-1-3-2-4 6 0 7 4 7 10Z" fill="currentColor" />
      </>
    ),
    bars: (
      <>
        <rect x="2" y="12" width="5" height="10" rx="2" fill="#ff2f63" />
        <rect x="9" y="7" width="5" height="15" rx="2" fill="#00b7ed" />
        <rect x="16" y="2" width="5" height="20" rx="2" fill="#0086ff" />
      </>
    ),
    question: (
      <text x="4" y="23" fill="currentColor" fontSize="29" fontWeight="900">
        ?
      </text>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" className={`icon icon-${name} ${className}`} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
