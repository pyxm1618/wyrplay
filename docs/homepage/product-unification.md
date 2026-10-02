# Homepage product unification

## Baseline and scope

Latest main at start: `ea93a6fa37d6aa5bc7ce387623c5fa43769473d7`, fetched and fast-forwarded before editing. Delivery branch: `fix/homepage-product-unification-final`. A managed worktree isolates delivery from concurrent Kids/auth/finder work. Existing dirty files in the original checkout were preserved.

Scope is the homepage and the shared interaction boundaries necessary for its real arena. No question-bank, public asset, dependency, environment requirement, or build configuration changes. Existing full-bleed and viewport-height responsive overrides remain intact.

## Evidence-led changes

| Observed problem | Cause | Change | Acceptance |
| --- | --- | --- | --- |
| Two visual systems and repeated actions | IllustratedHome followed by generic LandingPage sections | One illustrated surface; useful feature copy integrated, native FAQ, duplicate resources/CTA removed | Full-page Chrome inspection; categories/FAQ/legal link assertions |
| Blurry branding at high DPR | Logo and visible H1 were small reference image crops | Existing SVG icon plus HTML wordmark; local-font HTML Would / You / Rather | DPR2 full pages and DPR3 logo/H1 crops; accessible H1/SSR checks |
| First-screen choices did not play | Decorative Dog/Cat UI ahead of a second arena | Single existing DuelArena rendered in Hero, with the same votes, selection, filters and Presenter callbacks | Real API voting, changing votes, reload persistence, Next/Random, highlights and directory selection |
| A quick first vote could lose its identity/state | Pending initial GET could finish after POST and replace state or anonymous cookie | Abort pending read before vote, guard stale responses, validate statistics | Delayed-read regression and delayed real GET/real POST/reload regression |
| Presenter close lost focus after changing questions | Arena remount replaced the original opener | Restore to the current live trigger via shared ref; only after modal was opened | Presenter Next/Escape/focus and keyboard regression |
| Footer/theme inconsistency | Fixed warm home inside globally themed shell | Central MarketingShell route decision and one illustrated footer variant; no homepage theme toggle | Saved dark preference remains warm on home; ordinary-page theme persistence; all four legal links |
| Hero rectangular collage joins | Independently scaled/cropped reference pieces | Only Hero uses the existing independent hero-background asset | DPR1/2 desktop/tablet/mobile screenshots; other supporting crops retained |
| Populated leaderboard lacked row layout | Original trending row CSS only defined height/cursor | Flexible cards with readable title, vote count and rank | Real local-DB populated screenshot, mobile and desktop inspection |

## Old module decisions

- Features: taxonomy, real metrics and Presenter guidance integrated into How It Works, Play Together and the live interaction.
- FAQ: three concise answers implemented as accessible native HTML details in the illustrated visual system. No FAQ schema invented.
- Related Resources: duplicate block removed after confirming all five collection destinations in Popular Categories.
- Final CTA: duplicate inverse banner removed; real Hero play, Create and browse already provide concrete paths.
- Redundant editorial How-to content: removed because it repeated the illustrated How It Works module.

## Browser acceptance

All 12 requested viewports passed automated overflow, unique arena, first-fold choices, primary sections, branding, categories and legal link checks: 375×812, 390×844, 393×852, 414×896, 768×1024, 820×1180, 1024×1366, 1280×720, 1366×768, 1440×900, 1512×982 and 1920×1080.

Five full-page sizes were captured at both DPR1 and DPR2 and inspected: 375×812, 390×844, 768×1024, 1440×900 and 1920×1080. Extra captures cover DPR3 branding, expanded browse, expanded FAQ/footer, and bulb hand against warm/dark backgrounds at DPR1/2. No bulb regeneration was warranted. Highlights and other supporting decorative crops remain.

Artifacts are local, ignored files under `.artifacts/home-review/` in the delivery worktree. `viewport-results.json` records real browser version and measured widths. The screenshots' votes come from this task's isolated local database; they are not production metrics.

## Verification

- `bun run lint`: PASS.
- `bun run typecheck`: PASS, after completed builds.
- `bun run build`: PASS, test-environment build with optional features disabled; enabled-feature test build also succeeds.
- Unit: 303 tests / 58 files PASS, serial workers after an earlier resource-contention timeout.
- Integration: 245 tests / 37 files PASS in task-isolated local database `wyr_home_20261002_3200`.
- Contract: 31 tests / 1 file PASS.
- Related browser suite: 49 tests PASS (18 homepage plus interactions, accessibility, SEO, analytics consent, play/print and legal), using installed Chrome and a temporary ignored config on isolated port 3200. Runner exited 0; browser shutdown was slow under concurrent machine load.
- Existing responsive regression: 4 tests PASS, including the complete home matrix, Play/Presenter desktop controls and formal-public-route overflow smoke.
- Changed-code formatting and `git diff --check`: PASS.

A neutral-build run had 22/23 passing tests and one Kids accessibility contrast failure; the same unchanged test passed in the final enabled-feature suite. Earlier blank screenshots from invalid environment, incomplete browser downloads, resource-contention unit timeouts, and overlapping fixture resets were not counted as acceptance. No production database or provider was mutated.

## Limits

The HTML heading approximates the drawn lettering using local Roboto Condensed, CSS rotation and shadows; it is not identical path artwork. Some supporting decorative reference crops remain intentionally. The existing independent Hero artwork differs from the reference composition and is subdued on phones to keep real choices legible. This is local Chrome acceptance and a reviewable PR, not production deployment or a claim of universal browser perfection.
