# Sync playbook: `sapsan14/water-quality-ee` → `tyche-institute/water-quality-ee`

> **Repo split (current setup).**
>
> - **`sapsan14/water-quality-ee`** — active development + deployment.
>   Cloudflare Pages, GitHub Actions, scheduled snapshots, all production
>   integrations live here. **Do not migrate or transfer this repo.**
> - **`tyche-institute/water-quality-ee`** — public open-source showcase.
>   Periodic snapshot of `sapsan14` main, squashed to a single initial commit,
>   Git LFS for large artefacts, Apache 2.0 licence visible on the GitHub UI.
>   No CI, no secrets, no deploy hooks.
>
> This file is the playbook for the **sync direction**: when the dev repo has
> moved meaningfully, refresh the showcase with a clean snapshot. Initial
> setup is already done (May 2026); this file documents repeats.

## When to sync

A re-snapshot of the showcase is appropriate when:

- a major release or notable milestone landed in the dev repo,
- a journalist / academic / regulator is about to look at the public repo and you want a current state,
- the divergence between dev and showcase grew large enough that "things look stale" on tyche-institute.

It is **not** automatic. There is no GitHub Action wired up — the trigger is human judgment, and each sync is destructive (force-push, history rewrite). Keep snapshots intentional, not frequent.

## What the showcase repo contains

After a sync, `tyche-institute/water-quality-ee` holds:

- one orphan commit on `main` authored by `Tyche Institute Dev <dev@tyche.institute>`,
- LFS-tracked large artefacts: `*.joblib`, `citizen-service/artifacts/snapshot.json`, `frontend/public/data/snapshot.{aep,frontend.json,history.json}`,
- everything else as plain Git blobs,
- no Actions enabled, Issues enabled, public visibility, Apache 2.0 licence detected by GitHub.

## Tooling

`scripts/migrate-to-tyche.sh` (shipped in this repo) does the heavy lifting:

1. Sanity checks (clean tree, on `main`, not in a worktree, LFS installed),
2. Creates a local `backup/pre-squash-<timestamp>` branch,
3. Configures Git LFS tracking,
4. Rewrites all history to move blobs into LFS (`git lfs migrate import --everything --yes`),
5. Squashes everything into a single orphan commit on `main`.

It does **not** push by default. You push manually to the showcase remote.

## Sync procedure (every time)

Run **outside** any worktree, in a fresh clone of the dev repo.

```bash
# 1. Fresh clone of the dev repo
cd ~/work
rm -rf wqe-sync 2>/dev/null
git clone git@github.com:sapsan14/water-quality-ee.git wqe-sync
cd wqe-sync

# 2. Use the Tyche identity for the squashed commit
git config user.name  "Tyche Institute Dev"
git config user.email "dev@tyche.institute"

# 3. Install LFS hooks for this clone
git lfs install --local

# 4. Squash + LFS migrate (dry-run first to read the plan)
./scripts/migrate-to-tyche.sh                    # dry-run, prints actions
./scripts/migrate-to-tyche.sh --confirm          # apply locally; no push yet

# 5. Point at the showcase remote
git remote remove origin
git remote add origin git@github.com:tyche-institute/water-quality-ee.git

# 6. Switch gh CLI to the tyche-dev account (so Issues/PR APIs target the org)
gh auth switch -u tyche-dev

# 7. Force-push commit + LFS objects
git push --force origin main
git lfs push --all origin main
```

After step 7, <https://github.com/tyche-institute/water-quality-ee> is updated.

## After the sync — verify

- `gh repo view tyche-institute/water-quality-ee --json licenseInfo,defaultBranchRef --jq '.'` shows `Apache License 2.0` and `main`.
- `gh api repos/tyche-institute/water-quality-ee/license --jq '.license.spdx_id'` returns `Apache-2.0`.
- Topics still present: `machine-learning`, `water-quality`, `estonia`, `open-data`, `civic-tech`, `eu-ai-act`, `public-health`, `lightgbm`, `nextjs`.
- Actions still disabled: `gh api repos/tyche-institute/water-quality-ee/actions/permissions --jq '.enabled'` returns `false`.
- The site at <https://h2oatlas.ee> continues to deploy from `sapsan14` (this repo). Cloudflare Pages connection is unchanged.

If topics or Actions-disabled got reset, re-apply:

```bash
gh repo edit tyche-institute/water-quality-ee \
  --add-topic machine-learning --add-topic water-quality --add-topic estonia \
  --add-topic open-data --add-topic civic-tech --add-topic eu-ai-act \
  --add-topic public-health --add-topic lightgbm --add-topic nextjs

gh api -X PUT repos/tyche-institute/water-quality-ee/actions/permissions \
  --input - <<<'{"enabled": false}'
```

## What NOT to do

- **Do not** transfer `sapsan14/water-quality-ee` to `tyche-institute`. The deployment integrations are tied to the current owner and that would silently break Cloudflare Pages + GitHub Actions secrets.
- **Do not** push secrets, env files, or signing keys to the showcase. The dev repo's `.gitignore` already filters them; check `git status --ignored` before the squash if in doubt.
- **Do not** open issues / PRs against `tyche-institute/water-quality-ee` for actual development work. Issues there are for outside community feedback only; everything else happens on `sapsan14/water-quality-ee`.
- **Do not** sync without an intent. Each sync rewrites the showcase's history — the `backup/pre-squash-*` branch stays only on your local machine.

## Open per-sync decisions (still pending)

1. **Copyright holder text** in `NOTICE`. Currently `Tyche Institute and water-quality-ee contributors`. Confirm exact legal name if it changes.
2. **`CITATION.cff` author block.** Currently `Anton Sokolov / TalTech`. Add contributors or institutional affiliation when appropriate.
3. **`SECURITY.md` contact mailbox** — `security@h2oatlas.ee`. Confirm it routes to a real human.
4. **Author signature in TerviseAmet outreach letters.** Three files: `terviseamet_first_email.md`, `terviseamet_inquiry.md`, `terviseamet_inquiry.et.md` still contain `<author name>` / `<nimi / nimed>` placeholders. Fill those before sending and before the next showcase sync.

## History — initial setup (May 2026)

Initial showcase creation steps, for the record:

1. Merged open-source prep PR into `sapsan14/main` (PR #149).
2. Ran the sync procedure above from a `/tmp/wqe-sync` clone for the first time.
3. Empty repo created on the org first: `gh repo create tyche-institute/water-quality-ee --public --description "…" --homepage "https://h2oatlas.ee"`. (The `--source .` variant of `gh repo create` failed in our environment; explicit `git remote add` + `git push -u` worked.)
4. Subsequent LICENSE fix (PR #150, #151) replaced the LICENSE with byte-identical canonical Apache 2.0 from `apache.org`, fixing GitHub's auto-detection.
5. Topics + `Actions: disabled` applied via `gh repo edit` and the `actions/permissions` API.
