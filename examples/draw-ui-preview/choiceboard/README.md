# wyrplay Choiceboard UI Preview

An independent HTML/CSS/JS prototype based on the current wyrplay routes, taxonomy, question source, and account flow. It is isolated from the production app and has no runtime dependencies.

## Run locally

From the repository root:

```bash
python3 -m http.server 4173 --directory examples/draw-ui-preview/choiceboard --bind 127.0.0.1
```

Open <http://127.0.0.1:4173/>. The prototype uses hash routes, so every screen remains a static-file page.

## Preview routes

- Home: `http://127.0.0.1:4173/#/home`
- Kids collection: `http://127.0.0.1:4173/#/category/kids`
- Friends collection: `http://127.0.0.1:4173/#/category/friends`
- Play before voting: `http://127.0.0.1:4173/#/play?question=wyr-004`
- Example result state: `http://127.0.0.1:4173/#/result`
- Sign in / register entry: `http://127.0.0.1:4173/#/sign-in`
- Account overview: `http://127.0.0.1:4173/#/account`
- Design system: `http://127.0.0.1:4173/#/design-system`

The Home page links to all configured age, relationship, occasion, and tone examples. The category template also includes search and related-category navigation.

## Product facts represented in this preview

- The checked-out question source has 104 rows, all with `reviewStatus: unreviewed`; the playable approved set is empty. The 17 question examples in this prototype are source rows, not newly authored questions.
- Existing audience, relationship, occasion, tone, and difficulty labels are shown as draft tags where relevant. Structured filter controls stay disabled because those source tags have not completed review. Search only filters the visible examples.
- A/B result percentages and `1,284 sample votes` are deliberately illustrative layout data. They are not wyrplay vote results. Choosing A or B changes only local preview state; the page does not call APIs or store a vote.
- The current sign-in route uses a one-time email link, Turnstile, and no password. The form here validates locally and sends no email.
- The account flow has an overview plus Credits, Billing, and Security/Deletion routes. The account prototype uses example identity text only; it does not load a session. There is no current Would You Rather history or saved-question feature, so those areas are honest empty/unavailable states.

## Files

- `index.html` — all prototype pages and semantic structure
- `prototype.css` — isolated design tokens, components, responsive styles, and reduced-motion treatment
- `prototype.js` — local navigation, search, A/B selection, illustrative result state, theme toggle, sign-in feedback, and presenter dialog
- `DESIGN-NOTES.md` — visual rationale and suggested production component mapping
- `screenshots/` — browser captures from the desktop and mobile review

No production app file is imported or modified by this prototype. The other files already present in the parent `examples/draw-ui-preview/` directory were left untouched by this standalone version.
