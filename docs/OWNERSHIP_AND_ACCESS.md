# Ownership and Access Model

Last updated: 2026-05-11

This file makes one thing explicit: `h2oatlas.ee` is already strong in code and
documentation, but still weak in distributed operational ownership.

Use this document together with:

- `docs/PROGRAM_STATUS.md` for the current readiness baseline
- `docs/OPERATIONS.md` for routine release and rollback flow
- `docs/ROLLBACK_DRILL.md` for rollback rehearsal and incident evidence fields
- `docs/key_management.md` for signing-key and incident specifics
- `docs/ANALYTICS_ACTIVATION.md` for telemetry deployment status

## Purpose

The goal is to reduce hidden maintainer knowledge around:

- signing and verification
- Cloudflare deploy and analytics access
- release go/no-go decisions
- trust wording changes
- incident escalation

## Ownership domains

| Domain | Primary responsibility | What the owner decides | What must not be decided unilaterally |
|---|---|---|---|
| Product / trust | wording, signal ordering, user-facing caveats | copy changes, UX hierarchy, public framing | relaxing trust claims or making official/model parity claims |
| Data / ML | snapshot correctness, feature/rule integrity, drift review | rebuilds, model refreshes, data-quality investigation | overriding official labels or hiding data-quality warnings |
| Frontend / platform | Pages deploys, shell stability, performance budgets | deploy timing, frontend release rollback, shell validation | changing trust semantics without product/trust review |
| Security / provenance | signing path, verification semantics, key incident handling | signature-path wording, incident freeze, key rotation execution | weakening verification language or bypassing incident logging |
| Analytics / operations | event review cadence, funnel interpretation, ops follow-through | telemetry review notes, KPI watchlist, operator summaries | policy claims based on sparse or low-confidence traffic |

## Access boundaries

| Capability | Needed for | Expected holder class | Repo-only fallback? |
|---|---|---|---|
| GitHub write access | merge release changes, trigger workflows, rollback commits | maintainer | no |
| Cloudflare Pages access | inspect deploys, env vars, cache behavior | platform owner | partial |
| Cloudflare Workers + KV access | analytics worker deploy and counter inspection | platform/analytics owner | no |
| Aletheia signing access | official `.aep` evidence package publishing | security/trust owner | partial: local dev signing only |
| Local Node toolchain | frontend lint/typecheck/build parity | any active maintainer | no |
| Python environment with project deps | snapshot build, tests, contract checks | any active maintainer | yes |

## Minimum two-person resilience target

The product is not yet at this target. This is the target:

1. At least two people can run the Python-side release gate.
2. At least two people can run frontend validation locally.
3. At least two people know how to publish or pause signed snapshots.
4. At least two people can inspect analytics counters and interpret the weekly review.
5. No trust-critical copy change ships without a second reviewer.

## Operational decisions that require explicit review

These decisions should not live in one maintainer's head:

- changing verification wording
- shipping a snapshot with stale freshness metadata
- disabling a trust banner or data-gap notice
- rotating signing material after an incident
- changing the public meaning of risk colors or thresholds
- declaring analytics "healthy" from too little traffic

## Practical weekly cadence

### Weekly

- run the Python-side release gate
- inspect snapshot freshness and trust-critical artifacts
- review analytics counters if traffic exists
- note any drift, stale data, or wording mismatches

### Monthly

- review secrets/access concentration
- confirm rollback and incident docs still match the actual platform setup
- check whether product copy, docs, and verification behavior still agree

## Current known concentration risks

- signing and backend-verification knowledge remain concentrated
- Cloudflare deployment and analytics access remain concentrated
- local frontend validation parity is blocked in the current environment without Node
- external outreach remains decision-bound, not automation-bound

## Definition of success

This document is successful only if it changes operating behavior:

- access is explicit
- ownership is explicit
- incident boundaries are explicit
- release responsibility is not inferred from memory
