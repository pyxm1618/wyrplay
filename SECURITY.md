# WYRPlay security policy

## Scope

This policy applies to the production WYRPlay application and its supporting repository.

Production origin: `https://www.wyrplay.com`.

## Private reporting

Do not open a public issue for a suspected vulnerability. Use GitHub private vulnerability reporting when available, or another approved private channel to the repository owner.

Include the affected commit or route, impact, reproduction conditions, and the minimum evidence needed to validate the issue.

Never include real credentials, database dumps, private user data, payment data, webhook payloads, or unnecessary personal information in a report.

## Severity

- **Critical:** exploitable authentication/authorization bypass, credential disclosure, remote code execution, broad private-data exposure, or unauthorized payment/credit mutation.
- **High:** material confidentiality or integrity failure with realistic exploitation and narrower impact.
- **Medium/Low:** bounded reliability or defense-in-depth issues.

Critical and High findings block release until patched or explicitly contained.

## Current production boundary

Production auth, email, commerce, subscriptions, and credits are currently disabled by `src/config/features.config.ts`. Analytics is enabled behind consent.

Dormant platform code is still security-sensitive because it is exercised by tests and may be activated later. Do not weaken its verification merely because the production feature flag is off.

## Handling

For a security fix, record:

- affected modules and routes;
- migrations or runtime configuration changes;
- verification commands;
- rollback/containment considerations;
- whether credentials must be rotated.

Do not mark an issue resolved until the relevant automated gates and targeted reproduction pass.
