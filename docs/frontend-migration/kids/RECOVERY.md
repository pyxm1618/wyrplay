# For Kids page recovery

The archived For Kids implementation existed only in Codex snapshot
`f11038492e03e3bad61bb492d55c242f329f4d5a` (2026-10-04). It was absent from
`main`, where `/would-you-rather-questions-for-kids` rendered the generic landing
page. Its saved reference image is byte-identical to the current user-provided
`UI/for kids.png`.

This change restores the content area: hero illustration, example arena,
age filters, expandable approved question list, classroom/road-trip/dinner
suggestions, FAQ, related categories and closing CTA. The eight illustrated
examples explicitly save no votes. The expanded list uses the current approved
Kids collection and its existing age classifications; no question-bank changes
are included.

The page does not own a header or footer. The existing segment layout renders
`SiteHeader` and `SiteFooter` once; their implementation is unchanged. Shared
navigation consolidation can proceed independently.

Real questions use the current `DuelArena` voting implementation with an added
Kids presentation. Existing response validation, cancellation and request
revision guards remain intact. Kids submissions still use `/api/wyr/kids-vote`
and aggregate-only voting. Presenter navigation and print links use the current
question pool. Example print links use the approved Kids deck.

The recovered WebP artwork retains its original fingerprinted filenames and
responsive hero variants. Some small illustrations and responsive spacing differ
from the original full-page design; this recovery does not certify exact pixel
identity. Navigation and footer follow the shared components by request.

## Validation

Fresh local checks: formatting, lint, typecheck, 324 unit tests, test-environment
optimized build, architecture, secrets, SEO and i18n checks. The recovered Kids
browser suite has 13 passing tests, covering 11 widths (375–1920), real local
database voting, no persistent voter cookie, age filters, keyboard controls,
retry, presenter focus, FAQ, links, horizontal overflow and scoped axe checks.
Historical validation reports were not used as current test results.

Local browser evidence remains in `.artifacts/`; production deployment and
physical printing are outside this PR's validation.
