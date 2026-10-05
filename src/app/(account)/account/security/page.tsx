import { isAPIError } from "better-auth/api";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { accountProfile } from "@/components/account/account-profile";
import { featuresConfig } from "@/config/features.config";
import { AccountShell } from "@/components/account/account-shell";
import { buttonSecondary, listDivided, metaText, panel } from "@/components/ui/styles";
import { getAccountContext } from "@/platform/auth/account-context";
import { getAuth } from "@/platform/auth/auth";

import {
  revokeAllSessionsAction,
  revokeOtherSessionsAction,
  revokeSessionAction,
  signOutAction,
} from "./actions";

function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function AccountSecurityPage() {
  const auth = getAuth();
  if (!auth) notFound();
  const requestHeaders = await headers();
  const context = await getAccountContext(requestHeaders);
  if (!context) redirect("/sign-in");

  let sessions;
  try {
    sessions = await auth.api.listSessions({ headers: requestHeaders });
  } catch (error) {
    if (!isAPIError(error) || error.body?.code !== "SESSION_NOT_FRESH") throw error;
    return (
      <AccountShell
        profile={accountProfile(context.user)}
        commerceEnabled={featuresConfig.commerce.enabled}
        eyebrow="Account security"
        title="Sign in again"
        titleId="security-title"
        intro="A fresh sign-in is required to review and revoke sessions."
      >
        <Link href="/sign-in">Sign in again →</Link>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      profile={accountProfile(context.user)}
      commerceEnabled={featuresConfig.commerce.enabled}
      eyebrow="Account security"
      title="Active sessions"
      titleId="security-title"
      intro="Review signed-in devices and revoke access you no longer recognize."
    >
      <ul className={`${panel} ${listDivided} px-5`}>
        {sessions.map((session) => {
          const current = session.token === context.session.token;
          return (
            <li key={session.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {current ? "Current session" : "Other session"}
                </p>
                <p className={`mt-1 ${metaText}`}>{session.userAgent ?? "Unknown browser"}</p>
                <p className={`mt-1 ${metaText}`}>
                  Created {formatDate(session.createdAt)} · Expires {formatDate(session.expiresAt)}
                </p>
              </div>
              {!current ? (
                <form action={revokeSessionAction}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <button type="submit" className={buttonSecondary}>
                    Revoke this session
                  </button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={revokeOtherSessionsAction}>
          <button type="submit" className={buttonSecondary}>
            Revoke all other sessions
          </button>
        </form>
        <form action={signOutAction}>
          <button type="submit" className={buttonSecondary}>
            Sign out this session
          </button>
        </form>
        <form action={revokeAllSessionsAction}>
          <button type="submit" className={buttonSecondary}>
            Revoke every session
          </button>
        </form>
      </div>
    </AccountShell>
  );
}
