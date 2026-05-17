# Terviseamet follow-up — three concrete probe examples

> Selected from `docs/phase_10_findings.md` for follow-up after the first contact.
> Goal: show three different mismatch patterns without overwhelming the recipient.

## Example 1 — strongest case for unpublished or contextual compliance logic

- **Domain:** `veevark`
- **sid:** `377387`
- **Location:** `Arkaadia Viljandi mnt veevärk`
- **County / city context:** Tartu
- **Sample date:** `2025-12-08`
- **Official label:** violation (`ei vasta nõuetele`)

### Why this example matters

This is the strongest single case in the audit because:

- all published parameters are present,
- all published parameters are within threshold,
- yet the official label is still `violation`.

### Interpretation

This case cannot be explained by:

- parser loss,
- missing chemistry due to periodic schedule,
- or a simple threshold mismatch in the published values.

It suggests one of:

- unpublished parameters,
- unpublished context,
- resampling logic,
- or another internal decision rule not visible in the XML.

## Example 2 — partial publication / profile asymmetry in pools

- **Domain:** `basseinid`
- **sid:** `347163`
- **Location:** `Ring spaa ja saunad / laste mänguala`
- **County:** Harju
- **Sample date:** `2024-11-29`
- **Official label:** violation (`ei vasta nõuetele`)

### Why this example matters

In this case:

- the chemistry fields that are present look normal,
- but the microbiology profile is absent,
- so the official violation cannot be reproduced from the published record alone.

### Interpretation

This is a good example for asking:

- whether pool-type sites have different mandatory microbiology panels,
- whether some microbiology parameters exist internally but are not always published,
- or whether this is an expected publication-profile difference for certain pool contexts.

## Example 3 — bathing-water label not explained by the two visible microbiology values

- **Domain:** `supluskoha`
- **sid:** `366758`
- **Location:** `Pedeli paisjärve supluskoht`
- **County:** Valga
- **Sample date:** `2025-08-17`
- **Official label:** violation (`ei vasta nõuetele`)

### Published microbiology values

- `e_coli = 144`
- `enterococci = 164`

Both are within the “Excellent” bathing-water range under the simple published-threshold reading.

### Why this example matters

This case is useful because it is easy to explain and intuitively surprising:

- the two visible bathing-water indicators look good,
- yet the official label is still a violation.

### Interpretation

This is the clearest question for bathing water:

- is `hinnang` influenced by contextual information beyond these two visible values,
- by another unpublished field,
- or by a classification rule that is not fully obvious from the open XML alone?

## Why these three were chosen

Together they cover three distinct patterns:

1. **all visible values clean, label still violation** (`veevark`)
2. **key measurement profile absent, label violation** (`basseinid`)
3. **visible bathing values look normal, label still violation** (`supluskoha`)

This makes them suitable for a short technical follow-up without sending a large dataset on first reply.
