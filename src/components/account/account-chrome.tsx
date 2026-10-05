"use client";
/* eslint-disable @next/next/no-img-element -- Authenticated avatar and existing local artwork. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AccountBrand } from "./account-brand";
import { AccountIcon } from "./account-icons";
export type AccountProfile = { name: string; email: string; image: string | null; joined: string };

export function AccountChrome({
  profile,
  commerceEnabled,
  showProfile = true,
}: {
  profile: AccountProfile;
  commerceEnabled: boolean;
  showProfile?: boolean;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target) && menu.current) {
        menu.current.open = false;
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const displayName = profile.name.trim() || "Your Account";
  const avatar =
    profile.image && !avatarFailed ? profile.image : "/account-art/default-avatar-v2.webp";
  return (
    <>
      {" "}
      <header className="account-header">
        <AccountBrand />
        <nav aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/find-questions">Questions</Link>
          <Link href="/#categories">Categories</Link>
          <Link href="/leaderboards">Leaderboards</Link>
        </nav>
        <div className="account-header-actions">
          <Link href="/find-questions" aria-label="Find questions">
            <AccountIcon name="search" />
          </Link>
          <details ref={menu} className="account-menu">
            <summary aria-label="Account menu">
              <img
                src={avatar}
                className="account-mini-avatar"
                alt=""
                onError={() => setAvatarFailed(true)}
              />
              <span>Account ▾</span>
            </summary>
            <nav
              aria-label="Account navigation"
              onClick={() => {
                if (menu.current) menu.current.open = false;
              }}
            >
              <Link href="/account">Overview</Link>
              <Link href="/account/settings">Settings</Link>
              <Link href="/account/security">Security &amp; sessions</Link>
              {commerceEnabled && (
                <>
                  <Link href="/account/credits">Credits</Link>
                  <Link href="/account/billing">Billing history</Link>
                </>
              )}
            </nav>
          </details>
        </div>
      </header>
      {showProfile && (
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
            <Link href="/account/settings">
              <AccountIcon name="settings" />
              Settings
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

export function AccountProfilePhoto({ image }: { image: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      className="settings-avatar"
      src={image && !failed ? image : "/account-art/default-avatar-v2.webp"}
      width="72"
      height="72"
      alt="Current profile photo"
      onError={() => setFailed(true)}
    />
  );
}
