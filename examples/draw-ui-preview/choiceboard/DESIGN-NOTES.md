# Choiceboard design notes

## Direction: Choiceboard

Keep the product's dark editorial tone and make the two-way choice the visual center. Amber marks Option A and cyan marks Option B. The colors continue from the letter badge into the option card, selected state, and result bar, so a player can recognize their side at a glance. Neutral charcoal surfaces carry longer reading content without making every section look like a game panel.

The homepage begins with a playable-looking question rather than a generic product pitch. Age, relationship, and occasion navigation then gives the visitor clear ways into the existing taxonomy. Category pages keep their SEO introduction and related links, but bring a question list and a play entry into the same surface. The play page gives the prompt more room, places equally sized choices underneath, and keeps the result inside the question flow.

The small preview ribbon and review labels make the prototype boundary visible. Source questions remain marked as unreviewed, and the result values are labeled illustrative. This matters because the checked-out source contains no approved playable questions at this snapshot.

## Visual system

| Role               | Preview treatment                                                  | Why                                                                                        |
| ------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Canvas             | Near-black green charcoal (`#101311`)                              | Continues the current dark editorial direction and keeps long text calm.                   |
| Raised surfaces    | Muted charcoal with fine neutral borders                           | Separates navigation, question cards, and editorial content without SaaS dashboard panels. |
| Option A           | Warm amber (`#F08A3C`)                                             | Preserves the current A-side amber/orange identity.                                        |
| Option B           | Cool cyan (`#4EC8D2`)                                              | Preserves the current B-side cyan/blue identity.                                           |
| Main type          | System sans                                                        | Crisp and available without image or font-generation services.                             |
| Editorial accent   | Georgia italic                                                     | Adds a restrained human voice to selected headings without weakening readability.          |
| Interaction states | Visible focus outline, selected `aria-pressed`, progress semantics | Keeps keyboard and screen-reader feedback aligned with color and visual selection.         |

The prototype supports dark and light previews. Mobile pages collapse the A/B grid into full-width, stacked choices and add a fixed four-item navigation dock. Reduced-motion preferences are respected.

## Existing product structure represented

- Homepage and editorial landing: `src/app/(marketing)/page.tsx`, `src/components/landing/landing-page.tsx`
- SEO segments and detail pages: `src/app/[segment]/page.tsx`, `src/app/[segment]/[slug]/page.tsx`
- Taxonomy, featured collections, question list/filter and editorial guide: `src/modules/would-you-rather/ui/category-explorer.tsx`, `featured-collections.tsx`, `question-directory.tsx`, `question-filter-bar.tsx`, `editorial-guide.tsx`
- Question flow, A/B interaction and presenter: `src/modules/would-you-rather/ui/wyr-experience.tsx`, `duel-arena.tsx`, `presenter-modal.tsx`; vote handling remains in `src/modules/would-you-rather/server/voting-service.ts` and `src/app/api/wyr/vote/route.ts`
- Shared site frame and theme: `src/components/navigation/site-header.tsx`, `site-footer.tsx`, `src/modules/would-you-rather/ui/theme-toggle.tsx`, `src/app/globals.css`
- Authentication and account pages: `src/app/(account)/sign-in/page.tsx`, `sign-in-form.tsx`, `src/components/account/account-shell.tsx`, and `src/app/(account)/account/`

## Suggested production mapping after design approval

| Existing surface                                                           | Suggested disposition                                                                                                                                                                                 |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site-header.tsx`, `site-footer.tsx`, `theme-toggle.tsx`                   | Keep their navigation and theme behavior; adjust spacing, type, surface colors, and active/focus states to the preview tokens.                                                                        |
| `landing-page.tsx`, `featured-collections.tsx`, `category-explorer.tsx`    | Keep route and content sources; reshape the visual hierarchy around the live A/B entry point and the three browse dimensions.                                                                         |
| `question-directory.tsx`, `question-filter-bar.tsx`, `editorial-guide.tsx` | Preserve data contracts and search/filter responsibilities; restyle list rows, controls, SEO copy, and related links. Do not enable unreviewed facets until their source metadata is approved.        |
| `wyr-experience.tsx`, `duel-arena.tsx`                                     | Keep voting state and API wiring; update the A/B card layout, progress/meta row, selected treatment, and result presentation. The preview percentages are not implementation data.                    |
| `presenter-modal.tsx`                                                      | Keep the current modal and keyboard behavior; align typography and option colors with the Choiceboard system.                                                                                         |
| Sign-in form and account pages                                             | Preserve magic-link, Turnstile, session, credits, billing, and security behavior; use the same dark/light surfaces and form components. Keep history/favorites out until the product implements them. |
| `globals.css` and shared UI styles                                         | Adjust tokens and shared component styles only after the preview is approved; no production stylesheet has been changed in this task.                                                                 |

## Preview limitations

This is a static visual and interaction prototype, not a production implementation. It does not authenticate, send email, write a vote, read account data, or request live results. Current draft taxonomy is displayed with its provenance and is not promoted to reviewed product content.
