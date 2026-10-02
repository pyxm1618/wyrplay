"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function MagicLinkConfirmation() {
  const [token, setToken] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState("/account");
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "error">("loading");

  useEffect(() => {
    let active = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const fragmentToken = fragment.get("token");
    const fragmentReturnTo = fragment.get("returnTo") ?? "/account";

    // Remove the token-bearing fragment before scheduling any React update.
    window.history.replaceState(null, "", window.location.pathname);

    queueMicrotask(() => {
      if (!active) return;
      if (!fragmentToken) {
        setStatus("error");
        return;
      }

      setToken(fragmentToken);
      setReturnTo(fragmentReturnTo);
      setStatus("ready");
    });

    return () => {
      active = false;
    };
  }, []);

  async function confirm() {
    if (!token || status !== "ready") return;
    setStatus("submitting");

    const response = await fetch("/api/auth/magic-link/confirm", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, returnTo }),
    }).catch(() => null);

    setToken(null);
    if (!response?.ok) {
      setStatus("error");
      return;
    }

    window.location.assign(returnTo);
  }

  return (
    <div className="confirmation-content">
      <p className="confirmation-warning">
        This page has not signed you in yet. Confirm only if you requested this link on this device.
      </p>
      <button
        type="button"
        className="send-link"
        onClick={confirm}
        disabled={status !== "ready"}
        aria-busy={status === "submitting"}
      >
        {status === "submitting" ? "Confirming…" : "Confirm sign in"}
      </button>
      <p
        aria-live="polite"
        role={status === "error" ? "alert" : "status"}
        className="auth-status"
        data-error={status === "error"}
      >
        {status === "error"
          ? "This sign-in link is invalid, expired, or already used. Request a new link."
          : status === "loading"
            ? "Preparing secure confirmation…"
            : ""}
      </p>
      <p className="confirmation-actions">
        Didn’t request this link? Close this page.{" "}
        <Link href="/sign-in">Request a new sign-in link</Link>.
      </p>
    </div>
  );
}
