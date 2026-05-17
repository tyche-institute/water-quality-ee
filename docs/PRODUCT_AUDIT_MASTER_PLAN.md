# Product Audit and Master Plan

Last updated: 2026-05-11

This is the whole-product review for `water-quality-ee` / `h2oatlas.ee` from
five lenses at once:

- product usefulness
- architecture and delivery
- UI/UX clarity
- operational trustworthiness
- business viability

The project is already beyond "student demo" quality. The next bar is not more
surface area. The next bar is disciplined productization.

## Executive view

### What is already strong

- The product solves a real public-information problem with credible source data.
- The official-status vs model-risk split is strategically correct.
- The repository already contains release checks, trust-copy guardrails,
  snapshot verification, analytics ingestion, and substantial documentation.
- The frontend architecture has clearly moved away from a monolith.
- The business narrative is unusually strong for a technical repo.

### What is still limiting the product

- Operating knowledge is still more concentrated than the code quality.
- The product message is stronger than the operator model behind it.
- Locale behavior is useful for users but still under-specified for SEO/routing.
- The release path is validated, but go/no-go judgment is still too implicit.
- The dashboard is feature-rich enough that clarity now matters more than adding
  another interaction.

## Review by area

### 1. Functionalities

Current strength:

- interactive nationwide map
- official status layer
- model-assisted risk layer
- per-place detail, measurements, history, verify flow
- multilingual shell
- signed snapshot / evidence workflow

Priority improvements:

1. Preserve "official first, model second, provenance third" everywhere.
2. Make freshness and data gaps more legible than explanatory prose.
3. Treat verification as a trust flow, not as a hidden technical page.
4. Add operator-visible criteria for stale snapshot handling and degraded mode.

### 2. Architecture

Current strength:

- bounded frontend decomposition is already happening
- release gate is centralized
- trust wording is centralized
- analytics worker is isolated from the app

Priority improvements:

1. Keep splitting high-churn files until each module has one reason to change.
2. Reduce cross-layer duplication between docs, release flow, and operator lore.
3. Keep machine-checkable contracts for trust, norms, artifacts, and metadata.
4. Make locale strategy explicit before route growth creates accidental SEO debt.

### 3. UI/UX flow

Current strength:

- strong public-service framing
- good mobile-first posture
- trust messaging is present on critical screens
- `/verify` is no longer buried as a raw technical artifact

Priority improvements:

1. Put freshness, official verdict, and timestamp in the first 5-second scan.
2. Keep model explanations secondary to official status and provenance.
3. Reduce cognitive branching on mobile where map, detail, and explanation compete.
4. Define shell-level locale semantics clearly: one multilingual URL today, route
   localization later when there are true localized pages.

### 4. Documentation and operations

Current strength:

- there is already enough documentation to run the system
- status, ownership, analytics, and operations docs now exist
- the project is unusually well-instrumented for trust-critical wording

Priority improvements:

1. Separate "implemented" from "safe to release" from "safe to delegate".
2. Add an explicit release decision checklist so operators do not improvise.
3. Keep one master plan so roadmap, program status, and execution do not drift.
4. Continue converting narrative docs into auditable operating behavior.

### 5. Business flow and outlook

Current strength:

- strong civic/public-interest positioning
- credible partnership angle
- differentiated trust posture versus generic AI dashboards

Priority improvements:

1. Treat trust and explainability as the product moat, not only the model.
2. Package the product for three audiences separately:
   citizens, partners/regulators, technical reviewers.
3. Use analytics to learn which trust affordances are actually used.
4. Move from "impressive repo" to "reliable service with repeatable stewardship".

## Priority plan

### P0: Release discipline and trust integrity

Goal:
Make every publish decision explicit, reproducible, and conservative.

Actions:

1. Keep `scripts/verify_release.sh` as the single release gate.
2. Add and use a release decision checklist for every production publish.
3. Treat stale freshness, verification mismatch, norm drift, and broken official
   ordering as hard blockers.
4. Keep trust-critical copy centralized and tested.

Expected outcome:

- fewer judgment calls hidden in one maintainer's memory
- clearer go/no-go decisions
- lower risk of shipping a technically green but trust-weak release

### P1: UX clarity under uncertainty

Goal:
Make the product understandable before it becomes more featureful.

Actions:

1. Prioritize date, freshness, official status, and source in the primary scan.
2. Keep model probability and explainers visible but subordinate.
3. Make mobile reading order obvious in detail sheets and info surfaces.
4. Remove misleading SEO/locale signals until localized routes really exist.

Expected outcome:

- faster comprehension
- lower misread risk
- stronger trust with non-technical users

### P1: Architecture drag reduction

Goal:
Lower cognitive load for future changes.

Actions:

1. Continue decomposition of snapshot builder and data loader.
2. Keep dashboard subdomains isolated: translations, trust, map environment,
   actions, preferences, freshness.
