import type { Metadata } from "next";
import { AuthEntry } from "@/components/auth/auth-entry";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return <AuthEntry mode="signup" />;
}
