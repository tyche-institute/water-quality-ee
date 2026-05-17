# Terviseamet outreach — supervisor review memo

> Prepared: 2026-05-11.
> Purpose: let a supervisor review the proposed first contact in under 5 minutes.

## Decision requested

Please review and approve:

- the first-contact route via `kesk@terviseamet.ee`,
- the short Estonian email in `docs/terviseamet_first_email.md`,
- the follow-up packet for use only after a positive reply.

## Why this outreach matters

We now have a mature audit result, not just a student hypothesis:

- **69,536 probes** checked across 4 domains and 2021–2026,
- **86.2%** agreement between official `hinnang` and deterministic norm checker,
- **2,164 residual hidden violations (3.1%)** that cannot be reproduced from the published parameters alone,
- parser-parity audit confirms we are **not** losing measurement fields in our own XML parser.

These findings are strong enough to justify a respectful clarification request to the data owner.

## What we are asking Terviseamet

Only five technical clarifications in the first exchange:

1. whether the XML is a full probe record or a published subset;
2. whether `hinnang` can depend on non-published inputs;
3. whether parameter profiles intentionally differ by site type;
4. whether rare chemistry parameters are periodic rather than per-probe;
5. whether there is a documented opendata refresh cadence.

This is a clarification request, not a complaint and not a demand for cooperation.

## Recommended send sequence

Stage 1:

- send only the short email from `docs/terviseamet_first_email.md`

Stage 2, only if they reply positively:

- send `docs/terviseamet_briefing_onepager.md`
- optionally send `docs/terviseamet_probe_examples.md`

Stage 3, only if a technical conversation starts:

- share selected evidence from `docs/phase_10_findings.md`
- share the longer draft in `docs/terviseamet_inquiry.md` if needed

## Why the route is conservative

Recommended first route:

- `To`: `kesk@terviseamet.ee`
- `CC`: project supervisor

Reason:

- it is the safest public routing point for a formal but non-adversarial technical question;
- we do not currently have a more precise public mailbox for the VTI / water-data maintainers;
- it keeps the first contact institutionally clean.

## Main review criteria

Please focus on:

1. whether the tone is appropriately respectful and non-accusatory;
2. whether the project description is accurate;
3. whether the five questions are the right first set;
4. whether the contact route should be changed before sending.

## Source documents

- `docs/terviseamet_first_email.md`
- `docs/terviseamet_briefing_onepager.md`
- `docs/terviseamet_probe_examples.md`
- `docs/terviseamet_outreach_packet.md`
- `docs/phase_10_findings.md`
