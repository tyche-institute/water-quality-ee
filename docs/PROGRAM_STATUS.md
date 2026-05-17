# Program Status

Last updated: 2026-05-11

This file separates three states that were previously blurred together:

- `repo-ready`: implemented and validated inside the repository
- `live-ready`: safe to operate in production with the current docs and tooling
- `org-ready`: can be sustained without hidden maintainer knowledge

## Current baseline

| Area | Repo-ready | Live-ready | Org-ready | Notes |
|---|---|---|---|---|
| Trust wording and verification posture | Yes | Mostly | No | High-risk copy is centralized and checked, but ongoing wording review still depends on a single maintainer. |
| Frontend shell and verify UX | Yes | Mostly | No | `/verify` is aligned with the product shell, but locale SEO and full shell i18n are not complete. |
| Snapshot build/export/sign flow | Yes | Mostly | No | The path exists and is documented, but still has maintainer knowledge and secret coupling. |
| Release gate | Yes | Mostly | No | `scripts/verify_release.sh` exists, environment diagnostics are better, and freshness thresholds are now explicit; the full release path still depends on local setup parity. |
| Analytics ingestion and review | Yes | Yes | No | Worker, KV, smoke script, and review script exist; the remaining gap is operating cadence and shared ownership. |
| Product documentation | Yes | Yes | Mostly | Product, ops, model, dataset, and partnership docs are strong, but status can still drift without one canonical status page. |
| Business/partnership packaging | Yes | Yes | No | Narrative and Terviseamet outreach packet are ready; actual external motion still requires supervisor sign-off and owner commitment. |

## What is actually done

- The repo now contains a credible public-trust product stack, not only research artifacts.
- The trust/verify surface has machine-checkable guardrails.
- The dashboard architecture has been decomposed away from a single render monolith.
- Frontend payload strategy and analytics ingestion have both moved from idea to implementation.
- Freshness/staleness thresholds now drive visible map, detail, and diagnostics states instead of living only in prose.
- The full local release gate was re-validated on 2026-05-11 in WSL:
  Python contracts/tests plus frontend lint/typecheck/build all passed.

## What is not actually done

- The system is not yet operator-independent.
- Production readiness is still stronger in code and docs than in team operating model.
- "Done in the repo" is ahead of "safe to run repeatedly by any maintainer."
- The product is still easier to admire than to delegate.

## Current P0 priorities

1. Make the release path reproducible on any maintainer machine.
2. Reduce hidden operational knowledge around signing, deploy, and incident response.
3. Keep trust claims exact across UI, docs, SEO, and verification flows.
4. Preserve official > model > provenance ordering under every future feature change.
5. Use `docs/RELEASE_DECISION_CHECKLIST.md` so "green build" is not mistaken for "safe release".

Operational ownership baseline: `docs/OWNERSHIP_AND_ACCESS.md`.

## Current P1 priorities

1. Finish shell-level language consistency and locale-aware routing strategy.
2. Continue decomposing the citizen snapshot and dashboard heavy modules.
3. Turn analytics from a deployed endpoint into a weekly decision loop.
4. Keep explicit freshness/staleness rules synchronized across release docs, live smoke, UI criteria, and visual degraded-state styling.

## Blockers that are outside pure repo work

- Cloudflare and signing ownership are still concentrated.
- External outreach to Terviseamet/partners is a business decision, not an autonomous coding task.
- A true multi-maintainer operating model needs human assignment of owners.

## Definition of "awesome product" for this repo

The next quality bar is not "more features". It is:

- trustworthy by default
- understandable in 5 seconds
- reproducible to release
- resilient to maintainer turnover
- credible to citizens, journalists, partners, and technical reviewers
