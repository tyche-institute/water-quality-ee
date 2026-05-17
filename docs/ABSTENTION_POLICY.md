# Abstention Policy

Last updated: 2026-05-11

This document defines when the product should avoid strong ML interpretation even if an official status is still available.

## Purpose

`h2oatlas.ee` always keeps the official Terviseamet signal visible.

Abstention applies only to the **strength of ML interpretation**, not to the official label.

## Policy

### `abstain`

Use abstention when either of these is true:

- model probability is missing
- `uncertainty_level = high`

Interpretation:

- do not treat the model score as a reliable public-facing risk estimate
- keep official status visible
- explain that the published parameters are insufficient to reproduce the full decision context

### `caution`

Use caution when either of these is true:

- `uncertainty_level = medium`
- `sparse_published_parameter_coverage` flag is present

Interpretation:

- the model score may still be useful for prioritization
- it should be read as decision support, not as a complete picture

### `normal`

Use normal ML interpretation when:

- `uncertainty_level = low`

## Current operational effect

Current UI implementation:

- selected-place surfaces show explicit uncertainty/publication-gap notices
- official status remains first
- model score remains visible but is visually contextualized by the uncertainty layer

Future UI work can go further by:

- dimming or muting the ML risk chip in `abstain` cases
- replacing numeric probability emphasis with “insufficient published basis”
- allowing filters for low-uncertainty only

## Current baseline from live snapshot

Source: `docs/live_snapshot_evaluation.md`

- abstaining on `high` uncertainty or missing model probability retains **98.5%** of places in the current latest-per-location snapshot
- the abstained set is small but disproportionately important because it contains the irreproducible `hidden_violation` cases

## Non-goals

This policy does not:

- hide official violations
- claim internal knowledge of Terviseamet workflows
- turn the public service into a regulatory decision tool
