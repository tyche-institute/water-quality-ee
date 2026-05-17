# Execution Plan

Last updated: 2026-05-11

This is the current autonomous execution plan for moving `h2oatlas.ee` from a strong project to a disciplined public product.

## P0: Stabilize the operating baseline

### Goal

Make the current product repeatable, auditable, and safe to release without hidden assumptions.

### Tasks

1. Harden the release gate with explicit environment diagnostics.
2. Maintain one canonical status view that distinguishes repo-ready from org-ready.
3. Keep trust and verification language machine-checkable across all high-risk surfaces.
4. Keep the release path explicit: build -> export -> sign -> verify -> deploy -> smoke.
5. Make the final go/no-go decision explicit via `docs/RELEASE_DECISION_CHECKLIST.md`.

### Done criteria

- `scripts/verify_release.sh` fails with actionable setup guidance.
- status drift is reduced through one canonical program-status doc
- trust-critical wording remains covered by tests and check scripts
- no P0 work item is marked done only because prose exists

## P1: Reduce architecture drag

### Goal

Lower cognitive load in the heaviest production modules.

### Tasks

1. Split `citizen-service/scripts/build_citizen_snapshot.py` into smaller domain/export steps.
2. Continue decomposing `src/data_loader.py` and large frontend dashboard builders.
3. Isolate locale, trust, and freshness concerns into narrower modules.

### Done criteria

- lower coupling in the largest files
- clearer module boundaries
- targeted tests for each newly-isolated concern

## P1: Tighten public UX

### Goal

Make the product easier to interpret under uncertainty.

### Tasks

1. Make freshness more visible than secondary explainers.
2. Keep official verdict first in every detail flow.
3. Finish shell-level language consistency and define the route-localization strategy.
4. Simplify mobile-first reading of status, date, risk, and provenance.
5. Make stale-data and degraded-confidence states visually explicit, not only textual.

## P2: Operationalize telemetry

### Goal

Convert deployed analytics into a real review loop.

### Tasks

1. Run weekly analytics review from `scripts/review_analytics_kv.py`.
2. Track dashboard-open -> place-selected -> engagement -> verify/share funnel.
3. Add thresholds for action, not just counters for observation.

## P2: De-risk operations and ownership

### Goal

Reduce bus factor across secrets, deploys, and trust-critical workflows.

### Tasks

1. Document secret and platform ownership boundaries.
2. Make signing and rollback steps reproducible by another maintainer.
3. Treat stale data, digest mismatch, and trust-copy regressions as first-class release blockers.

Baseline ownership and access map: `docs/OWNERSHIP_AND_ACCESS.md`.

## 30-day expected outcome

- release path is easier to run correctly
- status is easier to understand correctly
- the next autonomous coding passes can focus on architecture and UX, not ambiguity cleanup
- users can understand the core status/provenance story faster than they can discover secondary model explainers
