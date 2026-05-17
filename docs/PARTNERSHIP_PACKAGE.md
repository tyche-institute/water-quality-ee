# Partnership Package

## One-page narrative

`h2oatlas.ee` is a public water-quality transparency product built on top of
already-public Terviseamet data. It helps citizens, journalists, and civic
observers inspect the latest official status of Estonian water sites and
compare it with a clearly secondary ML risk estimate.

The product's core promise is not prediction theatre. It is **trustworthy
public visibility**:

- official signal first
- model signal second
- provenance and freshness always visible

This makes the product useful in settings where public understanding matters
more than raw model novelty:

- citizens checking beaches, pools, or drinking-water sites
- journalists investigating anomalies or coverage gaps
- institutions validating how open-data publication behaves in practice

The project's strongest differentiator is that it treats trust and operations
as part of the product:

- signed snapshot verification
- explicit model limitations
- data-gap warning based on a full audit of 69,536 probes
- release runbook, rollback rules, drift monitoring, and trust wording checks

In short: **public-interest transparency product first, ML showcase second**.

## Stakeholder matrix

| Stakeholder | Primary value | Main concern | Recommended message |
|---|---|---|---|
| Citizens | Fast place lookup, latest official status, understandable risk context | Misreading the model as an official verdict | "Official result first; model is advisory only." |
| Journalists | Searchable anomaly surface, place history, shareable links | Overclaiming certainty | "Use the tool to spot patterns, then verify with source data." |
| NGOs / civic groups | Public transparency layer over difficult raw data | Long-term maintainability | "The product is built around explicit provenance and reproducible releases." |
| Municipalities | Public communication aid, regional visibility | Liability and false alarms | "This does not replace Terviseamet; it clarifies published information." |
| Terviseamet | External audit signal, public-facing map, cooperation artifact | Misrepresentation of authority | "Your official label remains authoritative everywhere in the UI." |
| TalTech / academic partners | Strong applied ML + trustworthy delivery case | Academic vs product identity confusion | "Research output was turned into an operational public service." |

## Proof points

- **69,536 probes** across **4 domains** and **6 years**
- **2,196 public locations** on the live map
- **LightGBM AUC 0.984**
- **94.9% recall on violations** at **80% precision**
- **Full audit** found **3.1% hidden violations** not reproducible from published parameters alone
- **XML parity scan:** zero measurement parameters lost by the parser
- **Signed evidence package** flow with browser-side verification support

## Trust posture for external conversations

Always say:

- The official Terviseamet status is authoritative.
- The model is advisory and probabilistic.
- The product does not claim real-time safety.
- The product does not replace a laboratory decision or medical advice.
- Some official outcomes depend on context not present in the open data.

Never say:

- "The model decides whether the water is safe."
- "The verification page proves all bundles cryptographically the same way."
- "The map shows real-time water quality."
- "The product replaces official monitoring."

## Suggested partnership angles

### 1. Public transparency angle

Offer the product as a citizen-facing interpretive layer over existing open
data, with clear attribution to Terviseamet.

### 2. Data-quality angle

Offer the deterministic audit tooling and findings as a reusable quality-check
artifact for open-data publication workflows.

### 3. Civic-tech / education angle

Present the project as a case study in how academic ML work can be turned into
a disciplined public-interest service instead of stopping at a notebook demo.

## Deck inputs

For a short external deck, keep the order:

1. Problem: open data exists, but is hard for the public to interpret.
2. Product: map with official status first, model context second.
3. Evidence: metrics, audit, parser parity, signed snapshots.
4. Trust: what the tool is and is not.
5. Stakeholder fit: citizens, journalists, civic institutions.
6. Cooperation ask: feedback, linking, pilot usage, or data-publication dialogue.

## Recommended companion docs

- Product definition: `docs/PRODUCT.md`
- Operations: `docs/OPERATIONS.md`
- Model card: `docs/model_card.md`
- Datasheet: `docs/datasheet.md`
- Audit findings: `docs/phase_10_findings.md`
- Terviseamet letter draft: `docs/terviseamet_inquiry.md`
