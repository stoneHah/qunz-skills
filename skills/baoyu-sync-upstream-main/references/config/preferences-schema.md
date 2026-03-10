---
name: preferences-schema
description: EXTEND.md YAML schema for baoyu-sync-upstream-main preferences
---

# Preferences Schema

## Full Schema

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

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `upstream_remote` | string | `upstream` | Remote name for the source repository |
| `upstream_branch` | string | `main` | Branch to pull from on the source repository |
| `target_branch` | string | `main` | Local branch that should receive upstream updates |
| `sync_branch_prefix` | string | `sync/upstream` | Prefix used for temporary sync branches |
| `verification_commands` | string[] | two git checks | Commands to run before merging back into the target branch |

## Examples

**Minimal**:

```yaml
---
version: 1
upstream_remote: upstream
upstream_branch: main
target_branch: main
sync_branch_prefix: sync/upstream
---
```

**Custom branches**:

```yaml
---
version: 1
upstream_remote: source
upstream_branch: develop
target_branch: main
sync_branch_prefix: sync/source
verification_commands:
  - "git status --short --branch"
  - "git diff --stat main..HEAD"
---
```
