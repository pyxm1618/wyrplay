export function EditorialGuideSection() {
  return (
    <section className="border-t border-border bg-surface-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* What Is Would You Rather */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center sm:text-left">
            What Is Would You Rather?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            <strong>Would You Rather Questions</strong> power a timeless social decision game where
            players are presented with two distinct, often challenging or absurd alternatives, and
            must choose exactly one. Unlike ordinary trivia or quiz games, there are no
            mathematically correct answers. The entire magic lies in the forced choice—revealing
            personal values, eccentric humor, hidden priorities, and instinctive logic.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            From harmless, clean Would You Rather questions for kids in morning classrooms to deep
            moral dilemmas among lifelong friends and couples on date night, the format cuts through
            small talk instantly. Whether played casually around a dinner table or as an energizing
            corporate icebreaker, every question ignites spontaneous debate, surprising defenses,
            and genuine laughter.
          </p>
        </article>

        {/* How to Play Would You Rather */}
        <div className="mt-14 border-t border-border pt-12">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            How to Play Would You Rather
          </h2>
          <p className="mt-2 text-sm text-muted">
            Use four simple steps to turn any quiet gathering into an unforgettable conversation.
          </p>

          <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#e27d32]/10 font-mono text-xs font-bold text-[#e27d32]">
                  1
                </span>
                <h3 className="mt-3 text-base font-bold text-foreground">Pick a Dilemma</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Choose a question from our catalog that matches your group&apos;s setting and
                  mood.
                </p>
              </div>
            </li>

            <li className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#19a4b8]/10 font-mono text-xs font-bold text-[#19a4b8]">
                  2
                </span>
                <h3 className="mt-3 text-base font-bold text-foreground">Make the Choice</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Everyone in the room commits to Option A or Option B. No escaping with
                  &quot;neither&quot; or &quot;both&quot;!
                </p>
              </div>
            </li>

            <li className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#e27d32]/10 font-mono text-xs font-bold text-[#e27d32]">
                  3
                </span>
                <h3 className="mt-3 text-base font-bold text-foreground">Defend Your Logic</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Explain your reasoning. The hilarious disagreements and unexpected logic are where
                  the fun happens.
                </p>
              </div>
            </li>

            <li className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div>
                <span className="flex size-7 items-center justify-center rounded-full bg-[#19a4b8]/10 font-mono text-xs font-bold text-[#19a4b8]">
                  4
                </span>
                <h3 className="mt-3 text-base font-bold text-foreground">Next Question</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Hit Next or randomize the deck to keep the conversational momentum flowing.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
