import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TEST_FIXTURE_QUESTIONS, WyrExperience } from "@/modules/would-you-rather";
import type { Question } from "@/modules/would-you-rather";

export const metadata: Metadata = {
  title: "WYRPlay Test Bench",
  robots: { index: false, follow: false },
};

export default function TestBenchPage() {
  if (process.env.APP_ENV !== "test" && process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Interactive Test Bench</h1>
      <WyrExperience
        questions={TEST_FIXTURE_QUESTIONS as readonly Question[]}
        categoryBadge="Test Dilemmas"
        showCategoryExplorer={true}
      />
    </main>
  );
}
