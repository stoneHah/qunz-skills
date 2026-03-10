---
name: first-time-setup
description: First-time EXTEND.md setup flow for baoyu-sync-upstream-main
---

# First-Time Setup

Use this flow when `EXTEND.md` does not exist and the user wants saved defaults.

## Setup Questions

Ask these in one round:

1. What is the upstream remote name?
2. What source branch should be synced?
3. What target branch should receive the sync?
4. What prefix should be used for temporary sync branches?
5. Should preferences be saved in the project or user home?

## Save Locations

| Choice | Path | Scope |
|--------|------|-------|
| Project | `.baoyu-skills/baoyu-sync-upstream-main/EXTEND.md` | Current project |
| User | `$HOME/.baoyu-skills/baoyu-sync-upstream-main/EXTEND.md` | All projects |

## EXTEND.md Template

```yaml
---
version: 1
upstream_remote: upstream
upstream_branch: main
target_branch: main
sync_branch_prefix: sync/upstream
verification_commands:
  - "git status --short --branch"
  - "git log --oneline --decorate --max-count=10"
---
```

## After Setup

1. Create the target directory if needed
2. Write `EXTEND.md`
3. Confirm the saved path
4. Continue with the sync workflow
