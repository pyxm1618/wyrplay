# Consolidated frontend submission

All completed local UI work is submitted together because the routes share navigation, question data, account/auth entrypoints, player state, public assets and test configuration. One PR avoids splitting those dependencies across separately mergeable changes. Two commits distinguish standalone design prototypes/calibration baselines from the production frontend integration.

The submitted scope includes Home, Find Questions, Play/Present/Print, Leaderboards, sign-in/sign-up, Account Overview, Saved Questions, My Questions and Settings, their assets, tests and integration notes. Existing feature gates, backend contracts and authentication/commerce configuration are retained. Unsupported submissions, profile edits and notifications are explicitly unavailable.

The initial local inventory contained 24 tracked changes and 3,677 untracked files. Adding the validation-ignore policy brings that inventory to 3,702 items: 840 approved, 2,862 deferred, zero rejected and zero unreviewed. This summary is one additional approved item. The item-level inventory is retained locally in `.artifacts/submission/initial-ledger.json`.

Deferred files remain on disk: local validation runtimes (which may contain session/database state), generated per-region comparison/crop/heatmap PNGs, and generated raster annotations. They are ignored by Git. Reference images, candidate screenshots, SVG annotations, JSON measurements and report summaries are retained with the prototypes. No source, original asset or unknown saved data was deleted.

Multiple-window overlap produced duplicate ESLint and Prettier ignore entries; these were consolidated without changing their intent. Ten upstream font-license text files had trailing spaces; only that whitespace was normalized.

Fresh validation: root formatting, lint, TypeScript, 303 unit tests, 31 contract tests, repository secret verification, SEO/i18n verification, and isolated optimized test-environment build passed. All four standalone prototypes passed their own typecheck, lint and optimized static build. Earlier route-specific browser evidence is recorded in the respective frontend migration documents; this submission did not replay every production browser path. GitHub CI is separate evidence and remains pending when the PR is opened. No merge, production deployment, feature activation, or production database operation is part of this submission.
