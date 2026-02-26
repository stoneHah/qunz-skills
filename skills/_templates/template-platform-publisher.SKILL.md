---
name: <skill-name>
description: <Publishes prepared content to target platform with metadata validation and delivery status reporting>. Use when user asks to "<trigger-1>", "<trigger-2>", or "<trigger-3>".
---

# <Skill Title>

Automated publishing workflow for `<platform-name>`.

## Language

Match user language for all confirmations, progress, and result reporting.

## Script Directory

Agent execution:
1. `SKILL_DIR` = this SKILL.md directory
2. script path = `${SKILL_DIR}/scripts/<script-name>.ts`

## Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
test -f .baoyu-skills/<skill-name>/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/<skill-name>/EXTEND.md" && echo "user"
```

If not found:
- run first-time setup if credentials/method defaults are required
- otherwise continue with defaults

## Pre-flight Check (Optional)

```bash
npx -y bun ${SKILL_DIR}/scripts/check-permissions.ts
```

Validate runtime, browser dependencies, clipboard/automation permissions, and credentials.

## Workflow

### Progress Checklist

```text
Publishing Progress:
- [ ] Step 0: Load preferences
- [ ] Step 1: Normalize input type
- [ ] Step 2: Prepare platform-ready payload
- [ ] Step 3: Validate metadata
- [ ] Step 4: Resolve auth and publish method
- [ ] Step 5: Publish
- [ ] Step 6: Completion report
```

### Step 1: Normalize Input

Support:
- html file
- markdown file
- plain text (save then continue)

### Step 2: Prepare Payload

If markdown input:
1. discover markdown-to-html skill
2. convert with explicit theme or style
3. parse returned metadata and asset list

### Step 3: Validate Metadata

Validate required fields:
- title
- summary/description
- cover image (if platform requires)
- author (fallback from CLI -> frontmatter -> EXTEND)

### Step 4: Resolve Auth and Method

Supported methods:
- API (preferred)
- browser automation fallback

Check credentials in:
- `<cwd>/.baoyu-skills/.env`
- `~/.baoyu-skills/.env`

### Step 5: Publish

Execute chosen method and capture:
- publish id / draft id
- link (if available)
- platform response details

### Step 6: Completion Report

Return:
- method used
- target account/platform
- publish status
- output artifact paths

## Troubleshooting

Include a short table: failure symptom -> fix action.

## Extension Support

List configurable defaults in EXTEND.md:
- default publish method
- default author
- theme/style defaults
- comment/reply defaults (if applicable)

