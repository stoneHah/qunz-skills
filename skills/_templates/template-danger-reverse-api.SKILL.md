---
name: <skill-name>
description: <Performs high-risk operations through reverse-engineered or unofficial APIs with explicit user consent and risk disclosure>. Use when user asks to "<trigger-1>", "<trigger-2>", or "<trigger-3>".
---

# <Skill Title>

High-risk capability wrapper. Never run before explicit consent.

## Consent Requirement (REQUIRED)

Before any operation:
1. check consent file
2. verify `accepted: true` and matching `disclaimerVersion`
3. if missing/mismatch, show disclaimer and ask user to accept
4. if declined, stop immediately

### Consent File

Store and read consent file at platform-specific user data location.

Example payload:

```json
{
  "version": 1,
  "accepted": true,
  "acceptedAt": "<ISO timestamp>",
  "disclaimerVersion": "1.0"
}
```

## Disclaimer Template

Include:
- unofficial/reverse-engineered status
- breakage risk
- account/security/legal risk
- no guarantee statement

## Script Directory

Agent execution:
1. `SKILL_DIR` = this SKILL.md directory
2. script path = `${SKILL_DIR}/scripts/main.ts`

## Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
test -f .baoyu-skills/<skill-name>/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/<skill-name>/EXTEND.md" && echo "user"
```

If missing and preferences are required:
- run blocking first-time setup (do not silently create defaults)

## Usage

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts <input>
npx -y bun ${SKILL_DIR}/scripts/main.ts <input> --json
```

## Options

| Option | Description |
|--------|-------------|
| `<input>` | target URL/content/session input |
| `--json` | machine-readable output |
| `--login` | refresh cookies/session only |
| `--dry-run` | validate path and auth only |

## Authentication

Provide two paths:
1. environment variables (preferred)
2. browser/session fallback (if supported)

## Output

Define output file format and path strategy.

## Error Handling

- consent missing -> block and ask
- auth missing/expired -> show recovery steps
- upstream API changed -> surface clear non-retryable error
- retry only transient network failures once

## Extension Support

Document supported EXTEND keys and defaults.

