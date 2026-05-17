# Terviseamet response playbook

> Purpose: prepare the next move before the first answer arrives.

## If they reply: "Please send details"

Reply with:

1. `docs/terviseamet_briefing_onepager.md`
2. `docs/terviseamet_probe_examples.md`
3. offer a short call or written clarification

Do not jump straight to the full long-form inquiry unless they ask for it.

## If they reply: "Please contact another department / colleague"

Action:

1. resend the same short context
2. keep the thread
3. include only the one-page briefing if needed

Goal:

- preserve continuity,
- avoid making the new recipient reconstruct the context from scratch.

## If they reply with a substantive technical answer

Action:

1. save the answer into project docs
2. map each answer to the corresponding question:
   - XML completeness
   - `hinnang` derivation
   - parameter-profile differences
   - measurement periodicity
   - update cadence
3. update:
   - `docs/datasheet.md`
   - `docs/ml_framing.md`
   - `docs/phase_10_findings.md`
   - `docs/terviseamet_inquiry.md`

## If they do not reply

Wait:

- 7–10 business days

Then:

1. resend a shorter version of the first email
2. keep the same thread subject
3. optionally add `press@terviseamet.ee` in `CC`

## If they challenge the audit

Do:

- respond with the narrowest claim possible
- cite the exact numbers
- separate:
  - parser parity,
  - norm checker logic,
  - publication completeness,
  - model behavior

Do not:

- defend speculative claims as facts
- claim internal-process knowledge you do not have

## If they are open to collaboration

Best next offers:

1. share the deterministic checker
2. share 3 example cases
3. offer a short walkthrough of H2O Atlas
4. ask whether they prefer written notes or a short call

## Most important tone rule

Treat Terviseamet as the data owner and domain authority.

The project’s strongest posture is:

- we audited carefully,
- we corrected our own mistakes,
- we found residual unexplained cases,
- we want clarification, not confrontation.
