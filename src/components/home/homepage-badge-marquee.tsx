import type { CSSProperties } from "react";

import { BadgeMarqueeViewport } from "./badge-marquee-viewport";

type Badge = Readonly<{
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  style?: CSSProperties;
  loading?: "lazy";
  decoding?: "async";
  linkClassName?: string;
  primaryMarker?: "data-home-better-launch-badge";
}>;

/**
 * Homepage-only reciprocal badge rail.
 *
 * The rail is permanently single-row: overflow becomes a continuous, seamless
 * horizontal marquee rather than additional wrapped rows. Only the first group
 * is interactive; the three following groups are visual clones for the loop.
 */
const BADGES: readonly Badge[] = [
  {
    href: "https://startupfa.me/s/wyrplay?utm_source=www.wyrplay.com",
    src: "https://startupfa.me/badge?t=small&theme=default",
    alt: "WYR Play - Featured on Startup Fame",
    width: 240,
    height: 36,
  },
  {
    href: "https://www.betterlaunch.co/product/wyr-play",
    src: "https://www.betterlaunch.co/badge-live-gradient.svg",
    alt: "Launching on Better Launch",
    width: 200,
    height: 56,
    primaryMarker: "data-home-better-launch-badge",
  },
  {
    href: "https://shipstry.com/",
    src: "https://shipstry.com/badges/featured.svg",
    alt: "Featured on Shipstry",
    width: 220,
    height: 52,
  },
  {
    href: "https://startupbase.io/products/wyr-play?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light",
    src: "https://statics.startupbase.io/site/badges/launched-on-sb.svg",
    alt: "Launched on StartupBase",
    width: 206,
    height: 55,
    style: { height: "55px", width: "auto" },
  },
  {
    href: "https://firstlook.tools",
    src: "https://firstlook.tools/badge/badge_light.svg",
    alt: "Featured on First Look",
    width: 200,
    height: 54,
  },
  {
    href: "https://twelve.tools",
    src: "https://twelve.tools/badge0-white.svg",
    alt: "Featured on Twelve Tools",
    width: 148,
    height: 40,
  },
  {
    href: "https://www.codehype.ai/product/wyr-play?utm_source=codehype_badge",
    src: "https://www.codehype.ai/badges/wyr-play.svg?variant=find-us&v=20",
    alt: "Featured on CodeHype",
    width: 180,
    height: 65,
    loading: "lazy",
    decoding: "async",
    linkClassName: "wyr-badge-marquee-link--codehype",
    style: {
      display: "inline-block",
      border: 0,
      width: "100%",
      maxWidth: "180px",
      height: "auto",
      maxHeight: "65px",
    },
  },
  {
    href: "https://www.founder.best?ref=founderbest&utm_source=founder.best&utm_medium=referral",
    src: "https://www.founder.best/api/badge/featured/wyr-play",
    alt: "Featured on Founder.best",
    width: 1195,
    height: 390,
    style: { height: "55px", width: "auto" },
  },
  {
    href: "https://bestsky.tools?utm_source=badge",
    src: "https://assets.bestsky.tools/badges/featured-light.svg",
    alt: "Featured on BestskyTools",
    width: 150,
    height: 48,
    style: { width: "150px", height: "auto" },
  },
] as const;

function BadgeGroup({ clone }: Readonly<{ clone: boolean }>) {
  return (
    <div
      aria-hidden={clone ? "true" : undefined}
      className="wyr-badge-marquee-group"
      data-home-badge-group={clone ? "clone" : "primary"}
    >
      {BADGES.map((badge) => (
        <a
          className={badge.linkClassName}
          href={badge.href}
          key={badge.href}
          rel="noopener noreferrer"
          tabIndex={clone ? -1 : undefined}
          target="_blank"
          {...(!clone && badge.primaryMarker ? { [badge.primaryMarker]: "" } : {})}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- official fixed-size external badges intentionally stay as plain img elements */}
          <img
            alt={badge.alt}
            decoding={badge.decoding}
            height={badge.height}
            loading={badge.loading}
            src={badge.src}
            style={badge.style}
            width={badge.width}
          />
        </a>
      ))}
    </div>
  );
}

export function HomepageBadgeMarquee() {
  return (
    <>
      <BadgeMarqueeViewport data-home-startup-fame-badge="">
        <div className="wyr-badge-marquee-track" data-home-badge-marquee="track">
          <BadgeGroup clone={false} />
          <BadgeGroup clone />
          <BadgeGroup clone />
          <BadgeGroup clone />
        </div>
      </BadgeMarqueeViewport>
      <style>{`
        .wyr-badge-marquee-viewport {
          overflow: hidden;
        }

        .wyr-badge-marquee-track {
          display: flex;
          width: max-content;
          animation: wyr-badge-marquee 42s linear infinite;
          will-change: transform;
        }

        .wyr-badge-marquee-group {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 0.75rem;
          padding-right: 0.75rem;
        }

        .wyr-badge-marquee-group > a {
          flex: 0 0 auto;
        }

        .wyr-badge-marquee-link--codehype {
          width: 180px;
        }

        .wyr-badge-marquee-viewport:hover .wyr-badge-marquee-track {
          animation-play-state: paused;
        }

        .wyr-badge-marquee-viewport:has(a:focus-visible) {
          overflow-x: auto;
          scrollbar-width: none;
        }

        .wyr-badge-marquee-viewport:has(a:focus-visible)::-webkit-scrollbar {
          display: none;
        }

        .wyr-badge-marquee-viewport:has(a:focus-visible) .wyr-badge-marquee-track {
          animation: none;
          transform: translate3d(0, 0, 0);
          will-change: auto;
        }

        @keyframes wyr-badge-marquee {
          to {
            transform: translate3d(-25%, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wyr-badge-marquee-viewport {
            overflow-x: auto;
            scrollbar-width: none;
          }

          .wyr-badge-marquee-viewport::-webkit-scrollbar {
            display: none;
          }

          .wyr-badge-marquee-track {
            animation: none;
            will-change: auto;
          }

          .wyr-badge-marquee-group[aria-hidden="true"] {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
