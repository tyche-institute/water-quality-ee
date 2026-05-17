# Product Definition

## One-Sentence Positioning

`h2oatlas.ee` is a public water-quality transparency product that helps citizens inspect the latest official status of Estonian water sites and compare it with a clearly secondary ML risk estimate.

## Primary Users

1. Citizens checking beaches, pools, SPA sites, and drinking-water points
2. Journalists and civic observers looking for anomalies or trends
3. Maintainers validating data quality, trust messaging, and release health

## Core User Jobs

1. Find a place quickly
2. Understand whether the latest official sample passed or failed
3. Understand whether the model sees elevated risk
4. Inspect measurements and recent history
5. Share a specific place or snapshot with others

## Product Principles

1. Official signal first
2. Model signal second
3. Trust wording must be literal, not aspirational
4. Public UX must stay interpretable on mobile
5. Freshness and provenance matter as much as prediction quality

## What The Product Is

- a public-facing visualisation layer over already-public Terviseamet data
- a trust-conscious ML-assisted decision-support interface
- a showcase of transparent provenance, signed artifacts, and explicit model limitations

## What The Product Is Not

- not a regulator
- not a medical advisor
- not a real-time safety monitor
- not a future-quality predictor
- not a replacement for official sampling workflows

## Current Product Surface

- interactive map
- per-place detail panel
- official status + model probability
- measurement explanations
- sample history
- watchlist
- multilingual UI
- signed snapshot verification page

## Strategic Wedge

The most credible near-term wedge is:

public-interest transparency product first, ML/compliance showcase second.

That means:

- trust and clarity beat feature count
- release discipline matters more than adding more model outputs
- operations and documentation are product work, not back-office work

## Near-Term Priorities

### P0

- never overstate verification or signature guarantees
- official backend evidence packages are cryptographically verified in-browser; legacy backend self-bundled snapshots remain integrity-focused and not fully signature-verified
- preserve official > model > provenance ordering everywhere
- make snapshot freshness obvious
- keep frontend norm explanations on the same source-of-truth as backend model rules

### P1

- keep decomposing the dashboard into bounded components/hooks
- finish app-shell i18n consistency
- tighten share/SEO metadata consistency

### P2

- improve observability for user journeys and trust events
- add explicit stale-data and data-gap messaging where needed
- formalise release checklists and incident handling

## Success Metrics

Product health should be measured with:

- successful page loads
- search-to-place-selection rate
- selected-place history open rate
- verify-page usage
- share action usage
- error rate on data fetches
- median frontend load time
- snapshot freshness lag

## 30 / 60 / 90 Day Direction

### 30 days

- stabilise trust language
- reduce `Dashboard.tsx` further
- complete ops + product source-of-truth docs

### 60 days

- finish shell-level i18n consistency
- add better analytics and release gates
- refine detail-panel UX for mobile and desktop

### 90 days

- ship a cleaner product narrative for public launch and partnerships
- add drift / freshness / provenance monitoring as explicit release criteria
- prepare a partnership-ready deck for municipalities, NGOs, or Terviseamet dialogue
