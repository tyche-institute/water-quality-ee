# Operations Runbook

This document is the practical source of truth for building, verifying, deploying, and rolling back the public `h2oatlas.ee` service.

Current status baseline: `docs/PROGRAM_STATUS.md` distinguishes `repo-ready`,
`live-ready`, and `org-ready` so "implemented in repo" is not confused with
"safe to operate repeatedly".

Ownership and access boundaries: `docs/OWNERSHIP_AND_ACCESS.md`.
Release go/no-go checklist: `docs/RELEASE_DECISION_CHECKLIST.md`.
Pull request release artifact: `.github/PULL_REQUEST_TEMPLATE.md`.
Rollback drill: `docs/ROLLBACK_DRILL.md`.

## Scope

The operational surface has three parts:

1. Python data + model pipeline
2. exported citizen snapshot artifacts
3. Next.js frontend deployed to Cloudflare Pages

Use this file for routine releases. Use the research notebooks and report docs for analysis, not for production operations.

## Release Artifacts

The public service depends on these files:

- `citizen-service/artifacts/snapshot.json` — canonical per-place snapshot
- `frontend/public/data/snapshot.frontend.json` — main dashboard payload
- `frontend/public/data/snapshot.history.json` — lazy-loaded history payload
- `frontend/public/data/og-index.json` — social/share metadata index
- `frontend/public/data/snapshot.aep` — signed evidence package
- `frontend/public/data/snapshot.sig.json` — lightweight badge metadata

## Preconditions

Before a release:

- Python dependencies are installed
- frontend dependencies are installed
- required API keys and signing credentials are available
- current `main` is green in CI

Recommended local checks:

```bash
./scripts/verify_release.sh
cd frontend && npm run ui:review
```

The script now fails with explicit setup guidance if core Python or frontend
dependencies are missing, so environment problems stop looking like product
regressions.

For environment debugging without running the full gate:

```bash
./scripts/verify_release.sh --diagnose --skip-python --skip-frontend
```

This prints the detected Python path/version, Node path/version, npm location,
and whether `frontend/node_modules` is present.

The same script is the CI source of truth:

- `./scripts/verify_release.sh --skip-frontend` in Python test workflow
- `./scripts/verify_release.sh --skip-python` in frontend workflow

Passing the script is necessary but not sufficient. Before a production publish,
run the explicit release judgment from `docs/RELEASE_DECISION_CHECKLIST.md`.
For PR-based changes, keep the release artifact in `.github/PULL_REQUEST_TEMPLATE.md`
filled in or explicitly marked not applicable before merge.

## Build Flow

### 1. Refresh the canonical snapshot

Run the citizen-service pipeline from the repo root:

```bash
python citizen-service/scripts/build_citizen_snapshot.py
python citizen-service/scripts/export_frontend_snapshot.py
```

If you only need map + official status without model refresh:

```bash
python citizen-service/scripts/build_citizen_snapshot.py --map-only
python citizen-service/scripts/export_frontend_snapshot.py
```

### 2. Verify artifact freshness

Check that:

- `generated_at`, `data_fetched_at`, and `model_trained_at` match the intended publish context
- frontend freshness policy is still synchronized with `frontend/app/lib/freshness-policy.json`
- dashboard state is `fresh < 8 days`, `aging 8-13 days`, and `stale >= 14 days`
- manual normal publication does not use a snapshot older than `13` days; rebuild or publish only with degraded/stale messaging once the snapshot reaches `14` days
- `places_count` is within the expected range
- `snapshot.history.json` exists and is non-empty when history export input is available
- `og-index.json` exists
- `python scripts/check_water_norms_sync.py` passes before publish

### 3. Sign the published snapshot

Run the signing step used by the current release flow:

```bash
python scripts/sign_snapshot.py
```

Expected output:

- `frontend/public/data/snapshot.aep`
- `frontend/public/data/snapshot.sig.json`

## Verification Flow

### Integrity and signature expectations

There are two verification modes today:

1. `local_dev`
   - browser verifies the RSA signature directly against the bundled public key
2. `backend` via the official Aletheia evidence package
   - browser recomputes `SHA-256(canonical.bin)`
   - browser verifies the RSA signature against `public_key.pem`
   - browser confirms `timestamp.tsr` is present
