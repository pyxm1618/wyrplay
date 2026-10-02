# Finder UI closeout — 2026-10-02

## Baseline and scope

- Repository: `pyxm1618/wyrplay`.
- Baseline: freshly fetched `origin/main`, `ea93a6fa37d6aa5bc7ce387623c5fa43769473d7`.
- Repair branch: `codex/finder-final-ui`, isolated managed worktree. Existing homepage work and untracked files in the original checkout were preserved.
- Reviewed current marketing layout, shared header/footer, Finder chrome/experience/cards/filters/styles/domain, illustrated homepage/styles, asset sources, and the two latest Finder/responsive commits.
- Original browser evidence: default first page repeated question-02 **7/10** times; 768px text/art boxes overlapped horizontally by approximately 96px; 390px character extended 65px beyond the viewport; footer computed background was `rgb(24, 27, 33)`.

## Changes and outcomes

| Area | Confirmed problem | Change | Result |
| --- | --- | --- | --- |
| Footer | Shared footer inherited the dark root outside Finder's light boundary | One shared footer with route-owned appearance from a centralized marketing chrome policy; local light tokens | Legal links and shared component retained; Finder footer uses warm `rgb(255, 242, 216)`; other marketing routes keep their existing behavior |
| Tablet cards | Fixed text width competed with absolutely positioned illustration and controls | Explicit grid tracks; tablet text and artwork/action rows | Text, three tags, stats, artwork, bookmark and Select occupy separate space; long copy grows the card |
| Mobile hero | Negative right offset cut off the character | Character fully inside viewport; description has reserved width; 260px composition | No hard clipping, title/description collision or horizontal overflow at 320–430px |
| CSS cascade | Repeated rules and media blocks concealed final behavior | One base rule per selector, component sections, one mobile block, shared compact header layer, tablet layer and final print layer | Base 1251 → 981 lines; responsive 621 → 531 lines; no repeated selectors within the same layer |
| Dead CSS | Prototype dialogs had no production consumers | Remove Finder dialog/player/answer/demo styles, including responsive and print remnants | Production Finder styles contain no abandoned dialog implementation; independent reconstruction/example styles retained |
| Artwork | Broad animal/fantasy regex concentrated unrelated questions on one dinosaur | ID hash, three narrow semantic preferences and bounded allocation against the complete approved bank | Default page uses 9 artworks; max 2 repeats on each original bank page; search/refresh/restore retain each ID's artwork |
| Logo | Native source is only 120×43 | Audit public assets, homepage/Finder reference rasters, reconstruction sources, original brand files and existing larger logos | Preserve exact current wordmark; no equivalent higher-resolution source found; larger available variants add a crown/different composition |
| Header and keyboard | Finder omitted Leaderboard/Create; conflicting login display rule; search focus style was suppressed | Preserve illustrated header, align core destinations, compact menu on tablet, close on navigation/Escape, fix mobile login specificity and input outline | Single-row compact mobile header, menu login entry, working Search focus with visible 3px blue outline |

The shared footer choice preserves legal navigation and avoids maintaining two footer implementations. Finder continues to own a fixed light illustrated surface; no unrelated theme-toggle behavior was introduced.

Artwork mapping stays fixed against the complete approved bank. All **2,160** combinations of the current Age/Relationship/Occasion/Tone/Difficulty filters were audited: the largest per-page repeat count is **4**, on Friends page 5. Arbitrary future keyword subsets are not claimed to have a universal two-repeat bound.

## Coverage and preservation

CSS decision ledger covers 415 reviewed rule/declaration occurrences: 346 retained/pass, 69 obsolete or dead/delete, 0 deferred and 0 unreviewed. Each deletion has a specific runtime-absence, shadowed-cascade or replacement-layout reason. Original total equals the explicit-state sum. Post-cleanup inspection confirmed reconciliation and absence of legacy dialog selectors. The local detailed ledger is `.artifacts/finder-final/css-ledger.json`.

No production question content, permanent IDs, review statuses, vote algorithms, authentication backend, database definitions, payment code, canonical/SEO strategy, GA settings, feature flags, Play/Print/homepage/category product implementations were changed. Local migration commands initialized a newly created isolated test database using existing migrations.

## Browser acceptance

Real Google Chrome was used with Playwright. Local browser configuration selects the installed Chrome channel and localhost port 3100 because the bundled Playwright Chromium installation was incomplete. The committed tests use the repository's existing Playwright setup in CI.

| Viewport | Result | Evidence |
| --- | --- | --- |
| 320×568 | PASS | Single-row compact header, full character, no collisions/overflow |
| 360×800 | PASS | Mobile composition and card flow |
| 375×812 | PASS | Full-page screenshot saved |
| 390×844 | PASS | Full-page screenshot saved |
| 393×852 | PASS | Mobile composition and card flow |
| 414×896 | PASS | Mobile composition and card flow |
| 430×932 | PASS | Mobile composition and card flow |
| 701×900 | PASS | Tablet text/art/control separation |
| 768×1024 | PASS | Full-page screenshot saved |
| 800×900 | PASS | Tablet text/art/control separation |
| 820×1180 | PASS | Tablet text/art/control separation |
| 834×1194 | PASS | Full-page screenshot saved |
| 900×900 | PASS | Tablet text/art/control separation |
| 1024×768 | PASS | Full-page screenshot saved |
| 1099×900 | PASS | Tablet boundary |
| 1280×720 | PASS | Desktop independent tracks |
| 1366×768 | PASS | Desktop independent tracks |
| 1440×900 | PASS | Full-page screenshot saved |
| 1536×864 | PASS | Desktop independent tracks |
| 1920×1080 | PASS | Full-page screenshot saved; bounded directory |
| 2560×1440 | PASS | Full viewport root; functional directory capped at 1240px |

