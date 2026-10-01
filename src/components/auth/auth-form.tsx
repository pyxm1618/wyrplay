"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { TurnstileWidget } from "@/components/security/turnstile-widget";
import Link from "next/link";
import { Arrow, Google, Mail } from "@/components/auth/auth-icons";
import { authClient } from "@/platform/auth/auth-client";

type Status = "idle" | "sending" | "sent" | "limited" | "challenge" | "error";

export function SignInForm({
  turnstileSiteKey,
  magicLinkEnabled,
  googleEnabled,
  signup,
  error,
}: Readonly<{
  turnstileSiteKey: string | undefined;
  magicLinkEnabled: boolean;
  googleEnabled: boolean;
  signup: boolean;
  error?: "google" | "magic-link" | undefined;
}>) {
  const [magicLinkOpen, setMagicLinkOpen] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (magicLinkOpen) emailRef.current?.focus();
  }, [magicLinkOpen]);

  async function signInWithGoogle() {
    if (!googleEnabled || googlePending) return;
    setGooglePending(true);
    setGoogleError(null);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/account",
        errorCallbackURL: "/sign-in?error=google",
      });
      if (result.error) setGoogleError("Google sign-in could not be started. Try again later.");
    } catch {
      setGoogleError("Google sign-in could not be started. Check your connection and try again.");
    } finally {
      setGooglePending(false);
    }
  }

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || !magicLinkEnabled) return;
    if (!turnstileToken) {
      setStatus("challenge");
      return;
    }
    setStatus("sending");

    const response = await fetch("/api/auth/magic-link/request", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, returnTo: "/account", turnstileToken }),
    }).catch(() => null);

    setTurnstileToken(null);
    setResetSignal((value) => value + 1);

    if (!response) {
      setStatus("error");
      return;
    }
    if (response.status === 429) {
      setStatus("limited");
      return;
    }
    if (response.status === 403 || response.status === 503) {
      setStatus("challenge");
      return;
    }
    setStatus(response.ok ? "sent" : "error");
  }

  const challengeReady = Boolean(turnstileSiteKey && turnstileToken);

  return (
    <div className="auth-actions">
      <button
        type="button"
        className="auth-button google-button"
        onClick={signInWithGoogle}
        disabled={!googleEnabled || googlePending || status === "sending"}
        title={!googleEnabled ? "Google sign-in is not enabled for this site" : undefined}
        aria-describedby={!googleEnabled ? "google-availability" : undefined}
      >
        <Google />
        <span>{googlePending ? "Connecting…" : "Continue with Google"}</span>
        <Arrow />
      </button>
      {!googleEnabled && (
        <span id="google-availability" className="sr-only">
          Google sign-in is not enabled for this site.
        </span>
      )}
      {error && (
        <p role="alert" className="auth-feedback">
          {error === "google"
            ? "Google sign-in could not be completed. Please try again."
            : "This sign-in link is invalid, expired, or already used. Request a new link."}
        </p>
      )}
      {googleError && (
        <p role="alert" className="auth-feedback">
          {googleError}
        </p>
      )}
      <button
        type="button"
        className="auth-button magic-button"
        onClick={() => setMagicLinkOpen((current) => !current)}
        disabled={!magicLinkEnabled || status === "sending" || googlePending}
        aria-expanded={magicLinkOpen}
        aria-controls="magic-link-fields"
        title={!magicLinkEnabled ? "Email sign-in is not enabled for this site" : undefined}
      >
        <Mail />
        <span>Continue with Magic Link</span>
        <Arrow />
      </button>
      {magicLinkOpen && (
        <form
          id="magic-link-fields"
          onSubmit={submit}
          aria-describedby="sign-in-status"
          className="magic-link-fields"
        >
          <label htmlFor="email">Email address</label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "sending"}
          />
          <div className="verification">
            {turnstileSiteKey ? (
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                resetSignal={resetSignal}
                onToken={(token) => {
                  setTurnstileToken(token);
                  if (token) setStatus((current) => (current === "challenge" ? "idle" : current));
                }}
                onUnavailable={() => setStatus("challenge")}
              />
            ) : (
              <p role="alert" className="auth-feedback">
                Human verification is unavailable. Sign-in requests are disabled.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={status === "sending" || !challengeReady}
            className="send-link"
          >
            {status === "sending" ? "Sending…" : "Send secure sign-in link"}
          </button>
          <p
            id="sign-in-status"
            aria-live="polite"
            className="auth-status"
            data-error={["error", "challenge", "limited"].includes(status)}
          >
            {status === "sent"
              ? "If this address can receive mail, a sign-in link has been sent."
              : status === "limited"
                ? "Too many sign-in requests. Try again later."
                : status === "challenge"
                  ? "Human verification expired or could not be completed. Try the verification again."
                  : status === "error"
                    ? "The sign-in request could not be completed. Try again later."
                    : "The link expires after ten minutes and can be used once."}
          </p>
          {signup && (
            <p className="auth-terms">
              New to WYRPLAY? Your account is created after you verify your email. Read our{" "}
              <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Notice</Link>.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
