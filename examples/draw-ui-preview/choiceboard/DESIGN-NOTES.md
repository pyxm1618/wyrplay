# Choiceboard design notes

## Direction

Choiceboard keeps wyrplay's dark editorial starting point and makes the two-way choice the visual center. Amber marks Option A; cyan marks Option B. The two colors follow each choice from its letter badge through selection and result bars, so the player can track a side without relying on color alone. Charcoal surfaces hold longer reading sections, keeping category and SEO copy inside the game rather than turning the site into a generic SaaS landing page.

The homepage opens with a real question from the current source and a playable A/B preview. Browse links preserve the product's existing age, relationship, occasion, and style taxonomy. Category pages put SEO title and summary beside search, metadata filters, related routes, and a direct play entry. The play screen gives the question and two touch targets most of the viewport; result feedback stays in the same flow. Sign-in and account retain the existing magic-link account model.

The screenshot values 57/43 and 1,284 are visibly marked illustrative. The preview ribbon, status text, and local-only interaction copy make it clear that this is a design prototype and no production service is connected.

## Visual system

| Role             | Preview treatment                                                      | Reason                                                                                 |
| ---------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Canvas           | Near-black green charcoal (`#101311`)                                  | Continues the current dark editorial direction and keeps long content calm.            |
| Raised surfaces  | Muted charcoal with fine neutral borders                               | Separates navigation, question cards, and editorial sections without dashboard panels. |
| Option A         | Warm amber (`#F08A3C`)                                                 | Preserves wyrplay's existing A-side amber/orange identity.                             |
| Option B         | Cool cyan (`#4EC8D2`)                                                  | Preserves wyrplay's existing B-side cyan/blue identity.                                |
| Main type        | System sans                                                            | Crisp text without remote font or image dependencies.                                  |
| Editorial accent | Georgia italic                                                         | Adds a restrained human voice to selected headings.                                    |
| Interaction      | Focus outline, `aria-pressed`, progress labels, visible selected state | Makes keyboard and screen-reader feedback track the visual choice.                     |

The prototype supports dark and light previews. At mobile widths the A/B choices stack into large full-width buttons and a fixed four-item navigation dock appears. Motion respects `prefers-reduced-motion`.

## Scope represented

- Home and editorial landing: `src/app/(marketing)/page.tsx`, `src/components/landing/landing-page.tsx`
- Segment and SEO detail routes: `src/app/[segment]/page.tsx`, `src/app/[segment]/[slug]/page.tsx`
- Browse taxonomy and collections: `src/modules/would-you-rather/ui/category-explorer.tsx`, `featured-collections.tsx`
- Question list, filters, and category guide: `src/modules/would-you-rather/ui/question-directory.tsx`, `question-filter-bar.tsx`, `editorial-guide.tsx`
- Question and presenter experience: `src/modules/would-you-rather/ui/wyr-experience.tsx`, `duel-arena.tsx`, `presenter-modal.tsx`
- Vote service/API: `src/modules/would-you-rather/server/voting-service.ts`, `src/app/api/wyr/vote/route.ts`; neither is called by the preview
- Header, footer, theme, and global styling: `src/components/navigation/site-header.tsx`, `site-footer.tsx`, `src/modules/would-you-rather/ui/theme-toggle.tsx`, `src/app/globals.css`
- Account access and pages: `src/app/(account)/sign-in/page.tsx`, its `sign-in-form.tsx`, `src/components/account/account-shell.tsx`, and `src/app/(account)/account/`

## Suggested production mapping after design approval

| Existing component or area                                                 | Recommendation                                                                                                                                                                         |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site-header.tsx`, `site-footer.tsx`, `theme-toggle.tsx`                   | Keep route destinations, menu behavior, and theme behavior. Restyle spacing, type, surfaces, and focus/active states to the preview tokens.                                            |
| `landing-page.tsx`, `featured-collections.tsx`, `category-explorer.tsx`    | Keep data sources and route relationships. Rework the hierarchy around the real A/B entry point and existing browse dimensions.                                                        |
| `question-directory.tsx`, `question-filter-bar.tsx`, `editorial-guide.tsx` | Keep search, filtering, SEO copy, and related links. Restyle rows and controls; reconcile the current static zero-playable label with the runtime source before changing product copy. |
| `wyr-experience.tsx`, `duel-arena.tsx`                                     | Keep vote state and API wiring. Restyle equal A/B cards, progress/meta, selected state, and results. Do not use prototype percentages as implementation values.                        |
| `presenter-modal.tsx`                                                      | Keep the existing dialog and keyboard controls. Align type, spacing, and A/B colors with Choiceboard.                                                                                  |
| Sign-in form and account pages                                             | Keep magic-link, Turnstile, session, credits, billing, and security behavior. Reuse the same surfaces and form treatment; do not add history/favorites based on this preview.          |
| `globals.css` and shared UI styles                                         | After approval, adjust shared tokens and component styles in a bounded change. No formal stylesheet was changed here.                                                                  |

## Source-contract details to carry into implementation

The source loader in this checkout marks 116 questions approved and playable. The current filter-bar component still contains a static “0 playable” label; this prototype uses the runtime question source and the label mismatch needs an independent product decision before a production change. The configured source has eight occasion routes but the canonical question occasion filter accepts five values. The extra routes (Icebreakers, Birthday Party, Sleepover) are backed by scenario metadata. The `clean` style is not a canonical tone; the preview uses classroom suitability as a visible proxy and calls out that mapping for review.

## Preview limits

This is a static visual and interaction prototype. It does not authenticate, send email, read account data, submit votes, or request live results. Account identity text and result bars are example UI only. The isolated files under this directory do not import into the production app.
