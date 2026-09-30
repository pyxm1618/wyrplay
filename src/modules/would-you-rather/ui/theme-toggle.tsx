"use client";

import { useEffect, useSyncExternalStore } from "react";

function safeGetStorageTheme(): "dark" | "light" | null {
  try {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("wyr-theme") as "dark" | "light" | null) ?? null;
  } catch {
    return null;
  }
}

function safeSetStorageTheme(theme: "dark" | "light"): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("wyr-theme", theme);
    }
  } catch {
    // 保护由于第三方 Cookie 阻止或隐私模式禁用 localStorage 的情况
  }
}

function getThemeSnapshot(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const saved = safeGetStorageTheme();
  if (saved === "dark" || saved === "light") return saved;
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function getServerSnapshot(): "dark" | "light" {
  return "dark";
}

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  let media: MediaQueryList | null = null;
  try {
    media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", callback);
  } catch {
    // ignore
  }

  return () => {
    window.removeEventListener("storage", callback);
    media?.removeEventListener("change", callback);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot);

  // 挂载与主题变更时，确保真实 DOM 根节点的 data-theme 属性与当前状态严格同步
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    safeSetStorageTheme(next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="flex size-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:border-foreground/30 hover:text-foreground"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? (
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
