# Product data, homepage SEO and performance closeout

Base: `2c2bd19fbb5a97040b4bd8dc5d956110c9b8d482` (latest `origin/main`, fetched again after verification).

## Scope and coverage ledger

Original work packages = 4; pass = 4; deferred = 0; confirmed reject = 0; unreviewed = 0.

| Package | State | Evidence |
| --- | --- | --- |
| Remove the complete homepage bank | Pass | No directory DOM; 12 approved canonical questions in server-derived props; at most three Trending questions; no canonical bank in downloaded homepage JS |
| Finder stats N+1 | Pass | One page batch request, one grouped SQL query; no identity lookup/cookie; approved 512-question pagination/filtering retained |
| Kids canonical view | Pass | Reviewed and reused PR #69; nine `example-*` mocks removed; all cards/Arena/Presenter derive from approved canonical Kids questions |
| Vote semantics and errors | Pass | Necessary homepage/ranking copy corrected; GET/POST boundary checks retain public 400s; unknown errors logged server-side with stable public 500s |

Canonical inventory: original 512 = approved 512 + deferred 0 + reject 0 + unreviewed 0. After: 512 unchanged, approved 512, duplicate IDs 0.

Kids mock inventory: original 9 = positively confirmed mock/removal 9 + keep 0 + deferred 0 + unreviewed 0. IDs: `example-pets`, `example-home`, `example-food`, `example-trip`, `example-talents`, `example-explore`, `example-hobbies`, `example-time`, `example-dinosaur`. After: 0 mocks. No formal question was deleted, rewritten or added.

The 512 homepage directory items are removed output, not deleted source records. The bank SHA-256 is unchanged: `02d1bf7ce29541267ba36dea7a6188f14121c2ecf7fc047cfb9e4f61f0442159`.

Canonical question source: `content/question-bank/questions.json`. `questions.ts` loads, validates and adapts that source; `collections.ts` contains only existing collection/category metadata. Its extraction and the loader's pure annotations prevent UI-only public exports from downloading the unused bank. No second question bank, CMS, database migration, cache platform or dependency/configuration change was introduced.

## Measured results

Measurements use two actual local production builds with `APP_ENV=production`, Chromium 1440×900, analytics consent denied and the same isolated database snapshot. These are not measurements of a deployed Cloudflare site. The complete observations and SEO fingerprints are in `before.json` and `after.json`.

| Measurement | Before | After |
| --- | ---: | ---: |
| Total canonical questions | 512 | 512 |
| Approved canonical questions | 512 | 512 |
| Duplicate IDs | 0 | 0 |
| Homepage response HTML bytes (decoded UTF-8) | 510290 | 110290 |
| Full-directory question items | 512 | 0 |
| Hydrated document DOM elements | 6609 | 461 |
| Homepage downloaded JS bytes (decoded, homepage only) | 1103273 | 754837 |
| Canonical IDs found in homepage JS | 512 | 0 |
| Finder approved count | 512 | 512 |
| Finder pages (10 per page) | 52 | 52 |
| Finder first-page stats requests | 10 | 1 |

RSC-only transport bytes are not reliably isolated from streamed HTML/shared Next.js transport, so no standalone RSC byte count is claimed. The network regression checks the full HTML/RSC response plus downloaded scripts for excess canonical question text. After, HTML contains only 13 distinct canonical IDs in this snapshot: the 12-question pool and one additional Trending question; the maximum permitted pool plus Trending payload is 15.

## SEO

Keyword: `would you rather questions`. Case-insensitive exact phrase occurrences / visible English words × 100. Excludes script/style/noscript/template, hidden and aria-hidden content, CSS-hidden text, and closed-details content other than its visible summary. Off-screen but normally visible page content is counted. No keyword text was added to replace the directory.

| | Exact occurrences | Visible English words | Density |
| --- | ---: | ---: | ---: |
| Before | 20 | 498 | 4.016064% |
| After | 19 | 495 | 3.838384% |

The one lost occurrence was the removed full-directory summary. Density remains above the suggested natural range; copy was not mechanically adjusted to hit 3%. H1, title, description, canonical (`https://www.wyrplay.com/`), robots (`index, follow`), structured data, FAQ and category links are byte/value-equivalent in the rendered before/after fingerprints. `/questions` and Finder indexing policy are unchanged. Today’s “See all” now opens Finder instead of the removed directory anchor.

Reproduce against running before/after production builds from the repository root:

```bash
CLOSEOUT_BASE_URL=http://localhost:3101 bun scripts/measure-home-closeout.mjs
CLOSEOUT_BASE_URL=http://localhost:3102 bun scripts/measure-home-closeout.mjs
```

The measurement script only navigates and reads; it does not vote or change source/DB records. Vote values in the isolated test DB are test contributions, not production popularity claims.

## Verification

| Check | Result |
| --- | --- |
| `bun run format:check` | Pass |
| `bun run lint` | Pass; 0 errors, 3 pre-existing warnings |
| `bun run typecheck` | Pass |
| `bun run test:unit` | Pass: 72 files, 366 tests |
| `bun run test:integration` | Pass: 38 files, 249 tests, dedicated local `wyrplay_closeout_test` |
| `bun run verify:seo` | Pass |
| `bun run verify:security` | Pass in normal and production modes |
| `bun run verify:performance` | Pass: 20 tests + 1 analytics-enabled test; 4 configuration skips |
| `bun run build` | Pass, including CSP artifact closure; final production build also run by production SEO verification |
| Relevant E2E | Pass: 86/86, one worker, Home/Finder/Kids/Play/Print/Leaderboards/route-link audit |
| `bun run verify:seo:production` | Pass: 4/4 |
| `git diff --check` | Pass |

Regression failures were observed before implementing: full homepage directory; 10 separate stats requests; four vote API paths exposing driver errors. Final network tests check the actual downloaded page and current/next Finder requests, rather than clicks alone. Database integration compares mixed Kids/General batch statistics to real single-question aggregates and observes exactly one query. Existing pagination tests cover every approved ID once and all source-bank pages. Kids vote, age-filter, Presenter and responsive tests use the canonical pool.

The first local parallel E2E run had 84 pass / 2 fail: an unnecessary global network-idle wait in the new Finder test, and a wrong expected search count after bounding the home pool. Both test issues were corrected; the final complete 86-test run passed. A new optional-surface unit fixture initially used incorrect leaderboard field names; it was corrected to the existing domain contract before the successful final typecheck/unit runs.

## Baseline CI and integration

PR #69 was Open at inspection, with base `2c2bd19…` and head `6a200b7…`. Its diff was limited to Kids UI and E2E; formal content, navigation, Auth/payment/Cloudflare were untouched. The integration branch starts at latest main and includes the reviewed Kids commit by cherry-pick. The only additional Kids code adjustment uses the existing pure domain selector instead of importing the bank loader into a Client Component. PR #69 remains Open; do not merge both independently.

PR #54 streaming/Suspense/theme/navigation work, PR #58 hydration isolation, and the subsequent homepage image baseline were inspected and retained. No Header/Footer/Leaderboard IA, image/font pipeline, Print/Presenter engine, Auth/commerce, deployment or Cloudflare configuration was modified.

Latest-main CI before changes: run `38527711140`, quality/performance/clean-setup Pass; E2E Fail with 182 passed and 9 navigation timeouts. Baseline failures: two auth-responsive tests, six auth-ui tests, and route-link crawl. No unrelated remediation was attempted.

PR CI: pending external run after push; record actual result separately, without interpreting the known-red baseline as a new regression. Deployment and merge are not part of this closeout.
