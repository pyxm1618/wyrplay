"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function AccountNavigation({ commerceEnabled }: { commerceEnabled: boolean }) {
  const pathname = usePathname();
  const view = useSearchParams().get("view");
  return (
    <>
      <nav className="account-tabs" aria-label="Account sections">
        {[
          ["Overview", "/account", null],
          ["Saved Questions", "/account?view=saved", "saved"],
          ["My Questions", "/account?view=my", "my"],
          ["Recent Activity", "/account?view=activity", "activity"],
          ["Settings", "/account/settings", "settings"],
        ].map(([name, href, key]) => {
          const active =
            key === "settings"
              ? pathname === "/account/settings"
              : pathname === "/account" && (view ?? null) === key;
          return (
            <Link
              key={href}
              href={href!}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              {name}
            </Link>
          );
        })}
      </nav>
      <nav className="account-services" aria-label="Account management">
        {[
          ["Security & sessions", "/account/security"],
          ...(commerceEnabled
            ? [
                ["Billing", "/account/billing"],
                ["Credits", "/account/credits"],
              ]
            : []),
        ].map(([name, href]) => (
          <Link key={href} href={href!} aria-current={pathname === href ? "page" : undefined}>
            {name}
          </Link>
        ))}
      </nav>
    </>
  );
}
