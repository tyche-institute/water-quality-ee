## Summary

-

## Validation

- [ ] Relevant local checks passed:
- [ ] GitHub Actions expected to pass for this change:
- [ ] Not applicable because:

## Release Decision Artifact

Use `docs/RELEASE_DECISION_CHECKLIST.md` before any production publish.

- Release candidate commit or branch:
- Snapshot `generated_at`:
- Snapshot `data_fetched_at` / `model_trained_at` when present:
- Expected verification mode:
- Live smoke result for `https://h2oatlas.ee`:
- Accepted residual risk:

Required go/no-go confirmations:

- [ ] Build integrity: release gate or scoped equivalent passed on this candidate.
- [ ] Data freshness: snapshot timing is honest for the publish context.
- [ ] Artifact completeness: snapshot, history, OG, signature, and main artifacts are present when expected.
- [ ] Verification truthfulness: `/verify` describes the actual verification level.
- [ ] Trust wording: trust-critical surfaces match centralized copy and product posture.
- [ ] UX ordering: official status remains more prominent than model interpretation.
- [ ] Analytics: endpoint behavior was checked if telemetry changed.
- [ ] Ownership: deploy/signing/trust changes were reviewed by the right owner.

Do not publish while any hard blocker in `docs/RELEASE_DECISION_CHECKLIST.md` is unresolved.
