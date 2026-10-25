# WYRPlay question visual assets

Status: current external-asset provenance.

The production registry is `src/modules/would-you-rather/data/question-visuals.ts`. It currently contains exactly 21 approved 2:1 masters. Tests enforce that exact registry and the fallback behavior for unregistered questions.

## Delivery contract

- Host: `https://media.wyrplay.com`
- Prefix: `/questions/v1/`
- Master dimensions: 1774 × 887
- Format: PNG
- Storage: external media R2, separate from the application incremental-cache bucket
- Registry behavior: `questionId -> approved master`
- Unregistered question: no image asset; product must render its normal fallback UI

Do not register an image merely because a file exists. Registration requires explicit product approval for the question-to-art mapping.

## Current approved masters

| Question ID | Object key | SHA-256 |
| --- | --- | --- |
| wyr-000001 | `questions/v1/wyr-000001-4c545c9f541b.png` | `4c545c9f541ba37b3217f9287c9818d83246c096d608794d63b26fd77f2884d1` |
| wyr-000002 | `questions/v1/wyr-000002-5f06e6cdd0ed.png` | `5f06e6cdd0edb128ce60ccc0026aa29eaea0bcd2327c5b58cff192d3872e7b0a` |
| wyr-000003 | `questions/v1/wyr-000003-48f512b245bd.png` | `48f512b245bd7f4d82c0833d5d49b28b4c6eb7231231f0ec4ddb61d8c630a11b` |
| wyr-000004 | `questions/v1/wyr-000004-777310cfaefe.png` | `777310cfaefe12c64f98f817cc8d115ccec3d433febd8b0bdf4a5011d9cca47b` |
| wyr-000005 | `questions/v1/wyr-000005-b10d2489dbc1.png` | `b10d2489dbc14c26d94d908663cbda9a924220a1b125bf19c2aa4a9197a0c48d` |
| wyr-000006 | `questions/v1/wyr-000006-0fd94e77d537.png` | `0fd94e77d5375436ddb92e2b379aaeb52055f57df22272386eadbb81be765d46` |
| wyr-000007 | `questions/v1/wyr-000007-a65fab17d66f.png` | `a65fab17d66f5437a15802a94cd5a303dc1012bbec5d7931f98a39e25bbb5829` |
| wyr-000008 | `questions/v1/wyr-000008-40c10ae0a006.png` | `40c10ae0a00689304417b298e8fad81698ca04a20452f4022c0b3d542f626727` |
| wyr-000009 | `questions/v1/wyr-000009-42ab6be90fcf.png` | `42ab6be90fcfc8e648350bd9439444243c3693c818bd5382e2b019a4b167e098` |
| wyr-000010 | `questions/v1/wyr-000010-1dd6f9cbac36.png` | `1dd6f9cbac361ef4904fb9e1545183546bc514e11cd2f6cb2b1f0fab36794231` |
| wyr-000018 | `questions/v1/wyr-000018-eae810e2eade.png` | `eae810e2eadebcbac9545b3cc4363e8c6fb414b2da8b9febb4d0038b3a9c5d72` |
| wyr-000019 | `questions/v1/wyr-000019-91966b314ce7.png` | `91966b314ce75428199ec2a723450cc6570f31c98d6166f6043a5703b78e6a8c` |
| wyr-000020 | `questions/v1/wyr-000020-0494f0de0d62.png` | `0494f0de0d621eff256262de4c1b326146344dcadbcc7973b63013f1dc08f017` |
| wyr-000021 | `questions/v1/wyr-000021-04fefe864b4b.png` | `04fefe864b4b30e19b50494f4d78722d5cbe6444d8825a18a01c9194269e48be` |
| wyr-000022 | `questions/v1/wyr-000022-b82dedc68f65.png` | `b82dedc68f6577e2ca79cfdbfb503113699e74b5ace54bc3e088eb46e473c2a0` |
| wyr-000023 | `questions/v1/wyr-000023-d330f63c1630.png` | `d330f63c1630f7f45b779c0eb2578606a2d015c9400dbb9d68dd18883a491214` |
| wyr-000024 | `questions/v1/wyr-000024-80f844e2b6e7.png` | `80f844e2b6e7a39e6cb43d78268f9099c63bdd59e8b20927e564bd081a1920e4` |
| wyr-000025 | `questions/v1/wyr-000025-a9d783593e61.png` | `a9d783593e6138b0cb656cb699ec13f925b5fe526e454ac3afb9638d03015843` |
| wyr-000026 | `questions/v1/wyr-000026-5c997ea9dfd3.png` | `5c997ea9dfd37f6d6362f9309e43eb09c983ebbd917d2a1a753dc5503dd1b632` |
| wyr-000027 | `questions/v1/wyr-000027-35709fe372df.png` | `35709fe372dfb9ff70513b994209e70b6dd4eca1594a0aacebc8436acf3b1e75` |
| wyr-000037 | `questions/v1/wyr-000037-852a1b7a5308.png` | `852a1b7a5308d3ba33bd999a849b19bbcd3d5eb051dbef554f18480731eb0596` |

The filename contains the first 12 hex characters of the full SHA-256. If an original binary changes, publish a new content-addressed object and update the registry deliberately; do not overwrite an existing approved key in place.
