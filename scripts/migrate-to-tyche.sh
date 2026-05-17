#!/usr/bin/env bash
# Migration script: squash water-quality-ee history and convert large artefacts to Git LFS.
#
# This is a DESTRUCTIVE operation. It rewrites git history and force-pushes to origin.
# DO NOT run this in a worktree. Run from a fresh clone of the repository.
#
# Usage:
#   ./scripts/migrate-to-tyche.sh                  # dry-run (default)
#   ./scripts/migrate-to-tyche.sh --confirm        # actually run
#   ./scripts/migrate-to-tyche.sh --confirm --push # also force-push to origin (final step)
#
# Pre-requisites:
#   - git-lfs installed and `git lfs install` run once on this machine
#   - `gh` CLI authenticated (optional, used to surface info)
#   - clean working tree, on `main`, up to date with origin/main
#   - sufficient disk space (~50 MB peak, due to LFS migrate)
#
# What it does, in order:
#   1. Sanity checks (clean tree, on main, ahead/behind sane)
#   2. Creates a backup branch `backup/pre-squash-YYYYMMDD-HHMMSS`
#   3. Configures Git LFS to track *.joblib, snapshot.json, snapshot.history.json
#   4. Rewrites history so those blobs move to LFS (`git lfs migrate import --everything`)
#   5. Squashes the entire history into a single initial commit
#   6. Optionally force-pushes the squashed branch and the LFS objects to origin
#
# Step 4 changes blobs but keeps commits. Step 5 collapses all 149 commits → 1.
# If you only want squash without LFS, comment out the LFS block.
#
# After this script:
#   - You still need to: GitHub UI -> Settings -> Transfer ownership
#   - You still need to: Cloudflare Pages re-link, GitHub Actions secrets verify
#   - See MIGRATION.md for the full post-migration checklist.

set -euo pipefail

CONFIRM=0
DO_PUSH=0
for arg in "$@"; do
  case "$arg" in
    --confirm) CONFIRM=1 ;;
    --push) DO_PUSH=1 ;;
    -h|--help) sed -n '2,33p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $arg"; exit 2 ;;
  esac
done

c_red()    { printf '\033[31m%s\033[0m\n' "$*"; }
c_green()  { printf '\033[32m%s\033[0m\n' "$*"; }
c_yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
c_blue()   { printf '\033[34m%s\033[0m\n' "$*"; }

run() {
  if [[ $CONFIRM -eq 1 ]]; then
    c_blue "+ $*"
    eval "$@"
  else
    c_yellow "[dry-run] $*"
  fi
}

# ---------------------------------------------------------------------------
# Step 1 — sanity checks
# ---------------------------------------------------------------------------
c_green "==> Step 1/6: Sanity checks"

if [[ -n "$(git status --porcelain)" ]]; then
  c_red "Working tree is not clean. Commit or stash first."
  exit 1
fi

current_branch=$(git symbolic-ref --short HEAD)
if [[ "$current_branch" != "main" ]]; then
  c_red "Not on main (currently on '$current_branch'). Switch to main first."
  exit 1
fi

# Check we're in the project root
if [[ ! -f pyproject.toml || ! -d frontend ]]; then
  c_red "This does not look like the water-quality-ee root. Aborting."
  exit 1
fi

# Check git-lfs is installed
if ! command -v git-lfs >/dev/null 2>&1; then
  c_red "git-lfs not installed. Install it first:"
  echo "    Debian/Ubuntu: sudo apt install git-lfs"
  echo "    macOS:         brew install git-lfs"
  echo "    Then:          git lfs install"
  exit 1
fi

# Check we're not inside a worktree
git_common_dir=$(git rev-parse --git-common-dir)
git_dir=$(git rev-parse --git-dir)
if [[ "$git_common_dir" != "$git_dir" ]]; then
  c_red "This is a git worktree. Run the migration from a fresh clone of the canonical repository."
  exit 1
fi

remote_url=$(git remote get-url origin 2>/dev/null || echo "")
c_blue "Current origin: $remote_url"
c_blue "Current commits on main: $(git rev-list --count HEAD)"

