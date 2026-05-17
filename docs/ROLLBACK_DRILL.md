# Rollback Drill

Purpose: rehearse rollback from documentation, not from maintainer memory.

Use this drill quarterly, after major deploy-flow changes, or after any
production incident where `h2oatlas.ee` had to be recovered.

Primary runbook: `docs/OPERATIONS.md`.

Release decision artifact: `docs/RELEASE_DECISION_CHECKLIST.md`.

## Roles

- Incident lead: decides whether rollback is appropriate.
- GitHub operator: reverts or rebuilds from the repository.
- Platform observer: watches GitHub Actions, Cloudflare Pages, and live smoke.
- Trust reviewer: confirms `/verify`, freshness, and official/model ordering.

For current ownership boundaries, use `docs/OWNERSHIP_AND_ACCESS.md`.

## Dry-Run Drill

Do not push during the dry run.

1. Confirm the local checkout is clean.

   ```bash
   git status -sb
   ```

2. Identify the latest deploy candidate and the previous known-good candidate.

   ```bash
   git log --oneline -5
   gh run list --branch main --limit 10
   ```

3. Classify the rollback type.

   - Frontend deploy regression: revert the bad frontend commit.
   - Snapshot data regression: rebuild, re-export, re-sign, and publish the snapshot.
   - Verification artifact mismatch: freeze publish, rebuild signature artifacts, and verify `/verify`.
   - Trust-copy regression: revert or patch the trust wording before any new publish.

4. Write the exact command that would be used, but do not run it.

   ```bash
   git revert --no-edit <bad_commit_sha>
   git push origin main
   ```

5. Confirm the validation chain to run after a real rollback.

   ```bash
   gh run list --commit <rollback_commit_sha> --limit 10
   SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt python3 scripts/smoke_live_site.py --base-url https://h2oatlas.ee
   cd frontend && npm run ux:smoke:live
   ```

6. Record the drill result using the evidence template below.

## Real Incident Rollback

Use this only when rollback is appropriate under `docs/OPERATIONS.md`.

1. Stop and classify the incident.
2. Confirm there are no unrelated local changes.
3. Revert only the bad commit or rebuild only the bad snapshot artifacts.
4. Push the rollback branch or `main` update.
5. Watch GitHub Actions to completion.
6. Confirm Cloudflare Pages deploy completion when frontend files changed.
7. Run semantic live smoke.
8. Run browser live smoke.
9. Re-check `/verify` and snapshot timestamps.
10. Record the evidence.

If the issue is isolated to snapshot data, prefer rebuild/re-sign over reverting
unrelated frontend code.

## Required Evidence

Record these fields in the PR, incident note, or operator log:

- Incident or drill date:
- Operator:
- Incident class:
- Bad commit or artifact:
- Rollback commit or rebuilt artifact:
- GitHub Actions result:
- Cloudflare Pages result when applicable:
- Semantic smoke result:
- Browser smoke result:
- `/verify` result:
- Snapshot `generated_at`:
- Snapshot `data_fetched_at` / `model_trained_at` when present:
- Residual risk:
- Follow-up issue or task:

## Pass Criteria

The drill passes only if another maintainer can follow this document and produce
the exact rollback command, validation chain, and evidence fields without asking
for unstated context.
