"use client";

import { useEffect } from "react";

export function LeaderboardThemeEffect() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevTheme = html.getAttribute("data-theme");

    html.setAttribute("data-theme", "light");
    body.classList.add("leaderboard-body");

    return () => {
      if (prevTheme !== null) {
        html.setAttribute("data-theme", prevTheme);
      } else {
        html.removeAttribute("data-theme");
      }
      body.classList.remove("leaderboard-body");
    };
  }, []);

  return null;
}
