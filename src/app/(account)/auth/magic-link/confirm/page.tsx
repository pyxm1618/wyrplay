import type { Metadata } from "next";

import { AuthSurface } from "@/components/auth/auth-surface";

import { MagicLinkConfirmation } from "./magic-link-confirmation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm sign in",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function MagicLinkConfirmationPage() {
  return (
    <AuthSurface mode="confirm">
      <MagicLinkConfirmation />
    </AuthSurface>
  );
}
