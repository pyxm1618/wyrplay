# Question Visual Display V2

Base: `11e3f2a15b1f59c7ace58f27d4d3cc1095f76dad` (latest origin/main at branch creation).
Reference: user-approved `ChatGPT 图像 2026年10月8日 18_03_44.png`.

The defect was display geometry: 160px Kids artwork, 180px/80px homepage artwork, and independently capped 100pt print crops. The approved masters and delivery pipeline were already correct.

## Scope

- KidsChoicePanels: full-width square artwork with a smaller, naturally wrapping pink/blue caption; shared by Normal and Kids Present. Existing unregistered cards retain their original markup and styling.
- Kids Present: width follows viewport height so enlarged pictures and existing controls fit together.
- Homepage: enlarge registered artwork, give its labels dark text on pink/blue backing, preserve compact-height behavior. Only illustrated homepages at 901–1100px height inherit the existing title-art height cap so the larger question images and CTA still fit.
- Print: one point-based geometry calculation shared by Canvas, vector PDF and browser-print markup; account for header/QR clearance, card dimensions and both captions. Caption height follows complete wrapped text; unusually long captions retain their full column width when art must shrink.
- sizes describes the expanded source-image width (a square crop displays a master at twice the crop width).

No changes to masters, registry, object keys/hashes, domain, Next Image/Cloudflare delivery, R2, CDN/cache, CORS/CSP, question content or product behavior. A is still the exact left half; B the right half. A4 landscape 2×2, pagination, margins, QR, numbers, cut lines, PNG 300 DPI and original-master PDF embedding are retained.

## Evidence

Local original screenshots and downloads: `.artifacts/question-visual-v2/{before,after}/`.

| Surface | Before crop | After crop | Captures |
| --- | --- | --- | --- |
| Normal | 160px desktop / 118px mobile | 404px desktop / 150px mobile | 1440×900, 1280×720, 390×844 |
| Kids Present | 160px | 501px / 672px | 1440×900, 1920×1080 |
| Homepage | 80px at these heights | 280px / 180px / 228px | 1440×900, 1280×720, 1366×768 |
| A4 cards | 100pt fixed maximum | up to 173.47pt, determined by captions and available height | browser preview, PNG, vector PDF, browser-print PDF |

The before build is unchanged main. Both builds use actual R2 originals and the real local Next image optimizer. The existing ignored local-only DNS/proxy preload is needed for this machine's benchmark-range DNS answers; it is not an application or delivery change. The existing isolated local visual-test database is used, never production data.

## Coverage ledger

Existing registered masters: original 21 = checked/inherited 21 + deferred 0 + rejected 0 + unreviewed 0. No assets uploaded, replaced, removed or re-registered. Browser component coverage checks all 21 through the same layout and checks an unregistered fallback. There are no per-question CSS selectors.

Automated coverage includes card image/caption ratios, exact square layout, A/B equal heights, phone overflow, projector control visibility, existing real-image/crop tests, long-caption print containment, A4/Letter export geometry, 300 DPI, QR and original image embedding. Current E2E screenshots are also written to test output for the existing CI artifact uploader.

CI results belong to the PR's exact commit and are reported separately from local evidence. This PR does not merge or deploy.
