# WYRPlay

WYRPlay is a production **Would You Rather** application for browsing reviewed questions, playing online, presenting questions to groups, printing question sets, and viewing community voting results.

**Live website:** https://www.wyrplay.com

## What WYRPlay does

- Browse reviewed Would You Rather questions and category collections.
- Find questions by audience, occasion, tone, difficulty, and other editorial filters.
- Play questions online, including Presenter mode for groups and classrooms.
- Build printable question sets.
- Vote anonymously and view stored aggregate results.
- Explore leaderboards and public question collections.

## Current product

- Canonical question source: `content/question-bank/questions.json`.
- Current formal pool: 512 questions; the current contract test requires all 512 to be `approved`.
- Core public surfaces: Home, Find Questions, Play (including Presenter mode), Print, Leaderboards, All Categories (`/questions`), and five public SEO collections.
- Anonymous voting is persisted in PostgreSQL. Kids voting uses the stricter child-directed privacy path implemented by the product.
- Production analytics uses consent-gated GA4 and Microsoft Clarity.
- Production auth, email, commerce, subscriptions, and credits are disabled by `src/config/features.config.ts`. Their platform code remains in the repository for tests and future activation.
- Production deployment is GitHub Actions -> OpenNext for Cloudflare -> Cloudflare Workers.
- Production runtime configuration lives in `wrangler.jsonc`, including Hyperdrive, the incremental-cache R2 bucket, and Cloudflare Images.

## Toolchain

- Bun 1.4.4
- Next.js 16.4.1
- React 19.2.8
- PostgreSQL / Drizzle ORM
- Better Auth 1.7.15
- OpenNext Cloudflare 1.20.12
- Wrangler 4.150.0

## Local development and verification

Install dependencies:

```bash
bun install --frozen-lockfile
```

Common verification commands:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test:unit
bun run test:integration
bun run test:contract
bun run build
```

The full release gate is `bun run verify`. CI also runs database restore, browser regression and E2E coverage, performance checks, clean-setup verification, a Cloudflare production build, and Hyperdrive proxy checks.

## Sources of truth

- Product direction: `docs/product-direction.md`
- Question contract: `docs/题库数据契约.md`
- Canonical questions: `content/question-bank/questions.json`
- Question artwork registry: `src/modules/would-you-rather/data/question-visuals.ts`
- Artwork provenance: `docs/question-visual-assets.md`
- Routes / SEO: `src/config/routes.config.ts`
- Feature state: `src/config/features.config.ts`
- Legal facts: `src/config/legal.config.ts`
- Production runtime: `wrangler.jsonc`
- Release workflow: `.github/workflows/ci.yml`

## Security

Security reporting and current production security boundaries are documented in [`SECURITY.md`](SECURITY.md).

Do not open a public issue containing credentials, private user data, payment data, or other sensitive security material.

## License

This repository does not currently grant an open-source license for the WYRPlay application source code or first-party project assets.

Third-party components and assets remain subject to their respective licenses and notices.

## Documentation policy

The working tree keeps only current sources of truth, current operating procedures, machine-verified safety contracts, and external-asset provenance. Completed migration plans, visual calibration rounds, acceptance ledgers, screenshots, and closeout reports belong in Git history rather than permanent documentation.

The standalone `*-reconstruction` and `examples/draw-ui-preview` prototypes are outside this documentation closeout and are not production application code.
