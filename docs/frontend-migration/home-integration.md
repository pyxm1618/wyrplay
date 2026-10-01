# Homepage frontend integration

The approved homepage prototype is now part of the actual marketing route. The existing vote API, database schema, formal question bank, filter state, keyboard behavior and Presenter Modal are retained.

- Dog/cat hero cards are decorative and cannot submit votes. The main CTA targets the live arena below.
- Counts use the approved question bank and actual collection helpers; no sample player, country or testimonial metrics are shown.
- Homepage rankings consume the same read-only `getLeaderboardSnapshot` as `/leaderboards`. Unavailable data is never rendered as zero; confirmed empty rankings invite the first vote.
- `/find-questions` and `/leaderboards` link to the pages added by concurrent work. `/create` is the placeholder explicitly approved by the user.
- Illustrated styles are scoped to the homepage. Category landing pages keep their existing presentation and business behavior.
- Interactive controls wait for hydration so an early click is not silently lost. Browser tests wait for that explicit readiness signal.
- Long question-directory and explanatory sections can be expanded; their contents and links remain rendered.

Assets in `public/home-art` reuse the original reference crops and previously approved prototype artwork. `highlights.png` is a newly generated three-panel illustration matching the three actual editorial questions. Text and controls remain HTML. Font licenses are preserved in `public/home-fonts`.

Evidence and scope reconciliation: `.artifacts/home-integration`. Build validation uses an isolated copy under `/tmp` to avoid changing concurrent preview output. No deployment or commit was performed.
