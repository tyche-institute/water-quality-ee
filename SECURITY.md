# Security Policy

Thanks for taking the time to make `water-quality-ee` / H2O Atlas safer for everyone.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security reports.**

Email instead:

- **Primary:** `security@h2oatlas.ee`
- **Fallback:** `info@h2oatlas.ee` (clearly mark the subject as `SECURITY`)

Include:

- a description of the issue and its potential impact,
- reproduction steps or a proof-of-concept,
- the affected component (Python code, frontend, signed-snapshot pipeline, OG worker, etc.),
- the commit SHA or release version you tested against.

If you would like to send encrypted mail, request our PGP key in your first message; we will reply with the public key.

## Response targets

These are best-effort targets, not contractual guarantees:

| Severity | First reply | Triage | Fix |
|---|---|---|---|
| Critical (RCE, key compromise, data exfiltration) | ≤ 48 hours | ≤ 5 days | ≤ 14 days |
| High (signed-snapshot bypass, auth bypass, leaked secret) | ≤ 72 hours | ≤ 10 days | ≤ 30 days |
| Medium / Low | ≤ 7 days | ≤ 30 days | best effort |

We will keep you in the loop while we triage and fix the issue, and we'll credit you publicly in the release notes unless you ask us not to.

## In scope

- `src/` Python code (data loader, features, evaluate, audit toolkit)
- `frontend/` (Next.js public site at <https://h2oatlas.ee>)
- `og-worker/` (Cloudflare Worker for share previews)
- `analytics-worker/` (Cloudflare Worker for telemetry)
- `scripts/sign_snapshot.py` and the `.aep` signed-snapshot evidence chain
- CI/CD configuration in `.github/workflows/`

## Out of scope

- Vulnerabilities in upstream third-party software (report them upstream — see `NOTICE` for the list)
- Issues in `vtiav.sm.ee` / Terviseamet open-data feed (report to Terviseamet directly)
- Self-XSS in browser developer tools, social engineering of project maintainers, missing security headers without demonstrable impact
- Rate-limiting / volumetric DoS against the public site (we operate behind Cloudflare; pure volumetric DoS is not actionable on our side)

## What this project is **not**

H2O Atlas is a transparency / visualisation service. It is not a medical or safety advisory tool, does not predict future water quality, and does not replace official assessments by Terviseamet. Vulnerabilities that change displayed risk should be reported here; but no model output should be treated as health guidance regardless of correctness.

## Coordinated disclosure

We will work with you on a disclosure timeline. Default is 90 days from initial report, with extensions for complex fixes — discussed transparently.
