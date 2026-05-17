# Release Decision Checklist

Last updated: 2026-05-11

This file exists for one reason: a green build is not the same as a safe public
release.

Use it after `./scripts/verify_release.sh` and before a production publish.
Every pull request should carry the same sign-off fields through
`.github/PULL_REQUEST_TEMPLATE.md`, so release judgment is visible before merge
instead of reconstructed after deploy.

## Hard blockers

Do not release if any of these are true:

- `./scripts/verify_release.sh` fails
- snapshot freshness is misleading or stale for the intended publish context
- `/verify` reports a digest mismatch or weaker verification than expected for
  the published bundle
- frontend/backend norm sync fails
- official status ordering is visually or textually degraded by the change
- history, OG, signature, or main snapshot artifacts are missing when the UI
  expects them

## Go / no-go matrix

| Check | Question | Release rule |
|---|---|---|
| Build integrity | Did the release gate pass on the exact candidate? | Required |
| Data freshness | Is `generated_at` recent enough to publish honestly under `frontend/app/lib/freshness-policy.json`? | Required: fresh `< 8` days, aging `8-13` days, stale `>= 14` days; normal manual publish must not use a snapshot older than `13` days |
| Artifact completeness | Are snapshot, history, OG, and signature artifacts present as expected? | Required |
| Verification truthfulness | Does `/verify` describe the actual verification level, not a stronger one? | Required |
| Trust wording | Do trust-critical surfaces still match centralized copy and product posture? | Required |
| UX ordering | Is official status still more prominent than model output? | Required |
| Analytics | If telemetry changed, does the endpoint still ingest and expose counters? | Required when changed |
| Ownership | If this touches deploy/signing/trust semantics, was it reviewed by the right owner? | Required when changed |

## Operator sign-off note

Record this in the PR, release note, or operator log:

- release candidate commit or branch
- snapshot `generated_at`
- snapshot `data_fetched_at` and `model_trained_at` when present
- verification mode expected by the release
- smoke result for `https://h2oatlas.ee`
- any accepted residual risk

## Minimum publish statement

If the release proceeds, the operator should be able to state:

"The release gate passed, the published snapshot is fresh enough to represent
honestly, the verification page matches the real bundle semantics, and the UI
still presents official status before model interpretation."