# ---------------------------------------------------------------------------
# Step 2 — backup branch
# ---------------------------------------------------------------------------
c_green "==> Step 2/6: Create backup branch"

backup_branch="backup/pre-squash-$(date +%Y%m%d-%H%M%S)"
run "git branch '$backup_branch'"
c_yellow "Backup branch: $backup_branch (push it manually if you want it off-machine)"

# ---------------------------------------------------------------------------
# Step 3 — configure Git LFS tracking
# ---------------------------------------------------------------------------
c_green "==> Step 3/6: Configure Git LFS tracking"

run "git lfs install --local"
run "git lfs track '*.joblib'"
run "git lfs track 'citizen-service/artifacts/snapshot.json'"
run "git lfs track 'frontend/public/data/snapshot.history.json'"
run "git lfs track 'frontend/public/data/snapshot.frontend.json'"
run "git lfs track 'frontend/public/data/snapshot.aep'"
run "git add .gitattributes"
if [[ $CONFIRM -eq 1 ]]; then
  git commit -m "chore(lfs): track large model and snapshot artefacts" || true
fi

# ---------------------------------------------------------------------------
# Step 4 — rewrite history to move large blobs into LFS
# ---------------------------------------------------------------------------
c_green "==> Step 4/6: Move existing blobs into LFS (full history rewrite)"

run "git lfs migrate import --everything --yes --include='*.joblib,citizen-service/artifacts/snapshot.json,frontend/public/data/snapshot.history.json,frontend/public/data/snapshot.frontend.json,frontend/public/data/snapshot.aep'"

# ---------------------------------------------------------------------------
# Step 5 — squash to single initial commit
# ---------------------------------------------------------------------------
c_green "==> Step 5/6: Squash history to single initial commit"

squash_msg=$(cat <<'EOF'
Initial public release — H2O Atlas water-quality risk estimator

This commit is the initial public open-source release under the
Tyche Institute umbrella. The full development history (148 commits)
is preserved on backup branch `backup/pre-squash-*` and in the
authoring contributors' local clones.

Project:
- Probabilistic risk estimator for Estonian water-quality compliance.
- Public citizen service at https://h2oatlas.ee
- TalTech Masinõpe course project, spring 2026.
- Built on 69,536 samples from Terviseamet open data (2021-2026).
- LightGBM AUC = 0.984, Recall = 94.9% @ Precision = 80% on temporal test.

EU AI Act stack: Model Card, Datasheet, voluntary self-assessment,
drift monitor, FRIA-light, signed snapshots (ML-DSA-65 + RSA-PSS-4096).

Licence: Apache License 2.0 (see LICENSE and NOTICE).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)

run "git checkout --orphan tmp-squash"
run "git add -A"
if [[ $CONFIRM -eq 1 ]]; then
  git commit -m "$squash_msg"
fi
run "git branch -M main"

# ---------------------------------------------------------------------------
# Step 6 — push (optional, requires --push)
# ---------------------------------------------------------------------------
c_green "==> Step 6/6: Push to origin"

if [[ $DO_PUSH -eq 1 ]]; then
  c_yellow "Force-pushing to origin/main and pushing LFS objects."
  c_yellow "This will OVERWRITE the remote history. Make sure origin URL is correct:"
  c_yellow "    $remote_url"
  read -p "Type 'PUSH' to confirm: " confirm_push
  if [[ "$confirm_push" != "PUSH" ]]; then
    c_red "Aborted."
    exit 1
  fi
  run "git push --force-with-lease origin main"
  run "git lfs push --all origin main"
else
  c_yellow "Skipping push (use --push to enable). Manual push commands:"
  echo "    git push --force-with-lease origin main"
  echo "    git lfs push --all origin main"
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
c_green "==> Migration script complete"
if [[ $CONFIRM -eq 0 ]]; then
  c_yellow "This was a DRY-RUN. Nothing was changed. Re-run with --confirm to apply."
else
  c_green "History rewritten. Backup is at: $backup_branch"
  c_yellow "Next steps — see MIGRATION.md (Post-migration checklist)."
fi
