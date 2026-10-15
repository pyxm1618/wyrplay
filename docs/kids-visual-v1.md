# For Kids Visual Questions V1 delivery

Baseline: `5389a92e2768b171e029bdef78547eabcf0b0b1d`. Phase 1/2 decisions are inherited unchanged.

## Cloud resources

- Account: `2863e95f5c58a0facbbd99540209acbb`; active zone: `wyrplay.com`.
- Permanent originals: independent R2 bucket `wyrplay-media` (APAC hint), never `wyrplay-next-cache`.
- Delivery: `https://media.wyrplay.com/questions/v1/`; custom domain with TLS >= 1.2.
- Content-addressed PNG keys, `image/png`, immutable one-year cache headers. Original binaries stay outside Git.
- Next remote allowlist is restricted to HTTPS, this hostname, `/questions/v1/**`, no search string.
- Existing OpenNext `IMAGES` binding performs responsive transformations through `/_next/image`. No additional CMS, Worker, or backend is needed.
- CORS permits GET/HEAD from the www/apex production origins and localhost/127.0.0.1 port 3000 for testing. CSP permits this exact media origin for image display and PDF fetch.
- Canvas image loading sets anonymous CORS before src; both browser-print image elements also use anonymous CORS to prevent a non-CORS browser cache entry from breaking subsequent exports; PDF embeds original PNG bytes.

## Item ledger

Original total 21 = approved 21 + deferred 0 + rejected 0 + unreviewed 0. Upload 21/21; remote byte-hash and CORS readback 21/21. No existing object was overwritten: this new bucket was empty. Concept art is outside the approved batch.

