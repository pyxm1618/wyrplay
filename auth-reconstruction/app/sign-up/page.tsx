import type { Metadata } from "next";
import { AuthPage } from "../auth-page";
export const metadata: Metadata = { title: "WYRPLAY — Create Your Account" };
export default function Page() {
  return <AuthPage mode="signup" />;
}
