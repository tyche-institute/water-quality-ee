# Uncertainty Readiness Plan

Last updated: 2026-05-11

This plan covers the work we can finish before contacting Terviseamet, so the project is already honest about uncertainty, publication gaps, and model limits on its own terms.

## Goal

Raise product rigor without waiting for external data-owner clarification.

That means:

- publish uncertainty and publication-gap signals directly in the live snapshot and UI,
- deepen model evaluation beyond aggregate metrics,
- make release checks semantic, not only syntactic,
- leave a clean residual list of questions for Terviseamet.

## Sequence

### 1. Uncertainty layer in snapshot and UI

Deliverables:

- per-place `audit_bucket`, `data_quality_flags`, `uncertainty_level`
- snapshot-level `uncertainty_summary`
- selected-place UI notices for publication-gap and sparse-coverage cases

Status:

- in progress

### 2. Data-quality / weak-label framing

Deliverables:

- explicit distinction between:
  - official violation reproducible from published parameters
  - official violation not reproducible from published parameters
  - published exceedance without official violation
- docs update explaining that these are weak-label / partial-observation cases, not parser bugs

Status:

- partially covered by step 1 data model; broader docs/UI follow-up still open

### 3. Evaluation package upgrade

Deliverables:

- per-domain metrics as first-class artifacts
- per-domain calibration report
- freshest-slice evaluation
- hard-case evaluation for partial-publication / weak-label subsets

Status:

- not started

### 4. Abstention / low-confidence regime

Deliverables:

- explicit rule for when the UI should avoid overconfident interpretation
- threshold or regime that separates:
  - score available
  - score available but uncertainty elevated
  - abstain / insufficient basis

Status:

- not started

### 5. Release semantics and live disclosure

Deliverables:

- semantic release checks for uncertainty/disclosure fields
- visible "what changed since previous refresh" output
- clearer proximity of live model output to:
  - data freshness
  - model freshness
  - known limitations

Status:

- partially started; release diagnostics exist, semantic disclosure checks still need expansion

### 6. Residual external questions

These remain after the internal work above:

- why some official violations remain irreproducible from published parameters
- whether richer metadata / reason codes / unpublished fields exist
- whether some apparent gaps are true non-measurement vs non-publication

Only after steps 1–5 should we ask Terviseamet to explain the remaining residuals.

## Definition of done before outreach

Before external outreach, the repo should already be able to say:

- which points are affected by publication-gap uncertainty,
- where official and model signals disagree for structural reasons,
- what the model can and cannot support on partial public data,
- what remains unexplained only because open data is incomplete.
