import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "WYRPLAY — Leaderboards",
  description: "Discover the most popular Would You Rather questions, based on community votes.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
