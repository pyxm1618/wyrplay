# CLAUDE.md

## Repository identity

This repository is the production WYRPlay application, not the original `creat-web` starter.

WYRPlay is a non-AI Would You Rather product. Runtime question content is curated data; the application does not call an LLM to generate, rank, review, or recommend questions.

Production origin: `https://www.wyrplay.com`.

## Current stack

- Bun 1.4.4
- Next.js 16.4.1 / React 19.2.8
- TypeScript 5.9.3
- PostgreSQL + Drizzle ORM
- Better Auth 1.6.25
- OpenNext Cloudflare 1.20.10
- Wrangler 4.150.0

Production deploys through GitHub Actions and Cloudflare. There is no Vercel production deployment and no `vercel.json`.

## Product facts

- Canonical question source: `content/question-bank/questions.json`.
- Current contract: 512 formal records and 512 approved records.
- `src/modules/would-you-rather/data/questions.ts` is the deterministic loader/adapter, not a second question bank.
- Only approved questions may enter playable pools or accept normal product votes.
- Question IDs are durable identity. A semantic question change requires a new ID; spelling/punctuation-only corrections may retain the ID.
- The five collection keys are `kids`, `funny`, `hard`, `friends`, and `couples`.
- Question artwork is optional. The current registry contains exactly 21 approved 2:1 masters and must fall back cleanly for all other questions.

## Current production feature state

`src/config/features.config.ts` is authoritative.

Production currently has:

- auth: disabled
- email: disabled
- commerce: disabled
- subscriptions: disabled
- credits: disabled
- analytics: enabled
- GA4: enabled
- Clarity: enabled
- consent required: enabled

Do not infer production activation from dormant platform code or E2E feature profiles.

## Commands

```bash
bun install --frozen-lockfile
bun run dev
bun run format:check
bun run lint
bun run typecheck
bun run test:unit
bun run test:integration
bun run test:contract
bun run db:verify
bun run build
bun run verify
```

Integration tests require an isolated disposable PostgreSQL database. Never point test reset logic at production.

## Deployment and runtime

`.github/workflows/ci.yml` is the release workflow.

Production build:

```bash
bun run build:cloudflare
```

Production deploy:

```bash
bun run deploy:cloudflare
```

`wrangler.jsonc` is the current Cloudflare runtime contract. It defines the production origin, Hyperdrive binding, incremental-cache R2 bucket, Cloudflare Images binding, analytics IDs, and Workers runtime settings.

## Architecture boundaries

- Product logic belongs under `src/modules/would-you-rather`.
- Platform infrastructure belongs under `src/platform`.
- Product modules must not import product config.
- Code outside a product module must use that module's public entry instead of deep-importing internals.
- Platform code must not depend on product modules.
- Existing ESLint rules enforce these boundaries. Do not bypass them.

## Question data

The durable contract is documented in `docs/题库数据契约.md`.

Important distinction:

- raw canonical fields live in `content/question-bank/questions.json`;
- runtime normalized fields are produced by `data/questions.ts`;
- tests define executable invariants.

When documentation conflicts with code or tests, update the documentation rather than inventing a second data model.

## Voting

General-audience and Kids voting have different privacy behavior. Preserve the dedicated Kids privacy path and do not replace it with a persistent child/browser identifier.

Do not fabricate vote totals, substitute demo values for unavailable data, or treat client input as authoritative server state.

## Visual assets

Current approved question images are registered in `src/modules/would-you-rather/data/question-visuals.ts`. External R2 provenance is recorded in `docs/question-visual-assets.md`.

Do not register artwork that has not been explicitly approved. Do not silently remap a visual to another question.

## CI-enforced documentation

These paths are executable release inputs and must not be deleted merely because they look like documentation:

- `SECURITY.md`
- `CHANGELOG.md`
- `docs/建站手册.md`
- `docs/运维/故障处理.md`
- `docs/运维/密钥轮换.md`
- `docs/运维/交易与积分.md`
- `docs/运维/上线检查清单.md`
- `docs/参考/扩展与升级.md`
- `docs/参考/waffo-合约与验收.md`

`scripts/verify-release.ts` reads the first group directly. `scripts/verify-commerce.ts` also verifies exact safety-gate language in the Waffo contract.

## Documentation policy

Do not add archive folders for completed implementation history. Git is the archive.

Keep only:

1. current product/source-of-truth documents;
2. current operating runbooks;
3. machine-verified safety contracts;
4. necessary provenance for external assets.

Do not commit round-by-round screenshots, geometry reports, migration ledgers, acceptance evidence, or closeout reports as permanent documentation.

The standalone `auth-reconstruction`, `home-reconstruction`, `finder-reconstruction`, `leaderboard-reconstruction`, and `examples/draw-ui-preview` directories are outside the production app and outside this documentation closeout.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
