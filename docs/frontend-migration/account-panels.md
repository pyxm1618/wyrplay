# Account additional panels

The three supplied designs are implemented in the existing Next.js project:

- `/account?view=saved`: Saved Questions; also reached from the account tabs.
- `/account?view=my`: My Questions; also reached from the account tabs.
- `/account/settings`: account settings; reached from the profile Settings button.

These routes retain the account feature gate, authentication guard and inherited noindex policy. No environment requirements, dependencies, auth configuration, migrations or production deployment were changed.

## Data and operations

Saved Questions reads the existing `wyrplay:saved-questions:v1` browser collection and approved question bank. Search, topic/tone filtering, ten-row pagination, checkboxes, individual play, selected `/play?set=...` and selected/filtered `/print?set=...` use real IDs. Votes come from the existing read-only leaderboard aggregate. Successful aggregates supply confirmed zeroes; an unavailable aggregate renders an em dash. Removing a known question preserves every other stored ID, including unavailable IDs. Corrupt or unwritable storage retains its data and shows an error.

Settings displays authenticated identity, verified email status and actual session counts. It uses the original sign-out action, session-management route, delete endpoint and required `DELETE` confirmation. The destructive action itself was not executed in this UI task. A `SESSION_NOT_FRESH` response leaves settings usable and shows a sign-in link instead of displaying a false session count or crashing. Other session errors still propagate.

No submission/ownership model, profile editing workflow or notifications service currently supports the remaining controls. The My Questions layout therefore shows an explicit unavailable state and unknown statistics, rather than sample records or zero counts. Profile/photo/username/bio/email editing and notification preferences remain visibly unavailable. Anonymous votes are not attributed to the logged-in account.

## Visual implementation

The shared header/profile remains consistent with the previously integrated account overview. The new panels reproduce the list layout, search and category controls, rounded rows, creator sidebar, settings sidebar/forms and action sections. Layout and controls are real DOM. Existing local account avatar/bulb illustrations, logo and fonts were reused; no new images were generated.

Reference files were found under `/Users/milushangdi/Desktop/wyr设计稿/` after the originally supplied Desktop paths moved. The three 1024px screenshots were measured as a 1024px CSS implementation convention, not proof of their original DPR.

The saved list contains real, often longer titles and an actual page count. The unavailable submission panel uses an empty state instead of eight invented rows. Settings includes capability notices, the existing deletion policy and typed confirmation, plus an explicit notifications section. These changes affect total height. Cloud backgrounds are CSS approximations, ordinary icons are SVG/emoji, and local fonts are approximations to the reference. This is not a claim of pixel-identical fidelity.

## Verification and artifacts

Validation used a snapshot of current project source, a production-mode test build, Chrome in isolated browser contexts and a new empty local test schema. Public database rows and human browser profiles were not modified. Auth used the real magic-link confirmation flow with test email transport; votes used the real vote API.

- Production build, TypeScript, lint, scoped Prettier and `git diff --check` passed.
- 303 unit tests across 58 files passed.
- Five account browser tests passed, covering identity/login guards, precise favorites removal, corrupt storage, selection/search/pagination, readonly profile, session navigation, invalid delete confirmation and sign-out.
- Additional browser checks passed for a real topic filter, a real vote reflected by the server aggregate, selected print canvas preview, selected play route and the aged-session reauthentication state.
- All three panels were captured at 390, 768, 1024 and 1280 CSS pixels, DPR 1. No horizontal overflow or page errors appeared in final capture.
- SEO and i18n verification passed.

Evidence is under `.artifacts/account-panels/`: coverage ledger, DOM metadata, screenshots, operations results and calibration reports. Final capture rounds are `saved/round-04`, `my/round-05` and `settings/round-04`; first-round and failed-capture evidence is retained. `round-notes.md` records observed tradeoffs. Raw login storage and the owned test schema were removed after validation, and the task's test server was stopped. The normal application remains governed by its existing feature configuration.
