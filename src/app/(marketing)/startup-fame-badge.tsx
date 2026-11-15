"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

function getSnapshot() {
  return document.querySelector<HTMLElement>("[data-site-footer]")?.parentElement ?? null;
}

function getServerSnapshot() {
  return null;
}

export function HomepageStartupFameBadge() {
  const portalTarget = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!portalTarget) return null;

  return createPortal(
    <div data-home-startup-fame-badge className="flex w-full justify-center py-4 print:hidden">
      <a
        href="https://startupfa.me/s/wyrplay?utm_source=www.wyrplay.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://startupfa.me/badge?t=small&theme=default"
          alt="WYR Play - Featured on Startup Fame"
          width="240"
          height="36"
        />
      </a>
    </div>,
    portalTarget,
  );
}
