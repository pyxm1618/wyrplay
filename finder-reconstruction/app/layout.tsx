import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "WYRPLAY — Find Questions",
  description: "Browse fun Would You Rather questions. A standalone, local frontend prototype.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
