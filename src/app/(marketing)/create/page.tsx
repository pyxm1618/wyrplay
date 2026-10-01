import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Own Question",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-24">
      <h1 className="text-4xl font-bold">Create Your Own Question</h1>
      <p className="mt-5 text-muted">The question creation page is being prepared.</p>
      <Link href="/#play" className="mt-8 inline-block underline">
        Play curated questions
      </Link>
    </main>
  );
}
