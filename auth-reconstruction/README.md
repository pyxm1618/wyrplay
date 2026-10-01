# WYRPLAY registration and sign-in preview

Independent Next.js 16 / React 19 / TypeScript frontend. The original application and earlier homepage/finder prototypes are preserved.

## Run

```sh
cd /Users/milushangdi/Projects/wyrplay/auth-reconstruction
bun install --frozen-lockfile
bun run dev
```

- Sign in: http://127.0.0.1:4189/
- Register: http://127.0.0.1:4189/sign-up/

The current workspace reuses the existing home prototype's dependencies through a local `node_modules` symlink. The package manifest and lockfile allow an independent installation in a separate copy of this directory. `bun run build` creates a static `out/` export; `bun run start` serves it on port 4189.

## Scope

Both supplied 1024×1536 screenshots are the visual baselines at a 1024 CSS px viewport, DPR 1. The screenshots are desktop long-page compositions. Layout, copy, controls, ordinary icons, crown and speech text are editable HTML/CSS/SVG. Logo, characters, decorative clouds, and benefit illustrations are independent reference crops. No entire screenshot is used as the page background. Masking removes screenshot UI from the character assets. Original crops and subsequent versions are retained for evidence.

No backend, login provider, email sender, account creation or persistence is connected. Google displays the preview boundary. Magic Link validates a local email input and explicitly says no email was sent. Search filters three hardcoded demo questions. Main navigation explains the standalone scope. Registration/sign-in links open the corresponding pages. Dialogs support close, Escape and keyboard focus.

## Verification

Final `bun run verify` passed typecheck, lint, and production static build. `bun run verify:browser round-04` passed both routes, image loading, actual Chewy heading-font rendering, demo forms and dialogs, local search and empty results, route switching, and widths 390 / 700 / 1280 in addition to the 1024 screenshot baseline. No runtime errors, failed resources, or API/XHR/fetch requests were observed.

The draw-ui measurement and capture scripts produced geometry reports and image comparisons under `evidence/{login,signup}/round-04/report/`. Both card containers match the measured baseline. This verifies geometry and capture conditions, not an exact font match or zero visual differences. Earlier rounds are intermediate results; browser round 01 failed while attempting to close a native search input with one Escape, and round 02 failed on Next client navigation requests aborted during route switching. The final page uses ordinary static links and explicit dialog closure; round 04 passes.

## Fidelity limits and assets

The source fonts were not supplied. Chewy and Patrick Hand approximate the custom playful typography; the large lettering, speech shape, crown/confetti and some background transitions differ from the screenshot. Mobile layout is an adaptation because there is no mobile reference. The masked character edges are manually traced, not an original transparent source.

Artwork uses native screenshot resolution. No AI-generated asset, detail hallucination or resolution upscale is claimed. No image model was invoked. High-DPR or substantially larger artwork may require separate high-resolution source assets or reviewed regeneration. Regeneration is a redraw, not guaranteed lossless recovery of the original pixels.

Chewy and Patrick Hand were downloaded from the Google Fonts source repository. License texts are stored beside their fonts. Roboto Condensed and Kalam were reused from the existing local reconstruction. `evidence/assets.json`, `refined-assets.json`, and `final-assets.json` record provenance and usage states.