3. legacy `backend` self-bundled snapshot package
   - browser verifies only the payload-to-attestation integrity chain
   - this legacy format is not fully signature-verified in the browser

Important:

- do not describe the legacy backend snapshot bundle as full cryptographic signature validation
- do not describe backend verification as full cryptographic signature validation when the published bundle is the legacy self-bundled backend snapshot format
- the `/verify` page should present legacy backend bundles as integrity-level verification
- the preferred release path is the official backend evidence package downloaded from `/api/ai/evidence/{id}?format=zip`

### Manual verification

After generating artifacts:

1. open `/verify`
2. run “Verify the current snapshot”
3. confirm the result matches the expected verification level
4. confirm `signed_at` and digests are present

## Deploy Flow

The standard release path is:

1. merge or push the approved change to `main`
2. let GitHub Actions run tests / frontend CI / snapshot workflow
3. let Cloudflare Pages deploy the frontend
4. smoke-test the live site after deploy completes

Ongoing production monitoring:

- `Citizen snapshot` GitHub Action publishes the weekly full bundle every Monday at `04:00 UTC` and on the `1st` of each month at `04:00 UTC`
- `Aletheia healthcheck` runs daily at `03:30 UTC`, so backend-signing failures surface before the Monday snapshot publish window
- `Site smoke` GitHub Action runs against `https://h2oatlas.ee` every day; on Mondays at `05:45 UTC` it also enforces that the live `snapshot.frontend.json` was regenerated after the current Monday `04:00 UTC` floor and is not older than `2` hours, matching `frontend/app/lib/freshness-policy.json`

## Live Smoke Test

Minimum smoke checklist for `https://h2oatlas.ee`:

- `python3 scripts/smoke_live_site.py --base-url https://h2oatlas.ee` passes
  - script validates not only `200 OK`, but also the basic JSON shape of `snapshot.frontend.json`, `snapshot.history.json`, `og-index.json`, and `snapshot.sig.json`
- `cd frontend && npm run ux:smoke:live` passes after Cloudflare Pages deploy
  - wrapper retries the browser smoke up to `3` times by default, because Pages can briefly serve HTML before all new Next.js chunks are available at every edge
  - set `H2O_UX_ATTEMPTS=1` for strict one-shot browser verification
- `cd frontend && npm run ui:review` passes against a local production build when a UI release needs full review evidence
  - default target is `http://127.0.0.1:3000`
  - set `H2O_UI_REVIEW_BASE_URL=https://h2oatlas.ee` to collect the same desktop/mobile screenshots against production
- Monday deadline check:
  - `python3 scripts/smoke_live_site.py --base-url https://h2oatlas.ee --require-generated-after <current-monday-04:00Z> --max-generated-age-hours 2.0`
  - use this when verifying that the scheduled weekly snapshot actually published in the intended morning window
- dashboard renders past the loader
- search works
- selecting a place opens details
- watchlist works
- selected-place history opens
- `/verify` wording matches the true verification level

## Rollback

For rehearsal or incident evidence, use `docs/ROLLBACK_DRILL.md` together with
the shorter flow below.

Rollback is appropriate when:

- snapshot export is corrupted
- verification artifacts mismatch the published payload
- frontend deploy breaks critical UX
- data freshness is misleading

Rollback order:

1. revert the bad commit on `main`
2. re-run CI/deploy
3. re-check `/verify`
4. re-check live snapshot timestamps

If the issue is only with snapshot data, prefer rebuilding and re-signing the snapshot rather than reverting unrelated frontend code.

## Incident Notes

Treat these as release blockers:

- frontend/backend norm drift detected by `scripts/check_water_norms_sync.py`
- missing `snapshot.history.json` when the UI expects history
- digest mismatch in `/verify`
- stale snapshot presented as fresh
- broken official/model status ordering in the UI
- failing `lint`, `typecheck`, `build`, or `pytest`

## Ownership

- Product / trust wording: frontend + product owner
- Snapshot correctness: citizen-service + ML/data owner
- Signing pipeline: security/trust owner
- Production deploy: frontend/platform owner

For actual access concentration, fallback boundaries, and the two-person
resilience target, use `docs/OWNERSHIP_AND_ACCESS.md` rather than treating this
short list as sufficient operating guidance.
