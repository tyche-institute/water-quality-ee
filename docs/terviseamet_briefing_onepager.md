# Terviseamet briefing — one-page summary

> Prepared for follow-up after first contact.
> Source documents: `docs/phase_10_findings.md`, `docs/learning_journey.md`, `docs/terviseamet_inquiry.md`.

## Project in one sentence

**H2O Atlas** is a TalTech machine-learning course project and public map built on top of Terviseamet water-quality open data:
<https://h2oatlas.ee>

It combines:

- official compliance labels from Terviseamet open data,
- latest measured parameters per site,
- model-estimated probability of norm violation,
- a public-facing explanation layer for citizens.

Code and methods are open-source:
<https://github.com/tyche-institute/water-quality-ee>

## Scope

- **69,536 probes**
- **4 domains**: `supluskoha`, `veevark`, `basseinid`, `joogivesi`
- **2021–2026**
- latest public snapshot currently covers ~2,200 latest-per-location points

## What we checked

We built a deterministic norm checker that compares:

- published parameter values in the XML,
- official `hinnang`,
- EU and Estonian thresholds encoded in one shared source of truth (`src/features.py`).

We also ran a parser-parity check across the raw XML files to verify that our parser does not lose any numeric measurement fields.

## Main findings

### 1. XML parser parity is clean

- We scanned the raw XML structure across the cached production files.
- The remaining unparsed tags are metadata, not water measurements.
- **Conclusion:** our parser does **not** lose published numeric measurement parameters.

### 2. Official labels are mostly reproducible from published parameters, but not always

After our own norm corrections and audit refinements:

- **59,958 / 69,536 probes** match between official label and deterministic checker
- **Agreement rate: 86.2%**
- **Residual hidden violations: 2,164 probes (3.1%)**

Meaning:

> these probes are labelled `ei vasta nõuetele`, but no published parameter exceeds the applicable threshold in the open data alone.

### 3. The biggest error we found was on our side, and we corrected it

For `basseinid`, our original free-chlorine norm was too strict.

- old range: `[0.2, 0.6]`
- corrected range: `[0.5, 1.5]`

This single correction improved snapshot agreement from **81.5%** to **90.8%** and removed **214 false hidden-pass cases** in the snapshot audit.

### 4. A large part of the mismatch appears structural, not accidental

Temporal cross-checking suggests that many “missing” parameters are not random omissions:

- for `veevark`, **97.9%** of unmeasured chemistry parameter instances are measured at the same site in other probes;
- for `joogivesi`, the same pattern is **78.4%**;
- for `supluskoha`, chemistry is usually absent by design.

Interpretation:

> part of the open-data mismatch likely reflects monitoring frequency, publication scope, or contextual decision logic rather than parser failure.

## Why we are writing

We are not reporting a software bug in your system.

We are trying to understand the relationship between:

- published XML values,
- the official `hinnang`,
- and the real internal decision process behind compliance.

This matters because we want to describe the limits of the public data accurately and responsibly in our project.

## What we would like to clarify

1. Is the XML a full probe record or a published subset?
2. Is `hinnang` derived only from published parameters?
3. Do site types intentionally have different mandatory parameter profiles?
4. Are some chemistry parameters periodic rather than per-probe?
5. Is there a documented update cadence for the public XML feeds?

## What we can share

If useful, we can send:

- a short audit summary,
- 3 concrete example probes,
- the deterministic norm-checker logic,
- or a quick walkthrough of H2O Atlas.

## Contact packet

Recommended first-contact companion documents:

- `docs/terviseamet_first_email.md`
- `docs/terviseamet_probe_examples.md`
- `docs/terviseamet_inquiry.md`
