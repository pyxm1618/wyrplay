import type { Metadata } from "next";
import { AuthEntry } from "@/components/auth/auth-entry";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

export default async function SignInPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ error?: string }> }>) {
  const { error } = await searchParams;
  return (
    <AuthEntry
      mode="login"
      error={error === "google" || error === "magic-link" ? error : undefined}
    />
  );
}
