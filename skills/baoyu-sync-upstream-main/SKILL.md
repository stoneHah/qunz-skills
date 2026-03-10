---
name: baoyu-sync-upstream-main
description: Guides syncing a forked repository's local main branch with upstream/main through a temporary sync branch, conflict resolution, verification, and final merge. Use when user asks to sync source updates, merge upstream into main, or keep a personal fork current without opening a PR.
---

# Sync Upstream Main

Synchronize a fork's `main` with `upstream/main` using a temporary sync branch.

## Workflow

### Progress Checklist

```
Sync Upstream Progress:
- [ ] Step 1.1: Check preferences (EXTEND.md)
- [ ] Step 1.2: Inspect remotes, branches, and worktree state
- [ ] Step 2: Confirm sync inputs and branch names
- [ ] Step 3: Fetch upstream and create sync branch
- [ ] Step 4: Merge upstream/main into sync branch
- [ ] Step 5: Resolve conflicts and verify repository state
- [ ] Step 6: Merge sync branch back into main
- [ ] Step 7: Push and clean up temporary branches
```

### Step 1.1: Load Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
# Check project-level first
test -f .baoyu-skills/baoyu-sync-upstream-main/EXTEND.md && echo "project"

# Then user-level (cross-platform: $HOME works on macOS/Linux/WSL)
test -f "$HOME/.baoyu-skills/baoyu-sync-upstream-main/EXTEND.md" && echo "user"
```

┌──────────────────────────────────────────────────────────────┬───────────────────┐
│                             Path                             │     Location      │
├──────────────────────────────────────────────────────────────┼───────────────────┤
│ .baoyu-skills/baoyu-sync-upstream-main/EXTEND.md             │ Project directory │
├──────────────────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.baoyu-skills/baoyu-sync-upstream-main/EXTEND.md       │ User home         │
└──────────────────────────────────────────────────────────────┴───────────────────┘

┌───────────┬────────────────────────────────────────────────────────────────────────────┐
│  Result   │                                   Action                                   │
├───────────┼────────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, display summary, apply configured remote and branch names     │
├───────────┼────────────────────────────────────────────────────────────────────────────┤
│ Not found │ Ask user whether to save defaults now, or continue with built-in defaults  │
└───────────┴────────────────────────────────────────────────────────────────────────────┘

**EXTEND.md Supports**: Upstream remote name | Upstream branch | Target branch | Sync branch prefix | Verification commands

Schema: [references/config/preferences-schema.md](references/config/preferences-schema.md)

First-time setup: [references/config/first-time-setup.md](references/config/first-time-setup.md)

## Built-In Defaults

Use these values when EXTEND.md is missing and the user does not override them:

| Field | Default |
|-------|---------|
| `upstream_remote` | `upstream` |
| `upstream_branch` | `main` |
| `target_branch` | `main` |
| `sync_branch_prefix` | `sync/upstream` |

## Safety Rules

- Require a clean worktree before starting. If `git status --short` is not empty, stop and ask the user to commit or stash first.
- Never merge `upstream/main` directly into `main` as the first step.
- Never use destructive commands such as `git reset --hard` unless the user explicitly requests them.
- Prefer merge over rebase for this workflow unless the user explicitly asks for a rebase-based history.

## Usage

Use this workflow for requests such as:

- "同步 upstream/main 到 main"
- "把源仓库更新合到我的 fork"
- "帮我更新 fork，但不提 PR"
- "merge upstream/main into my main safely"

## Step 1.2: Inspect Repository State

Run:

```bash
git remote -v
git status --short --branch
git branch -vv
```

Confirm:

- the upstream remote exists
- the target branch exists locally
- the worktree is clean
- the current branch is not already a temporary sync branch unless resuming work

## Step 2: Confirm Sync Inputs

Determine the effective values:

- upstream remote: `upstream_remote`
- upstream branch: `upstream_branch`
- target branch: `target_branch`
- sync branch prefix: `sync_branch_prefix`

If the repository uses different names such as `develop`, use those names consistently in every command.

## Step 3: Fetch and Create Sync Branch

Run:

```bash
git fetch --all --prune
git checkout ${target_branch}
git pull origin ${target_branch}
git checkout -b ${sync_branch_prefix}-YYYYMMDD
```

Record the created branch name as `SYNC_BRANCH` and reuse that exact name in later steps.

Branch naming guidance:

- date-only is enough when running once per day
- if a branch with that name already exists, append time: `-YYYYMMDD-HHMMSS`

Example:

```bash
git checkout main
git pull origin main
git checkout -b sync/upstream-20260310
```

## Step 4: Merge Upstream Main Into Sync Branch

Run:

```bash
git merge ${upstream_remote}/${upstream_branch}
```

Possible outcomes:

| Result | Action |
|--------|--------|
| Fast-forward or clean merge | Continue to verification |
| Merge conflicts | Resolve conflicts before any further merge |
| Remote missing | Stop and ask user to configure or correct the upstream remote |

## Step 5: Resolve Conflicts and Verify

When conflicts appear:

1. Run `git status`
2. Open each conflicted file
3. Preserve the fork-specific customizations unless upstream clearly supersedes them
4. Remove conflict markers
5. Stage each resolved file with `git add`
6. Complete the merge with `git commit` if Git does not auto-create the merge commit

Minimum verification:

```bash
git status --short --branch
git log --oneline --decorate --max-count=10
```

If the repository has project-specific verification commands in EXTEND.md, run them before returning to `main`.

## Step 6: Merge Sync Branch Back Into Main

After verification passes:

```bash
git checkout ${target_branch}
git merge ${SYNC_BRANCH}
```

Prefer the explicit branch name in practice:

```bash
git checkout main
git merge sync/upstream-20260310
```

If the merge back into `main` conflicts, resolve them with the same conflict-resolution rules from Step 5.

## Step 7: Push and Clean Up

Run:

```bash
git push origin ${target_branch}
```

Optional cleanup after the push succeeds:

```bash
git branch -d sync/upstream-20260310
```

Keep the sync branch when:

- the user wants an audit trail
- follow-up testing is still pending
- another branch still needs to cherry-pick from it

## Completion Report

Report:

- source synced from `upstream/main` to `main`
- whether conflicts occurred
- whether verification commands passed
- whether the sync branch was deleted or kept

## Extension Support

Custom configurations via EXTEND.md. See **Step 1.1** for paths and supported options.
