import Link from "next/link";
import { AccountBrand } from "./account-brand";
import type { ReactNode } from "react";
import { AccountChrome, type AccountProfile } from "./account-chrome";
import { AccountNavigation } from "./account-navigation";
import "./account-overview.css";
import "./account-panels.css";
import "./account-system.css";

export function AccountShell({
  eyebrow,
  title,
  titleId,
  intro,
  children,
  profile,
  commerceEnabled = false,
}: Readonly<{
  eyebrow: string;
  title: string;
  titleId: string;
  intro?: ReactNode;
  children: ReactNode;
  profile?: AccountProfile;
  commerceEnabled?: boolean;
}>) {
  return (
    <div className="account-overview account-system" data-theme="light">
      <div className="account-cloud account-cloud-bottom" aria-hidden="true" />
      <div className="account-page">
        {profile ? (
          <AccountChrome profile={profile} commerceEnabled={commerceEnabled} showProfile={false} />
        ) : (
          <header className="account-header">
            <AccountBrand />
          </header>
        )}
        <main>
          {profile && <AccountNavigation commerceEnabled={commerceEnabled} />}
          <section className="account-detail" aria-labelledby={titleId}>
            <p className="account-eyebrow">{eyebrow}</p>
            <h1 id={titleId}>{title}</h1>
            {intro && <p className="account-intro">{intro}</p>}
            <div className="account-detail-content">{children}</div>
          </section>
        </main>
        <footer className="account-footer">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </footer>
      </div>
    </div>
  );
}
