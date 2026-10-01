import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WYRPLAY — Would You Rather?",
  description:
    "Same question. Different minds. A faithful frontend recreation of the WYRPLAY homepage.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