3. Add narrowly-scoped tests whenever a large file is split.

Expected outcome:

- lower regression risk
- faster autonomous passes
- easier handoff to another maintainer

### P2: Operational maturity

Goal:
Turn "repo-ready" into "operator-ready".

Actions:

1. Maintain explicit ownership and access boundaries.
2. Run weekly analytics review and monthly access review.
3. Rehearse rollback and degraded-mode handling from docs, not from memory.

Expected outcome:

- lower bus factor
- more honest production readiness
- smoother incident response

### P2: Business expansion readiness

Goal:
Prepare for external trust and partnerships without overclaiming.

Actions:

1. Keep separate collateral for citizens, partners, and technical evaluators.
2. Use the verify/evidence flow as a differentiator in outreach.
3. Keep claims narrower than ambition: useful decision support, not safety oracle.

Expected outcome:

- stronger partner credibility
- cleaner external narrative
- less reputational risk

## Immediate execution completed in this pass

This pass executes the highest-value near-term improvements that fit safely on
top of the existing work:

1. Add this whole-product master plan so there is one auditable top-level review.
2. Add an explicit release decision checklist for go/no-go judgment.
3. Align operations/status docs around that checklist.
4. Tighten locale/SEO semantics so the site does not advertise fake localized
   alternates before localized routes actually exist.

## Verified baseline in this continuation

This continuation validated the actual production baseline rather than relying
only on previous notes:

- `./scripts/verify_release.sh` passed end-to-end on 2026-05-11 in the current
  WSL environment.
- Python checks passed:
  trust claims, data/ML contracts, frontend/backend norm sync, `173` pytest tests.
- Frontend checks passed:
  `lint`, `typecheck`, and production `next build`.
- The app-shell metadata was tightened again so the root layout no longer emits
  misleading Open Graph locale alternates for a single multilingual URL.

That means the remaining work is not "make the repo green". The remaining work
is primarily product hardening, operating-model hardening, and UX simplification.

## Detailed remaining plan by priority

### P0: Trust-safe operations

1. Make release judgment reproducible by another maintainer, not only by the
   current owner.
2. Rehearse the full publish chain on a second machine or second maintainer
   account: build -> export -> sign -> verify -> deploy -> smoke.
3. Turn `docs/RELEASE_DECISION_CHECKLIST.md` into a required PR/release artifact
   rather than an optional note.
4. Add an explicit stale-data threshold policy:
   exact freshness windows for weekly refresh, manual refresh, and degraded mode.
5. Add one rollback drill from docs only, without relying on unstated memory.

### P1: Product comprehension in the first 5 seconds

1. Re-rank the selected-place surface so the visual order is:
   timestamp -> official status -> source/provenance -> model context.
2. Reduce mobile cognitive load in the detail sheet:
   fewer simultaneous expandable surfaces, clearer "official" vs "model" sections.
3. Add stronger stale/fresh visual states when `generated_at` or `model_trained_at`
   age exceeds the product policy.
4. Keep `/verify` discoverable from trust-critical surfaces, not only from the footer
   or signed badge.

### P1: Architecture and maintainability

1. Continue shrinking the two remaining high-churn Python files:
   `citizen-service/scripts/build_citizen_snapshot.py` and `src/data_loader.py`.
2. Extract domain helper modules by responsibility, not by file size alone:
   geocoding/cache IO, snapshot-envelope export, opendata parser utilities,
   domain-specific XML mappings.
3. Add line-count and import-boundary tests for the next decomposition wave so
   monoliths do not regrow silently.

### P1: Public metadata and route strategy

1. Keep the single-URL multilingual posture conservative until route-localized
   pages exist.
2. If route-level localization is started, treat it as a real product initiative:
   canonical routes, internal links, analytics segmentation, docs, and release checks.
3. Avoid per-locale SEO claims before server-rendered shell text is locale-aware.

### P2: Operational telemetry and product learning

1. Run weekly analytics review against the deployed worker and record findings.
2. Define intervention thresholds, not only dashboards:
   low verify usage, low share usage, low selected-place engagement, high bounce.
3. Use telemetry to decide which trust surfaces users actually touch before adding
   more explanation UI.

### P2: Business readiness

1. Package three explicit narratives:
   citizen trust, partner/regulator credibility, technical-review rigor.
2. Prepare one short evidence-backed partnership memo using actual product
   screenshots, verification flow, and data provenance.
3. Keep all external claims narrower than the ambition:
   decision support and transparency, not certification or safety guarantee.

### P3: Expansion only after the baseline holds

1. Route-localized pages.
2. Deeper comparative history views.
3. More partner-facing evidence exports.
4. Additional acquisition/retention loops once trust comprehension is already strong.

## Success metric for the next phase

The next phase is successful if the product becomes:

- easier to release correctly
- easier to understand correctly
- harder to overclaim
- easier to hand over