| questionId | R2 object | SHA-256 | approval | upload | HTTPS/hash/CORS |
| --- | --- | --- | --- | --- | --- |
| wyr-000001 | `questions/v1/wyr-000001-4c545c9f541b.png` | `4c545c9f541ba37b3217f9287c9818d83246c096d608794d63b26fd77f2884d1` | Pass | Pass | Pass |
| wyr-000002 | `questions/v1/wyr-000002-5f06e6cdd0ed.png` | `5f06e6cdd0edb128ce60ccc0026aa29eaea0bcd2327c5b58cff192d3872e7b0a` | Pass | Pass | Pass |
| wyr-000003 | `questions/v1/wyr-000003-48f512b245bd.png` | `48f512b245bd7f4d82c0833d5d49b28b4c6eb7231231f0ec4ddb61d8c630a11b` | Pass | Pass | Pass |
| wyr-000004 | `questions/v1/wyr-000004-777310cfaefe.png` | `777310cfaefe12c64f98f817cc8d115ccec3d433febd8b0bdf4a5011d9cca47b` | Pass | Pass | Pass |
| wyr-000005 | `questions/v1/wyr-000005-b10d2489dbc1.png` | `b10d2489dbc14c26d94d908663cbda9a924220a1b125bf19c2aa4a9197a0c48d` | Pass | Pass | Pass |
| wyr-000006 | `questions/v1/wyr-000006-0fd94e77d537.png` | `0fd94e77d5375436ddb92e2b379aaeb52055f57df22272386eadbb81be765d46` | Pass | Pass | Pass |
| wyr-000007 | `questions/v1/wyr-000007-a65fab17d66f.png` | `a65fab17d66f5437a15802a94cd5a303dc1012bbec5d7931f98a39e25bbb5829` | Pass | Pass | Pass |
| wyr-000008 | `questions/v1/wyr-000008-40c10ae0a006.png` | `40c10ae0a00689304417b298e8fad81698ca04a20452f4022c0b3d542f626727` | Pass | Pass | Pass |
| wyr-000009 | `questions/v1/wyr-000009-42ab6be90fcf.png` | `42ab6be90fcfc8e648350bd9439444243c3693c818bd5382e2b019a4b167e098` | Pass | Pass | Pass |
| wyr-000010 | `questions/v1/wyr-000010-1dd6f9cbac36.png` | `1dd6f9cbac361ef4904fb9e1545183546bc514e11cd2f6cb2b1f0fab36794231` | Pass | Pass | Pass |
| wyr-000018 | `questions/v1/wyr-000018-eae810e2eade.png` | `eae810e2eadebcbac9545b3cc4363e8c6fb414b2da8b9febb4d0038b3a9c5d72` | Pass | Pass | Pass |
| wyr-000019 | `questions/v1/wyr-000019-91966b314ce7.png` | `91966b314ce75428199ec2a723450cc6570f31c98d6166f6043a5703b78e6a8c` | Pass | Pass | Pass |
| wyr-000020 | `questions/v1/wyr-000020-0494f0de0d62.png` | `0494f0de0d621eff256262de4c1b326146344dcadbcc7973b63013f1dc08f017` | Pass | Pass | Pass |
| wyr-000021 | `questions/v1/wyr-000021-04fefe864b4b.png` | `04fefe864b4b30e19b50494f4d78722d5cbe6444d8825a18a01c9194269e48be` | Pass | Pass | Pass |
| wyr-000022 | `questions/v1/wyr-000022-b82dedc68f65.png` | `b82dedc68f6577e2ca79cfdbfb503113699e74b5ace54bc3e088eb46e473c2a0` | Pass | Pass | Pass |
| wyr-000023 | `questions/v1/wyr-000023-d330f63c1630.png` | `d330f63c1630f7f45b779c0eb2578606a2d015c9400dbb9d68dd18883a491214` | Pass | Pass | Pass |
| wyr-000024 | `questions/v1/wyr-000024-80f844e2b6e7.png` | `80f844e2b6e7a39e6cb43d78268f9099c63bdd59e8b20927e564bd081a1920e4` | Pass | Pass | Pass |
| wyr-000025 | `questions/v1/wyr-000025-a9d783593e61.png` | `a9d783593e6138b0cb656cb699ec13f925b5fe526e454ac3afb9638d03015843` | Pass | Pass | Pass |
| wyr-000026 | `questions/v1/wyr-000026-5c997ea9dfd3.png` | `5c997ea9dfd37f6d6362f9309e43eb09c983ebbd917d2a1a753dc5503dd1b632` | Pass | Pass | Pass |
| wyr-000027 | `questions/v1/wyr-000027-35709fe372df.png` | `35709fe372dfb9ff70513b994209e70b6dd4eca1594a0aacebc8436acf3b1e75` | Pass | Pass | Pass |
| wyr-000037 | `questions/v1/wyr-000037-852a1b7a5308.png` | `852a1b7a5308d3ba33bd999a849b19bbcd3d5eb051dbef554f18480731eb0596` | Pass | Pass | Pass |

All masters are 1774 × 887. The Chinese lunchbox/backpack source uses the inherited confirmed `wyr-000005` mapping. All other registrations carry the exact source question as alt text.

## Verification

- Unit registry and Canvas CORS tests were observed failing before implementation, then passing.
- Local full unit suite: 73 files / 365 tests passed; typecheck passed; lint has zero errors (three existing warnings).
- Real remote Cloudflare Images preview: 640px WebP response, HTTP 200. This is a remote preview test, not a production app deployment.
- Full original downloads from the custom domain matched all 21 local SHA-256 hashes; all returned the allowed local Origin header.
- Local proxy DNS returns private benchmark-range addresses. Browser verification uses a temporary, ignored Node preload resolving only the media host to public Cloudflare DoH answers and routing its fetches through the existing macOS proxy; production image security settings are unchanged.
- Browser tests use a separate newly created local database `wyrplay_visual_v1_20261015`, migrated from the project journal; no production database is used.

- Real browser end-to-end: Normal Kids and Present at 390px/1440px; A4 2x2 PNG, browser print, and vector PDF all passed. PDF contains four actual 1774x887 master image objects. Native print images use anonymous CORS; this fixed the reproduced browser-cache CORS failure.
- CSS browser containment tests: 2/2 passed; secrets scan and formatting passed.
- Custom-domain ownership and SSL status: active.

## Release boundary

The media resources are live. Application changes are delivered in one scoped PR; PR/CI status is reported separately from deployment. The question-bank file is unchanged, preserving all text, IDs, order and age classification. Existing Normal Kids, Present, and Print consumers share the registry.
