---
name: baoyu-danger-{tool-name}
description: {功能描述}. Supports {feature-list}. Use as the backend for other skills like {example-skills}.
---

# {Tool Display Name}

{Brief description of what this tool does}.

**Supports**: {list of features}

## ⚠️ Disclaimer (REQUIRED)

**Before using this skill**, the consent check MUST be performed.

### Consent Check Flow

**Step 1**: Check consent file

```bash
# macOS
cat ~/Library/Application\ Support/baoyu-skills/{tool-name}/consent.json 2>/dev/null

# Linux
cat ~/.local/share/baoyu-skills/{tool-name}/consent.json 2>/dev/null

# Windows (PowerShell)
Get-Content "$env:APPDATA\baoyu-skills\{tool-name}\consent.json" 2>$null
```

**Step 2**: If consent exists and `accepted: true` with matching `disclaimerVersion: "1.0"`:

Print warning and proceed:
```
⚠️ Warning: Using {tool description with risks}. Accepted on: <acceptedAt date>
```

**Step 3**: If consent file doesn't exist or `disclaimerVersion` mismatch:

Display disclaimer and ask user:

```
⚠️ DISCLAIMER

This tool {description of what makes it risky - e.g., uses a reverse-engineered API, not official, etc.}.

Risks:
- {Risk 1: e.g., May break without notice if API changes}
- {Risk 2: e.g., No official support or guarantees}
- {Risk 3: e.g., Use at your own risk}

Do you accept these terms and wish to continue?
```

Use `AskUserQuestion` tool with options:
- **Yes, I accept** - Continue and save consent
- **No, I decline** - Exit immediately

**Step 4**: On acceptance, create consent file:

```bash
# macOS
mkdir -p ~/Library/Application\ Support/baoyu-skills/{tool-name}
cat > ~/Library/Application\ Support/baoyu-skills/{tool-name}/consent.json << 'EOF'
{
  "version": 1,
  "accepted": true,
  "acceptedAt": "<ISO timestamp>",
  "disclaimerVersion": "1.0"
}
EOF

# Linux
mkdir -p ~/.local/share/baoyu-skills/{tool-name}
cat > ~/.local/share/baoyu-skills/{tool-name}/consent.json << 'EOF'
{
  "version": 1,
  "accepted": true,
  "acceptedAt": "<ISO timestamp>",
  "disclaimerVersion": "1.0"
}
EOF

# Windows (PowerShell - use appropriate command)
```

**Step 5**: On decline, output message and stop:
```
User declined the disclaimer. Exiting.
```

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | CLI entry point |
| `scripts/utils.ts` | Utility functions |

## Quick Start

```bash
# Basic usage
npx -y bun ${SKILL_DIR}/scripts/main.ts "{example prompt}"

# With options
npx -y bun ${SKILL_DIR}/scripts/main.ts --option value

# Common use cases
npx -y bun ${SKILL_DIR}/scripts/main.ts --help
```

## Commands

### {Command Category 1}

```bash
# Example 1
npx -y bun ${SKILL_DIR}/scripts/main.ts {args}

# Example 2 with options
npx -y bun ${SKILL_DIR}/scripts/main.ts {args} --option value
```

### {Command Category 2}

```bash
# Example 1
npx -y bun ${SKILL_DIR}/scripts/main.ts {args}

# Example 2
npx -y bun ${SKILL_DIR}/scripts/main.ts {args} --flag
```

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--option <value>` | `-o` | Option description | `default` |
| `--flag` | `-f` | Flag description | false |
| `--help` | `-h` | Show help | |

## Authentication

First run opens a browser to authenticate. Credentials are cached for subsequent runs.

**Supported browsers** (auto-detected in order):
- Browser 1
- Browser 2
- Browser 3

Override with environment variables if needed.

```bash
# Force credential refresh
npx -y bun ${SKILL_DIR}/scripts/main.ts --login
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_KEY_VAR` | API key for service | - |
| `DATA_DIR_VAR` | Data directory path | `~/path/to/data` |
| `OTHER_CONFIG` | Other configuration | `default` |

**Load Priority**: CLI args > `process.env` > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

## Proxy Configuration (If Applicable)

If you need a proxy to access services (e.g., in China), set proxy environment variables:

```bash
# Example with local proxy
HTTP_PROXY=http://127.0.0.1:7890 HTTPS_PROXY=http://127.0.0.1:7890 npx -y bun ${SKILL_DIR}/scripts/main.ts "{prompt}"

# Other commands with proxy
HTTP_PROXY=http://127.0.0.1:7890 HTTPS_PROXY=http://127.0.0.1:7890 npx -y bun ${SKILL_DIR}/scripts/main.ts --option value
```

**Note**: Environment variables must be set inline with the command. Shell profile settings may not be inherited by subprocesses.

## Examples

### Basic usage example

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts "{example prompt}"
```

### With options example

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts "{example}" --option value --flag
```

### Complex example

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts \
  --param1 value1 \
  --param2 value2 \
  --output output.txt
```

## Error Handling

- **Missing authentication**: Clear error with setup instructions
- **Rate limiting**: Inform user and suggest retry
- **Network errors**: Auto-retry with exponential backoff
- **Invalid parameters**: Clear error message with usage help

## Extension Support

Custom configurations via EXTEND.md.

**Check paths** (priority order):
1. `.baoyu-skills/{tool-name}/EXTEND.md` (project)
2. `~/.baoyu-skills/{tool-name}/EXTEND.md` (user)

If found, load before workflow. Extension content overrides defaults.
