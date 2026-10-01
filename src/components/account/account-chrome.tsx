"use client";
/* eslint-disable @next/next/no-img-element -- Authenticated avatar and existing local artwork. */
import Link from "next/link";
import { useState } from "react";
import { AccountIcon } from "./account-icons";
export type AccountProfile = { name: string; email: string; image: string | null; joined: string };

export function AccountChrome({
  profile,
  commerceEnabled,
}: {
  profile: AccountProfile;
  commerceEnabled: boolean;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const displayName = profile.name.trim() || "Your Account";
  const avatar = profile.image && !avatarFailed ? profile.image : "/account-art/default-avatar.png";
  return (
    <>
      {" "}
      <header className="account-header">
        <Link href="/" aria-label="WYRPLAY home">
          <img src="/leaderboard-art/logo.png" alt="WYRPLAY" width="165" height="59" />
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/find-questions">Questions</Link>
          <Link href="/#categories">Categories</Link>
          <Link href="/leaderboards">Leaderboards</Link>
          <button disabled title="Question submissions are not open yet.">
            Create
          </button>
        </nav>
        <div className="account-header-actions">
          <Link href="/find-questions" aria-label="Find questions">
            <AccountIcon name="search" />
          </Link>
          <details className="account-menu">
            <summary aria-label="Account menu">•••</summary>
            <nav aria-label="Account navigation">
              <Link href="/account/security">Security &amp; sessions</Link>
              {commerceEnabled && (
                <>
                  <Link href="/account/credits">Credits</Link>
                  <Link href="/account/billing">Billing history</Link>
                </>
              )}
            </nav>
          </details>
          <img
            src={avatar}
            className="account-mini-avatar"
            alt=""
            onError={() => setAvatarFailed(true)}
          />
        </div>
      </header>
      <section className="account-profile" aria-labelledby="account-title">
        <div className="account-avatar-wrap">
          <img
            className="account-avatar"
            src={avatar}
            alt={profile.image && !avatarFailed ? `${displayName}'s avatar` : "Default avatar"}
            onError={() => setAvatarFailed(true)}
          />
          <span aria-hidden="true">✦</span>
        </div>
        <div className="account-identity">
          <h1 id="account-title">{displayName}</h1>
          <p className="account-member">Your WYRPLAY account</p>
          <p>
            <AccountIcon name="mail" />
            <span>{profile.email}</span>
          </p>
          <p>
            <AccountIcon name="calendar" />
            <span>Joined {profile.joined}</span>
          </p>
        </div>
        <div className="account-slogan" aria-hidden="true">
          Curious Questions
          <br />
          Bigger Conversations<span>♛ ✦</span>
        </div>
        <div className="account-profile-actions">
          <button disabled title="Profile editing is not available yet.">
            <AccountIcon name="edit" />
            Edit Profile
          </button>
          <Link href="/account/settings">
            <AccountIcon name="settings" />
            Settings
          </Link>
        </div>
      </section>
    </>
  );
}

export function AccountProfilePhoto({ image }: { image: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      className="settings-avatar"
      src={image && !failed ? image : "/account-art/default-avatar.png"}
      width="72"
      height="72"
      alt="Current profile photo"
      onError={() => setFailed(true)}
    />
  );
}
