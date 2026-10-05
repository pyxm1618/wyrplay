# Account bounded final closeout — 2026-10-04

Scope ledger: 10 items. Initial review reconciled: 4 confirmed fixes + 0 deferred + 6 pass/preserve + 0 unreviewed = 10.

| Item | Positive evidence / decision | State |
| --- | --- | --- |
| Merge main | Live origin/main a725948, 49 commits ahead of prior merge base. Preserve all upstream pages. Kids and Account both used migration 0014: retain upstream snapshot/journal, sequence Account as 0015 with combined schema; unchanged SQL | pass |
| Mobile form fonts | Saved search CSS 12px; bound 16px rule to Account form controls <=700px | pass |
| Small warm labels | Yellow #ffe7b7 / #e77300 and pink labels have low contrast; darken text only | pass |
| Record display | Billing schema, ProductDefinition and catalog have no displayName. Add optional catalog name, exact key/version matching; unnamed records honestly describe billing model. Billing/Credits raw ISO converted to explicit UTC date/time | pass |
| Buttons | Fresh 375px Security/Billing/Credits screenshots show unified cream cards and outlined actions; keep existing classes | pass |
| Mobile navigation | Existing 375px screenshot has visible primary links and scrollable tabs; preserve layout, verify 390px too | pass |
| Native menu | Optional scoped outside pointer, Escape with focus restoration, and item click dismissal | pass |
| Art and fonts | Existing three WebP assets preserved; verify alpha and visible edges. Preserve TTF, weights, transforms, widths, smoothing | pass |
| Saved boundary | Composite PK, user cascade, authenticated remote / guest local, additive import and no overwrite on failure retained; rerun contract and browser cases | pass |
| Checkout boundary | Strict UUID validation and server status retained; rerun abc query and advisory-status tests | pass |

Runtime scope: only `.artifacts/postgres-account-final` on 127.0.0.1:55440, database `wyrplay_account_test`, is reset for test suites. No production data, upstream user worktree or other database cluster is modified. Existing baseline evidence is preserved; final evidence is stored under `.artifacts/account/final-2026-10-04/` and ignored by Git.

Final coverage: 10 pass + 0 deferred + 0 confirmed outstanding fixes/rejects + 0 unreviewed = 10 original items.

## Final verification

- lint: PASS, zero errors; typecheck: PASS; standalone `bun run build`: PASS, exit 0, separate `build.log` and `build-exit.txt`.
- unit: 315/315, 60 files; integration: 248/248, 38 files; contract: 31/31, one file.
- browser: 36/36, eight test files, ten widths (320/360/375/390/768/1024/1120/1200/1440/1920). Account route matrix produces screenshots at 375/390/768/1024/1200/1440. No horizontal page overflow or Account matrix console/hydration errors. Mobile text controls were focused and computed font sizes checked at >=16px. Native menu item/outside/Escape behavior passed.
- migration verification: empty-to-latest and existing chain-to-latest pass, including combined Kids privacy and saved table metadata. Saved concurrency, isolation, uniqueness, cascade, unknown IDs, cross-device save/remove/refresh, guest storage, and failed additive import are covered.
- Checkout Return `?order=abc&status=success` displays not-found rather than PostgreSQL failure; fixture pending order remains pending despite browser success parameter.
- Contrast: #985000 on #ffe7b7 = 4.9866:1; #b51c3c on #ffdde6 = 5.2368:1. Real rendered label computed colors pass >=4.5:1 browser assertions.
- WebP alpha: bulb RGBA 448x512 (0,255); avatar RGBA 512x512 (0,255); travel RGBA 512x363 (0,255). Inspected source images and real cream-background screenshots: no conspicuous white halo/jagged edge at displayed sizes. No asset regeneration.
- Fresh 375/390px navigation screenshots show accessible profile/settings links and horizontally scrollable full tabs, with no page overflow. Navigation spacing/layout and button styles were preserved.
- Existing odd font sizes outside mobile text controls, TTF files, font weights/smoothing, decorative transforms, 1440px widths and Account architecture were preserved. No dependencies or runtime/deployment configuration were changed.

The first parallel typecheck read generated `.next` types during their replacement; preserved failed log. A subsequent build exposed unchecked array indexing in the new contrast test, which was corrected. Final build, typecheck and browser were run without overlapping build/typecheck operations and passed. Failed logs remain separate from final evidence.

Billing's configured optional `displayName` takes precedence for the exact key/version. There is no existing official name in the database or catalog; unnamed products show their true billing model (Monthly subscription / Annual subscription / One-time purchase), never an invented brand or a fixture key as the primary title. Payment/order schema and commerce state/action logic are unchanged. Billing/Credits dense records are isolated fixtures, not real provider/payment receipts.

Latest fetched `origin/main`: a725948af2250481fb832721135435a76d719f12, included by merge 2a2de4c. Final Git checks and commit identity are recorded in ignored `git-final.txt`. No production migration/deployment or provider transaction was performed.
