import Link from "next/link";
import { FEATURED_COLLECTIONS, getQuestionsByCollection } from "../data/questions";
import type { FeaturedCollectionKey } from "../types";

const COLLECTION_KEYS: readonly FeaturedCollectionKey[] = [
  "kids",
  "funny",
  "hard",
  "friends",
  "couples",
];

export function FeaturedCollectionsSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Heading */}
      <div className="mb-12 text-center sm:mb-16">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Featured Collections
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Explore Would You Rather Questions tailored for specific occasions and audiences. Each collection is fully playable and independently indexed.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {COLLECTION_KEYS.map((key) => {
          const col = FEATURED_COLLECTIONS[key];
          const sampleQuestions = getQuestionsByCollection(key).slice(0, 3);

          return (
            <article
              key={key}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-foreground/30 hover:shadow-lg"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted">
                    {col.badge}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {getQuestionsByCollection(key).length}+ questions
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-foreground">
                  <Link href={col.route} className="hover:text-[#e27d32] transition-colors">
                    {col.title}
                  </Link>
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                  {col.subtitle}
                </p>

                {/* Sample Previews */}
                <div className="mt-5 space-y-2 border-t border-border pt-4">
                  <span className="text-[11px] font-bold tracking-wider text-muted uppercase">
                    Sample questions:
                  </span>
                  <ul className="space-y-1.5 text-xs text-foreground/80">
                    {sampleQuestions.map((q) => (
                      <li key={q.id} className="line-clamp-1 list-inside list-disc">
                        {q.question}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Links */}
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs font-bold">
                <Link
                  href={col.route}
                  className="inline-flex items-center gap-1 text-[#e27d32] hover:underline"
                >
                  <span>Explore full list</span>
                  <span>→</span>
                </Link>
                <Link
                  href={`${col.route}#play`}
                  className="rounded-full bg-surface-muted px-3 py-1.5 text-foreground transition hover:bg-foreground hover:text-background"
                >
                  Start Playing
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
