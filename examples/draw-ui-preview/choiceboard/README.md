# wyrplay Choiceboard UI Preview

A standalone HTML/CSS/JS prototype for reviewing a complete wyrplay visual direction. It uses a checked-in snapshot generated from the current working-tree question and category sources. It has no build step, runtime dependencies, production imports, API calls, or live account/vote connections.

## Run locally

From the repository root:

```bash
python3 -m http.server 4173 --directory examples/draw-ui-preview/choiceboard --bind 127.0.0.1
```

Open <http://127.0.0.1:4173/>. Screens use hash routes, so the same static HTML file serves each preview page.

## Preview pages

- Home: <http://127.0.0.1:4173/#/home>
- Kids category: <http://127.0.0.1:4173/#/category/kids>
- Friends category: <http://127.0.0.1:4173/#/category/friends>
- Couples category: <http://127.0.0.1:4173/#/category/couples>
- Play before choice: <http://127.0.0.1:4173/#/play?question=wyr-000001>
- Illustrative result state: <http://127.0.0.1:4173/#/result?question=wyr-000001>
- Sign-in / account-access entry: <http://127.0.0.1:4173/#/sign-in>
- Account overview: <http://127.0.0.1:4173/#/account>
- Design system: <http://127.0.0.1:4173/#/design-system>

The Home browse section links to the current age groups, relationship groups, all eight configured occasion pages, and six style pages. Category pages have source-backed question lists, metadata filters, search, a play entry, and related-category navigation.

## Source facts and prototype boundaries

- The current working-tree snapshot contains 116 questions; all 116 carry `reviewStatus: approved` and are returned by the current playable-question selector.
- Featured collection counts from the current source metadata are Kids 58, Funny 18, Hard 73, Friends 49, and Couples 9. These are overlapping filters, so their counts do not sum to 116.
- The first example is source row `wyr-000001`: “Would you rather hear a squirrel tell stories or hear a turtle tell jokes?”
- The prototype's 57/43 bars and 1,284 total are explicitly illustrative layout content, not live vote data. Choosing A/B only changes local browser state; it never calls or stores a vote.
- Sign-in reflects the current one-time email-link flow, including the Turnstile boundary and ten-minute expiry. Form submission is local feedback only; no email or session is created. The current product has a sign-in route rather than a separate register page.
- Account history and favorites are shown as unavailable because those features are not in the current account routes. The account preview does show current Credits, Billing, and Security destinations, but does not read a real session.
- This snapshot reflects the current checkout, including working-tree changes that were already present before this preview was created. The parent `examples/draw-ui-preview/` draft was left untouched; this standalone prototype lives under `examples/draw-ui-preview/choiceboard/`.

## Taxonomy notes for a later implementation

- The Home page exposes all eight configured occasion routes. The current question filter contract has five canonical occasion values; Icebreakers, Birthday Party, and Sleepover are presented as browse routes using scenario metadata, not added to the filter contract.
- The existing Clean style has no canonical tone value. In this preview its examples are matched through `suitability.classroom === "suitable"`; confirm that mapping before production work.
- The checked-out runtime question loader reports 116 approved/playable rows, while the current filter-bar UI has a static “0 playable” label. This preview follows the runtime data. Reconcile that UI copy separately before a production rollout.

## Files and browser captures

- `index.html` — all pages, semantic structure, and design-system samples
- `prototype.css` — isolated tokens, components, responsive styles, and reduced-motion treatment
- `prototype.js` — local routing, filtering, search, A/B choices, illustrative result, sign-in feedback, and presenter dialog
- `question-snapshot.js` — local question and category metadata snapshot
- `DESIGN-NOTES.md` — visual rationale and suggested production component mapping
- `screenshots/` — desktop and mobile browser captures

No formal wyrplay frontend code was modified for this preview.
