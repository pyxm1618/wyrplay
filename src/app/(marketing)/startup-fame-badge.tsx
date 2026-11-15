"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function HomepageStartupFameBadge() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    setPortalTarget(footer?.parentElement ?? null);
  }, []);

  if (!portalTarget) return null;

  return createPortal(
    <div
      data-home-startup-fame-badge
      className="flex w-full justify-center py-4 print:hidden"
    >
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
