"use client";

import type { FocusEvent, ReactNode } from "react";

type BadgeMarqueeViewportProps = Readonly<{
  children: ReactNode;
  "data-home-startup-fame-badge"?: string;
}>;

/**
 * Small client boundary for the badge rail's focus behavior only.
 *
 * The badge links themselves are rendered by the server component above this
 * boundary, so they remain present in the initial HTML for crawlers and for
 * visitors without JavaScript.
 */
export function BadgeMarqueeViewport({
  children,
  "data-home-startup-fame-badge": startupFameMarker,
}: BadgeMarqueeViewportProps) {
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement && target.matches(":focus-visible")) {
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  return (
    <div
      className="wyr-badge-marquee-viewport w-full py-4 print:hidden"
      data-home-startup-fame-badge={startupFameMarker}
      data-home-badge-marquee="viewport"
      onFocus={handleFocus}
    >
      {children}
    </div>
  );
}