Assertions cover the root width, directory bounds, pairwise card element collisions, character visibility, hero/title/description separation, mobile header height, visible focus, footer appearance, selected card border, stable artwork, and artificially long copy without editing the source bank. Screenshots are retained locally under `.artifacts/finder-final/screenshots/` and in normal Playwright output; the existing CI screenshot artifact upload also collects the new screenshots. Optional analytics consent is declined in the screenshot fixture so it does not obscure the page.

## Interaction regression

| Capability | Result |
| --- | --- |
| Search, clear, popular searches retained, empty state | PASS |
| Draft Age/Tone filters and Apply; all 19 filter options toggled | PASS |
| Save, reload persistence and Unsave | PASS |
| Multi-select across pagination; selected pool | PASS |
| Pagination and stale-page reset | PASS |
| Play selected and filtered pool | PASS |
| Presenter, Escape and return | PASS |
| Print selected pool and preview | PASS |
| Finder session restore | PASS |
| Category route navigation | PASS |
| Mobile menu, anchor close, Escape and focus return | PASS |
| Search keyboard focus and visible outline | PASS |
| Vote GET success, error/retry and real A/B vote/change | PASS |

Vote success and A/B changes used the real local API with the isolated PostgreSQL database. Controlled 503/500 responses test explicit error/retry UI, not fallback statistics.

## Validation commands

Targeted formatting was run with `bun x prettier --write` on the changed TS/TSX/CSS/test files. Repository checks:

```sh
bun run format:check
bun run lint
bun run typecheck
bun run test:unit -- --maxWorkers=1 --no-file-parallelism
bun run test:e2e -- --config .artifacts/finder-final/playwright.local.config.ts tests/e2e/finder-layout.spec.ts tests/e2e/finder.spec.ts tests/e2e/responsive-layout.spec.ts --workers=1
APP_ENV=test CREAT_WEB_E2E_ENABLED_FEATURES=1 GA4_MEASUREMENT_ID=G-E2E0000001 CLARITY_PROJECT_ID=e2eclarity APP_ORIGIN=http://localhost:3100 DATABASE_URL=postgres://milushangdi@localhost:5432/wyrplay_finder_final_20261002 bun run build:test
APP_ENV=production APP_ORIGIN=https://www.wyrplay.com DATABASE_URL=postgres://milushangdi@localhost:5432/wyrplay_finder_final_20261002 bun run build
git diff --check
```

Formatting, lint, typecheck and whitespace checks passed. Unit suite: **58 files / 305 tests passed**. Enabled-profile optimized browser suite: **17 tests passed**, including shared Home/Play/Presenter/Finder/Leaderboard/Auth/Print and 21 public routes at mobile/tablet/desktop. Production-profile Finder browser suite: **9 tests passed**. Final production application build: **PASS**.

Earlier verification issues were resolved before delivery: parallel ESLint unit tests hit the existing 5s timeout, so the complete suite was rerun serially; local disk exhaustion corrupted a generated dev bundle, so only this run's generated cache was rebuilt; enabled-profile build initially lacked its required test analytics IDs; a newly added test initially violated exact optional property typing and was corrected. No test timeout or project configuration was weakened.

## Final self-review

Reviewed final cascade and screenshots again. Regression assertions caught and fixed the mobile login specificity conflict, the 320px header wrap and the suppressed input focus outline. No same-layer selector duplication or abandoned production dialog rules remain. All required layouts and interactions above were checked against the final component grid and actual bank. The low-resolution logo source remains an explicit fidelity constraint; the existing shape was preserved rather than substituted or redrawn.

This is a code/PR closeout, not a production deployment claim. Merge and deployment remain with the owner.

## Changed files

- `docs/ui/finder-final-ui-2026-10-02.md`
- `src/app/(marketing)/home.css`
- `src/components/navigation/marketing-chrome.ts`
- `src/components/navigation/site-footer.tsx`
- `src/components/navigation/site-header.tsx`
- `src/modules/would-you-rather/domain/finder.ts`
- `src/modules/would-you-rather/ui/finder/chrome.tsx`
- `src/modules/would-you-rather/ui/finder/finder-experience.tsx`
- `src/modules/would-you-rather/ui/finder/finder-responsive.css`
- `src/modules/would-you-rather/ui/finder/finder.css`
- `src/modules/would-you-rather/ui/finder/question-card.tsx`
- `tests/e2e/finder-layout.spec.ts`
- `tests/e2e/responsive-layout.spec.ts`
- `tests/unit/would-you-rather/finder.test.ts`
