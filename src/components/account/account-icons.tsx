import type { ReactNode } from "react";
type Name =
  | "search"
  | "mail"
  | "calendar"
  | "edit"
  | "settings"
  | "heart"
  | "game"
  | "clock"
  | "arrow";
const paths: Record<Name, ReactNode> = {
  search: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="m15 15 6 6" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M7 3v4m10-4v4" />
    </>
  ),
  edit: (
    <>
      <path d="m4 15 12-12 5 5L9 20l-6 1zM13 6l5 5" />
    </>
  ),
  settings: (
    <>
      <path
        d="m10 3 4 0 1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3l-2-2 2-4 3 1 3-1z"
        transform="translate(1 -1) scale(.9)"
      />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  heart: <path d="M12 21S2 15 2 8a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 7-10 13-10 13Z" />,
  game: (
    <>
      <path d="M7 5h10c4 0 6 8 5 12-1 4-5 0-7-1H9c-2 1-6 5-7 1C1 13 3 5 7 5Z" />
      <path d="M7 9v6M4 12h6M16 10h.01M19 13h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 3" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
};
export function AccountIcon({ name }: { name: Name }) {
  return (
    <svg
      className={`account-icon icon-${name}`}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
