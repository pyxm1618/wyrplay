import type { ReactNode } from "react";
export function FinderIcon({ name, size = 18 }: { readonly name: string; readonly size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.5 10.5 7-4m-7 7 7 4" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    bookmark: <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-4z" />,
    arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),
    play: <path d="m7 4 13 8-13 8z" />,
    filter: <path d="M4 4h16l-6 8v7l-4 2v-9z" />,
    screen: (
      <>
        <rect x="3" y="3" width="18" height="13" rx="1" />
        <path d="M8 21h8m-4-5v5" />
      </>
    ),
    print: (
      <>
        <path d="M6 8V3h12v5M6 17H3V9h18v8h-3M6 14h12v7H6zM17 11h1" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.arrow}
    </svg>
  );
}
