# Terviseamet outreach packet — index and send order

> Purpose: keep the Terviseamet contact package usable without re-discovering the project context.
> Status: draft package, ready for supervisor review.

## Packet contents

### 1. First contact

- `docs/terviseamet_first_email.md`
  Use this for the first outbound message.

### 2. Follow-up summary

- `docs/terviseamet_briefing_onepager.md`
  Use this if they reply positively or ask for a short summary.

### 3. Concrete examples

- `docs/terviseamet_probe_examples.md`
  Use this if they want specific cases or if the conversation becomes technical.

### 4. Full long-form draft

- `docs/terviseamet_inquiry.md`
  Use this as the long-form source document, not as the first email body.

### 5. Evidence backbone

- `docs/phase_10_findings.md`
- `docs/learning_journey.md`
- `docs/data_gaps.md`

These are not first-contact attachments, but they are the evidence base behind the outreach package.

## Recommended send order

### Stage 1 — first email only

Send:

- email body from `docs/terviseamet_first_email.md`

Do not attach anything unless specifically requested.

### Stage 2 — if they reply with interest

Send:

- `docs/terviseamet_briefing_onepager.md`
- optionally 3 examples from `docs/terviseamet_probe_examples.md`

### Stage 3 — if a technical conversation starts

Share:

- selected examples,
- selected excerpts from `docs/phase_10_findings.md`,
- explanation of deterministic checker,
- H2O Atlas live link.

### Stage 4 — if they want formal cooperation or detailed review

Then send:

- full inquiry/cooperation draft,
- audit methodology,
- any model card / datasheet / AI Act supporting docs if relevant.

## What not to do in the first contact

- Do not attach a large PDF bundle immediately.
- Do not send the full long-form inquiry first.
- Do not open with accusations about “data errors”.
- Do not frame the message as a complaint.

## Best framing

Use this positioning consistently:

- student civic-tech project,
- public-facing transparency tool,
- careful audit of open data,
- request for clarification,
- offer to share tools and findings.

## Current recommended routing

- `To`: `kesk@terviseamet.ee`
- `CC`: supervisor
- optional later `CC`: `press@terviseamet.ee`

## Open pre-send items

- supervisor sign-off
- sender names / signature block
- decision whether first mail is sent in Estonian only or bilingual

## Send-ready checklist

This block consolidates the remaining concrete actions before Stage 1. The
content artefacts themselves are complete; what is left is personalisation,
approval, and the send itself.

### 1. Personalisation (author action)

- `docs/terviseamet_first_email.md`: replace `<nimi / nimed>` and `<e-post>` in the signature block (lines ~105–110)
- `docs/terviseamet_inquiry.md`: replace `<author name>` and `<author email>` near the closing (lines ~92–94)
- `docs/terviseamet_inquiry.et.md`: same two placeholders in the Estonian copy

Optional: decide whether the signature lists a single student or the full team.

### 2. Approval (external actor)

- Share `docs/terviseamet_supervisor_review_memo.md` with the project supervisor
- Wait for sign-off on the outreach route, the Estonian text, and the staged follow-up packet
- If the supervisor requests edits, apply them to `terviseamet_first_email.md` first; the longer inquiry only changes if the conversation reaches Stage 3

### 3. Send — Stage 1 only

- **To:** `kesk@terviseamet.ee`
- **CC:** project supervisor
- **Subject:** `TalTechi tudengiprojekt H2O Atlas: küsimused Terviseameti veeandmete kohta ja koostööettepanek` (see `terviseamet_first_email.md` for the shorter alternative)
- **Body:** Estonian text from `terviseamet_first_email.md` (the section between `## Draft email` and `## Notes for sending`)
- **Attachments:** none
- **Tone:** clarification request, not a complaint; treat Terviseamet as data owner and domain authority

### 4. Follow-up rules

- No reply within 7–10 business days → resend the same short message in the same thread, add `press@terviseamet.ee` in CC
- If they reply asking for details → go to Stage 2 (`terviseamet_briefing_onepager.md` + 3 examples from `terviseamet_probe_examples.md`)
- For all other reply patterns, see `docs/terviseamet_response_playbook.md`
