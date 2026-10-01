import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "WYRPLAY — Sign In",
  description: "WYRPLAY registration and sign-in frontend design preview.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
