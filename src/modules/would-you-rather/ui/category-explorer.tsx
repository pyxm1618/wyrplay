import Link from "next/link";
import {
  AUDIENCE_CATEGORIES,
  OCCASION_CATEGORIES,
  STYLE_CATEGORIES,
} from "../data/questions";

export function CategoryExplorer() {
  return (
    <section className="border-t border-border bg-surface-muted/50 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find the Right Questions
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Browse our organized dilemma catalog by audience, social setting, or conversational tone.
          </p>
        </div>

        {/* Three-Dimensional Taxonomy */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Dimension 1: By Audience */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
              <span className="flex size-7 items-center justify-center rounded-md bg-[#e27d32]/10 text-xs font-bold text-[#e27d32]">
                01
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground">
                By Audience
              </h3>
            </div>
            <p className="mb-4 text-xs text-muted">
              Targeted age-appropriate dilemmas for every group dynamic.
            </p>
            <div className="space-y-2.5">
              {AUDIENCE_CATEGORIES.map((item) => (
                <div key={item.id} className="group flex items-start justify-between gap-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm font-semibold text-foreground underline-offset-4 transition hover:text-[#e27d32] hover:underline"
                    >
                      {item.name} →
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                  )}
                  <span className="text-right text-[11px] text-muted">
                    {item.description.slice(0, 32)}...
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension 2: By Occasion */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
              <span className="flex size-7 items-center justify-center rounded-md bg-[#19a4b8]/10 text-xs font-bold text-[#19a4b8]">
                02
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground">
                By Occasion
              </h3>
            </div>
            <p className="mb-4 text-xs text-muted">
              Perfect conversation starters tailored for specific settings.
            </p>
            <div className="space-y-2.5">
              {OCCASION_CATEGORIES.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="text-right text-[11px] text-muted">
                    {item.description.slice(0, 32)}...
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension 3: By Style */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
              <span className="flex size-7 items-center justify-center rounded-md bg-[#e27d32]/10 text-xs font-bold text-[#e27d32]">
                03
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground">
                By Style
              </h3>
            </div>
            <p className="mb-4 text-xs text-muted">
              Filter by the energy and intensity level you want.
            </p>
            <div className="space-y-2.5">
              {STYLE_CATEGORIES.map((item) => (
                <div key={item.id} className="group flex items-start justify-between gap-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm font-semibold text-foreground underline-offset-4 transition hover:text-[#19a4b8] hover:underline"
                    >
                      {item.name} →
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                  )}
                  <span className="text-right text-[11px] text-muted">
                    {item.description.slice(0, 32)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
