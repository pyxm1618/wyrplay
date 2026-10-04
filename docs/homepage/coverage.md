# Homepage product unification coverage

Base main: ea93a6fa37d6aa5bc7ce387623c5fa43769473d7.
Existing untracked design/, public/kids-art/ and ui/kids/ are outside this change.

This ledger records the 10 reviewed homepage surfaces before changing them.

| Surface | State | Evidence and decision |
| --- | --- | --- |
| Features | approved / merge | home.config contains separate three-card grid. Categories, How It Works and Presenter already cover its capabilities; integrate taxonomy and real-vote explanation there. |
| FAQ | approved / replace UI | Three useful answers in home.config; preserve choice and Presenter guidance, replace broad suitability promise with checking question age ratings. Native details in illustrated page. |
| Related Resources | confirmed reject / remove duplicate | All five URLs already covered by IllustratedHome categories via FEATURED_COLLECTIONS. Preserve these entries and test each URL. |
| Final CTA | confirmed reject / remove duplicate | Play, highlights, Create and browse already supply action paths. Static CTA scrolls to the same arena. |
| Footer | approved / variant | Legal links must stay. Existing bg-surface-muted outside home overrides needs explicit illustrated appearance. |
| Logo | approved / replace | Header crops 120x43 PNG. Existing brand asset is icon only; SVG icon plus HTML wordmark. |
| H1 | approved / replace visual | Semantic H1 is correct. Visible 359x190 crop needs HTML lettering using local fonts. |
| Hero / Arena | approved / unify | Static Dog/Cat cards plus separate live arena. Move the single existing DuelArena into Hero, retain its API and state. |
| Theme / responsive | approved / preserve and extend | Latest CSS end has full-bleed and viewport-height layer. Fixed home tokens and no home toggle; theme preferences remain for regular pages. |
| Decorative assets | approved / inspect and preserve | DPR1/2 browser screenshots showed Hero collage joins; replace only that composition with the existing independent hero-background.png. Supporting crops, highlights and bulb hand retained after visual inspection; bulb tested against warm and dark backgrounds. |

Initial total 10 = approved 7 + deferred 1 + confirmed reject 2 + unreviewed 0.
Final total 10 = approved 8 + deferred 0 + confirmed reject 2 + unreviewed 0.
Decorative inspection is resolved by browser evidence, with a targeted Hero composition change only.

## Temporary resource cleanup

Two exact resources created by this task were confirmed disposable after stopping their servers:
- /tmp/wyrplay-home-baseline: git archive of the recorded main; baseline screenshot saved separately. confirmed delete.
- This worktree's .next/dev: generated development compilation/cache only. confirmed delete.

Original 2 = confirmed delete 2 + approved keep 0 + deferred 0 + unreviewed 0.

## Isolated database scope

Integration fixtures may reset only wyr_home_20261002_3200 on local PostgreSQL, a new database created for this task. No production or pre-existing project database is targeted. Original database targets 1 = approved fixture reset 1 + deferred 0 + confirmed reject 0 + unreviewed 0. Integration runs are finished before final browser voting acceptance.
