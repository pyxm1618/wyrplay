/* eslint-disable @next/next/no-img-element -- Reused local account illustration. */
import Link from "next/link";
import { AccountChrome, AccountProfilePhoto, type AccountProfile } from "./account-chrome";
import { AccountIcon } from "./account-icons";
import "./account-overview.css";
import "./account-panels.css";
export function AccountSettings({
  profile,
  commerceEnabled,
  verified,
  sessionCount,
  magicLinkEnabled,
  signOutAction,
}: {
  profile: AccountProfile;
  commerceEnabled: boolean;
  verified: boolean;
  sessionCount: number | null;
  magicLinkEnabled: boolean;
  signOutAction: () => Promise<void>;
}) {
  return (
    <div className="account-overview account-settings-page">
      <div className="account-cloud account-cloud-top" aria-hidden="true" />
      <div className="account-cloud account-cloud-bottom" aria-hidden="true" />
      <div className="account-page">
        <AccountChrome profile={profile} commerceEnabled={commerceEnabled} />
        <main>
          <nav className="account-tabs" aria-label="Account sections">
            <Link href="/account">Overview</Link>
            <Link href="/account?view=saved">Saved Questions</Link>
            <Link href="/account?view=my">My Questions</Link>
            <Link href="/account?view=activity">Recent Activity</Link>
            <Link href="/account/settings" className="active" aria-current="page">
              Settings
            </Link>
          </nav>
          <div className="account-settings-layout">
            <nav className="settings-sidebar account-panel" aria-label="Settings sections">
              {[
                ["Profile", "profile"],
                ["Account & Sign-in", "sign-in"],
                ["Security", "security"],
                ["Notifications", "notifications"],
                ["Delete Account", "delete"],
              ].map(([label, id]) => (
                <a href={"#" + id} key={id}>
                  <AccountIcon
                    name={
                      id === "sign-in"
                        ? "mail"
                        : id === "notifications"
                          ? "clock"
                          : id === "profile"
                            ? "edit"
                            : "settings"
                    }
                  />{" "}
                  {label}
                </a>
              ))}
            </nav>
            <div className="settings-content">
              <div className="settings-profile-columns">
                <section className="account-panel" id="profile">
                  <div className="library-heading">
                    <AccountIcon name="edit" />
                    <div>
                      <h2>Profile</h2>
                      <p>Manage your basic information and how you appear on WYRPlay.</p>
                    </div>
                  </div>
                  <h3>Profile Information</h3>
                  <p className="unavailable-note">
                    Profile editing is not available yet. Your current details are shown below.
                  </p>
                  <div className="settings-field">
                    <span>Profile Photo</span>
                    <div className="settings-photo">
                      <AccountProfilePhoto image={profile.image} />
                      <button disabled>Change Photo</button>
                      <button disabled>Remove</button>
                    </div>
                  </div>
                  <label className="settings-field">
                    <span>Display Name</span>
                    <input value={profile.name} readOnly />
                  </label>
                  <label className="settings-field">
                    <span>Username</span>
                    <input placeholder="Usernames are not available yet" disabled />
                  </label>
                  <label className="settings-field">
                    <span>Bio (Optional)</span>
                    <textarea placeholder="Bios are not available yet" disabled />
                  </label>
                  <button className="account-blue-button settings-save" disabled>
                    Save Changes
                  </button>
                </section>
                <aside>
                  <section className="account-panel settings-inspiration">
                    <img src="/account-art/bulb.png" width="80" height="105" alt="" />
                    <h2>
                      Be Yourself
                      <br />
                      Be Curious
                    </h2>
                    <p>Your profile helps the community get to know you.</p>
                  </section>
                  <section className="account-panel settings-tips">
                    <h2>❤️ Tips</h2>
                    <p>✓ Use a friendly and recognizable name.</p>
                    <p>✓ A clear profile helps build a positive community.</p>
                    <p>Profile editing will be available when supported.</p>
                  </section>
                </aside>
              </div>
              <section className="account-panel" id="sign-in">
                <div className="library-heading">
                  <AccountIcon name="mail" />
                  <div>
                    <h2>Account &amp; Sign-in</h2>
                    <p>Manage your email and sign-in method.</p>
                  </div>
                </div>
                <div className="settings-field">
                  <span>Email Address</span>
                  <div>
                    <input value={profile.email} readOnly aria-label="Email Address" />
                    <span className={verified ? "verified-badge" : "unverified-badge"}>
                      {verified ? "● Verified" : "Unverified"}
                    </span>
                  </div>
                  <button disabled>Change Email</button>
                </div>
                <div className="settings-field">
                  <span>Available sign-in</span>
                  <p>
                    {magicLinkEnabled
                      ? "Magic link (Email)"
                      : "Managed by the configured authentication provider."}
                  </p>
                </div>
                <form action={signOutAction} className="settings-action-row">
                  <div>
                    <strong>Sign Out</strong>
                    <p>Sign out from this device.</p>
                  </div>
                  <button className="settings-danger">Sign Out</button>
                </form>
              </section>
              <section className="account-panel" id="security">
                <h2>Security</h2>
                <p>Keep your account safe.</p>
                <div className="settings-action-row">
                  <span>Active Sessions</span>
                  <span>
                    {sessionCount === null
                      ? "Sign in again to view sessions."
                      : `${sessionCount} active ${sessionCount === 1 ? "session" : "sessions"}`}
                  </span>
                  <Link href={sessionCount === null ? "/sign-in" : "/account/security"}>
                    {sessionCount === null ? "Sign in again →" : "Manage Sessions →"}
                  </Link>
                </div>
              </section>
              <section className="account-panel" id="notifications">
                <h2>Notifications</h2>
                <p>Notification preferences are not available yet.</p>
              </section>
              <section className="account-panel" id="delete">
                <h2>Delete Account</h2>
                <p>
                  This revokes all access and permanently removes your authentication identity.
                  Required financial or security records may remain pseudonymized according to the
                  published policy.
                </p>
                <div className="settings-delete-warning">
                  <strong>This action cannot be undone.</strong>
                  <form action="/api/account/delete" method="post">
                    <label htmlFor="delete-confirmation">Type DELETE to confirm</label>
                    <input
                      id="delete-confirmation"
                      name="confirmation"
                      pattern="DELETE"
                      required
                      autoComplete="off"
                    />
                    <button className="settings-danger">Permanently delete account</button>
                  </form>
                </div>
              </section>
            </div>
          </div>
          <section className="account-explore">
            <img src="/account-art/bulb.png" width="105" height="120" alt="" />
            <div>
              <h2>Keep asking, keep exploring!</h2>
              <p>Discover new questions or create your own.</p>
            </div>
            <nav>
              <Link href="/funny-would-you-rather-questions">😄 Funny</Link>
              <Link href="/hard-would-you-rather-questions">🧠 Hard</Link>
              <Link href="/find-questions">Browse all →</Link>
            </nav>
          </section>
        </main>
      </div>
    </div>
  );
}
